"""
Tests for persistent memory and workflow persistence in MCP orchestrator.
"""

import sys
from pathlib import Path
from datetime import datetime

# Add backend to path
# Ensure the directory containing the `backend` package is on sys.path.
# Use absolute resolved path so that the import works regardless of
# current working directory (workspace root or backend/).
base_dir = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(base_dir))

import pytest  # type: ignore[import]  (installed in virtualenv)

from core.mcp_orchestrator import (
    MemoryStore,
    MCPOrchestrator,
    create_harvest_workflow,
    TaskStatus,
    execute_workflow_step,
    lambda_handler,
)


class FakeTable:
    def __init__(self):
        self.storage = {}

    def put_item(self, Item):
        self.storage[Item.get('memory_key') or Item.get('agent_id')] = Item

    def get_item(self, Key):
        key = Key.get('memory_key') or Key.get('agent_id')
        if key in self.storage:
            return {'Item': self.storage[key]}
        return {}


class FakeDynamoDBResource:
    def __init__(self):
        self.tables = {}

    def Table(self, name):
        if name not in self.tables:
            self.tables[name] = FakeTable()
        return self.tables[name]


@pytest.fixture(autouse=True)
def patch_dynamodb(monkeypatch):
    """Replace boto3 dynamodb resource with a fake in-memory implementation."""
    fake = FakeDynamoDBResource()
    # the orchestrator module is loaded as core.mcp_orchestrator
    monkeypatch.setattr('core.mcp_orchestrator.dynamodb', fake)
    return fake


def test_memory_store_put_get():
    ms = MemoryStore('some-table')
    # basic put/get
    ms.put('foo', 'bar')
    assert ms.get('foo') == 'bar'

    # nonexistent key returns None
    assert ms.get('not-a-key') is None


def test_orchestrator_memory_helpers():
    orch = MCPOrchestrator(state_table_name='stateA', memory_table_name='memA')
    # memory store should be initialized
    assert orch.memory_store is not None
    orch.remember('k1', 'v1', ttl_seconds=10)
    assert orch.recall('k1') == 'v1'

    # orchestrator without memory table should return None
    orch2 = MCPOrchestrator(state_table_name='stateB')
    assert orch2.memory_store is None
    assert orch2.recall('k1') is None


def test_save_and_load_workflow():
    # create a harvest workflow which will save state
    wf = create_harvest_workflow(
        farmer_id='farmerX',
        crop_type='rice',
        growth_stage=2,
        location={'latitude': 0.0, 'longitude': 0.0},
        memory_table='memA',
    )

    orch = MCPOrchestrator(state_table_name='harvelogix-agent-state-dev', memory_table_name='memA')
    loaded = orch.load_workflow_state(wf.workflow_id)
    assert loaded is not None
    assert loaded.workflow_id == wf.workflow_id
    # tasks should have been restored
    assert 'task-harvest-analysis' in loaded.tasks
    assert 'task-water-analysis' in loaded.tasks
    assert 'task-supply-match' in loaded.tasks

    # non-existing workflow returns None
    assert orch.load_workflow_state('does-not-exist') is None


def test_update_task_and_resume(monkeypatch):
    """Verify that updating a task result persists and allows resumption."""
    # create workflow and store state (dynamodb fixture is applied automatically)
    wf = create_harvest_workflow(
        farmer_id='farmerY',
        crop_type='potato',
        growth_stage=3,
        location={'latitude': 1.0, 'longitude': 2.0},
        memory_table='memA',
    )

    orch = MCPOrchestrator(state_table_name='harvelogix-agent-state-dev', memory_table_name='memA')

    # load and check initial state
    wf_loaded = orch.load_workflow_state(wf.workflow_id)
    assert wf_loaded.tasks['task-harvest-analysis'].status == TaskStatus.PENDING

    # simulate task completion
    orch.update_task_result(
        wf.workflow_id,
        'task-harvest-analysis',
        TaskStatus.COMPLETED,
        output={'foo': 'bar'},
    )

    wf_updated = orch.load_workflow_state(wf.workflow_id)
    assert wf_updated.tasks['task-harvest-analysis'].status == TaskStatus.COMPLETED
    assert wf_updated.tasks['task-harvest-analysis'].output == {'foo': 'bar'}

    # resume workflow and ensure dependent tasks move forward
    execute_workflow_step(wf_updated, orch)
    assert wf_updated.tasks['task-water-analysis'].status == TaskStatus.IN_PROGRESS
    assert wf_updated.tasks['task-supply-match'].status == TaskStatus.IN_PROGRESS


def test_lambda_handler_completion_event():
    """The lambda handler should process a task completion event correctly."""
    orch = MCPOrchestrator(state_table_name='harvelogix-agent-state-dev')
    wf = create_harvest_workflow(
        farmer_id='farmerZ',
        crop_type='maize',
        growth_stage=4,
        location={'latitude': 0, 'longitude': 0},
        memory_table=None,
    )

    # simulate event from an agent for task1
    ev = {
        'workflow_id': wf.workflow_id,
        'task_id': 'task-harvest-analysis',
        'status': TaskStatus.COMPLETED.value,
        'output': {'foo': 'bar'},
    }

    resp = lambda_handler(ev, None)
    assert resp['statusCode'] == 200

    # load state and ensure task status updated
    wf2 = orch.load_workflow_state(wf.workflow_id)
    assert wf2.tasks['task-harvest-analysis'].status == TaskStatus.COMPLETED
    # and next tasks should be queued when we call lambda with same event again
    # (orchestra_handler already executed steps)
    # status should be at least IN_PROGRESS
    assert wf2.tasks['task-water-analysis'].status == TaskStatus.IN_PROGRESS
