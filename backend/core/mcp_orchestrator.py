"""
Strands MCP Orchestrator Integration
Orchestrates multi-agent workflows and task coordination using AWS EventBridge and SQS
Integrates with HarveLogix agents for automated reasoning and decision-making
"""

import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from enum import Enum

import boto3

# MCP-like interfaces (simplified; adapt to actual Strands MCP SDK if available)
logger = logging.getLogger(__name__)

eventbridge = boto3.client('events')
sqs = boto3.client('sqs')
dynamodb = boto3.resource('dynamodb')


class TaskStatus(Enum):
    """Task lifecycle states"""
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    FAILED = 'failed'
    PAUSED = 'paused'


class Agent(Enum):
    """Registered agents in the system"""
    HARVEST_READY = 'harvest-ready'
    WATER_WISE = 'water-wise'
    SUPPLY_MATCH = 'supply-match'
    STORAGE_SCOUT = 'storage-scout'
    QUALITY_HUB = 'quality-hub'
    COLLECTIVE_VOICE = 'collective-voice'


class MCPTask:
    """Represents a task in the MCP workflow"""

    def __init__(
        self,
        task_id: str,
        agent: Agent,
        input_data: Dict[str, Any],
        depends_on: Optional[List[str]] = None,
        timeout_seconds: int = 300,
    ):
        """Initialize MCP task"""
        self.task_id = task_id
        self.agent = agent
        self.input_data = input_data
        self.depends_on = depends_on or []
        self.timeout_seconds = timeout_seconds
        self.status = TaskStatus.PENDING
        self.output = None
        self.error = None
        self.created_at = datetime.utcnow().isoformat()
        self.started_at = None
        self.completed_at = None

    def to_dict(self) -> Dict[str, Any]:
        """Serialize task to dictionary"""
        return {
            'task_id': self.task_id,
            'agent': self.agent.value,
            'input_data': self.input_data,
            'depends_on': self.depends_on,
            'status': self.status.value,
            'output': self.output,
            'error': self.error,
            'created_at': self.created_at,
            'started_at': self.started_at,
            'completed_at': self.completed_at,
        }


class MCPWorkflow:
    """Represents a multi-agent workflow"""

    def __init__(self, workflow_id: str, name: str):
        """Initialize workflow"""
        self.workflow_id = workflow_id
        self.name = name
        self.tasks: Dict[str, MCPTask] = {}
        self.status = TaskStatus.PENDING
        self.created_at = datetime.utcnow().isoformat()

    def add_task(self, task: MCPTask) -> None:
        """Add task to workflow"""
        self.tasks[task.task_id] = task
        logger.info(f"Added task {task.task_id} to workflow {self.workflow_id}")

    def get_ready_tasks(self) -> List[MCPTask]:
        """Get tasks that are ready to execute (dependencies satisfied)"""
        ready = []

        for task in self.tasks.values():
            if task.status != TaskStatus.PENDING:
                continue

            # Check if all dependencies are completed
            all_deps_complete = all(
                self.tasks[dep_id].status == TaskStatus.COMPLETED
                for dep_id in task.depends_on
            )

            if all_deps_complete:
                ready.append(task)

        return ready

    def update_task_status(self, task_id: str, status: TaskStatus, output: Optional[Dict] = None, error: Optional[str] = None) -> None:
        """Update task status"""
        if task_id not in self.tasks:
            logger.warning(f"Task {task_id} not found in workflow")
            return

        task = self.tasks[task_id]
        task.status = status

        if status == TaskStatus.IN_PROGRESS:
            task.started_at = datetime.utcnow().isoformat()
        elif status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
            task.completed_at = datetime.utcnow().isoformat()

        if output:
            task.output = output
        if error:
            task.error = error

        logger.info(f"Updated task {task_id} status to {status.value}")

    def is_complete(self) -> bool:
        """Check if workflow is complete"""
        return all(
            task.status in (TaskStatus.COMPLETED, TaskStatus.FAILED)
            for task in self.tasks.values()
        )

    def to_dict(self) -> Dict[str, Any]:
        """Serialize workflow to dictionary"""
        return {
            'workflow_id': self.workflow_id,
            'name': self.name,
            'status': self.status.value,
            'created_at': self.created_at,
            'tasks': {task_id: task.to_dict() for task_id, task in self.tasks.items()},
        }


class MemoryStore:
    """Simple persistent key/value store using DynamoDB for agent memory."""

    def __init__(self, table_name: str):
        self.table = dynamodb.Table(table_name)

    def put(self, key: str, data: Any, ttl_seconds: Optional[int] = None) -> None:
        item = {'memory_key': key, 'data': data}
        if ttl_seconds:
            item['ttl'] = int(datetime.utcnow().timestamp()) + ttl_seconds
        try:
            self.table.put_item(Item=item)
            logger.info(f"Stored memory for key {key}")
        except Exception as e:
            logger.error(f"Error writing memory: {e}")

    def get(self, key: str) -> Optional[Any]:
        try:
            resp = self.table.get_item(Key={'memory_key': key})
            item = resp.get('Item')
            if item:
                return item.get('data')
            return None
        except Exception as e:
            logger.error(f"Error reading memory: {e}")
            return None


class MCPOrchestrator:
    """Orchestrates multi-agent workflows"""

    def __init__(self, state_table_name: str, memory_table_name: Optional[str] = None, event_bus_name: str = 'default'):
        """Initialize orchestrator"""
        self.state_table = dynamodb.Table(state_table_name)
        self.memory_store = MemoryStore(memory_table_name) if memory_table_name else None
        self.event_bus_name = event_bus_name
        self.workflows: Dict[str, MCPWorkflow] = {}

    # convenience wrappers for persistent memory
    def remember(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Store a piece of memory (short or long term)"""
        if self.memory_store:
            self.memory_store.put(key, value, ttl_seconds)
    
    def recall(self, key: str) -> Optional[Any]:
        """Retrieve previously stored memory"""
        if self.memory_store:
            return self.memory_store.get(key)
        return None

    def create_workflow(self, name: str) -> MCPWorkflow:
        """Create a new workflow"""
        workflow_id = f"wf-{datetime.utcnow().timestamp()}"
        workflow = MCPWorkflow(workflow_id, name)
        self.workflows[workflow_id] = workflow
        logger.info(f"Created workflow: {workflow_id}")
        return workflow

    def dispatch_event(self, task: MCPTask, event_type: str) -> None:
        """Dispatch task event to EventBridge"""
        try:
            event = {
                'Source': 'harvelogix.agents',
                'DetailType': event_type,
                'Detail': json.dumps({
                    'task_id': task.task_id,
                    'agent': task.agent.value,
                    'input_data': task.input_data,
                    'timestamp': datetime.utcnow().isoformat(),
                }),
                'EventBusName': self.event_bus_name,
            }

            eventbridge.put_events(Entries=[event])
            logger.info(f"Dispatched event {event_type} for task {task.task_id}")
        except Exception as e:
            logger.error(f"Error dispatching event: {e}")

    def save_workflow_state(self, workflow: MCPWorkflow) -> None:
        """Persist workflow state to DynamoDB"""
        try:
            self.state_table.put_item(
                Item={
                    'agent_id': workflow.workflow_id,
                    'timestamp': int(datetime.utcnow().timestamp()),
                    'workflow_data': workflow.to_dict(),
                    'ttl': int(datetime.utcnow().timestamp()) + 86400,  # 24h TTL
                }
            )
            logger.info(f"Saved workflow state: {workflow.workflow_id}")
        except Exception as e:
            logger.error(f"Error saving workflow state: {e}")

    def update_task_result(
        self,
        workflow_id: str,
        task_id: str,
        status: TaskStatus,
        output: Optional[Any] = None,
        error: Optional[str] = None,
    ) -> Optional[MCPWorkflow]:
        """Update a single task's result and optionally resume workflow.

        This helper loads the workflow state, updates the specified task
        status/output/error, saves the state, and returns the updated
        workflow object.  Callers may then invoke `execute_workflow_step`
        to continue orchestration.
        """
        wf = self.load_workflow_state(workflow_id)
        if not wf:
            logger.warning(f"Cannot update task; workflow {workflow_id} not found")
            return None

        task = wf.tasks.get(task_id)
        if not task:
            logger.warning(f"Task {task_id} not found in workflow {workflow_id}")
            return wf

        task.status = status
        if output is not None:
            task.output = output
        if error is not None:
            task.error = error

        # save new state
        self.save_workflow_state(wf)
        return wf

    def load_workflow_state(self, workflow_id: str) -> Optional[MCPWorkflow]:
        """Load workflow state from DynamoDB and reconstruct objects."""
        try:
            logger.info(f"Loading workflow state: {workflow_id}")
            resp = self.state_table.get_item(Key={'agent_id': workflow_id})
            item = resp.get('Item')
            if not item:
                logger.warning(f"No state found for workflow {workflow_id}")
                return None

            data = item.get('workflow_data', {})
            if not data:
                logger.warning(f"Empty workflow_data for {workflow_id}")
                return None

            # Reconstruct workflow
            wf = MCPWorkflow(data['workflow_id'], data.get('name', ''))
            wf.status = TaskStatus(data.get('status', TaskStatus.PENDING.value))
            wf.created_at = data.get('created_at')

            tasks_dict = data.get('tasks', {})
            for tid, tinfo in tasks_dict.items():
                task = MCPTask(
                    task_id=tinfo['task_id'],
                    agent=Agent(tinfo['agent']),
                    input_data=tinfo.get('input_data', {}),
                    depends_on=tinfo.get('depends_on', []),
                    timeout_seconds=tinfo.get('timeout_seconds', 300),
                )
                task.status = TaskStatus(tinfo.get('status', TaskStatus.PENDING.value))
                task.output = tinfo.get('output')
                task.error = tinfo.get('error')
                task.created_at = tinfo.get('created_at')
                task.started_at = tinfo.get('started_at')
                task.completed_at = tinfo.get('completed_at')
                wf.add_task(task)

            # Cache in memory for quick access
            self.workflows[workflow_id] = wf
            return wf
        except Exception as e:
            logger.error(f"Error loading workflow state: {e}")
            return None


def create_harvest_workflow(farmer_id: str, crop_type: str, growth_stage: int, location: Dict, memory_table: Optional[str] = None) -> MCPWorkflow:
    """Create a harvest optimization workflow"""
    orchestrator = MCPOrchestrator(
        state_table_name='harvelogix-agent-state-dev',
        memory_table_name=memory_table,
        event_bus_name='default'
    )
    # example: store last-harvest-date memory for this farmer
    if orchestrator.memory_store:
        orchestrator.remember(f"{farmer_id}:last_harvest", datetime.utcnow().isoformat(), ttl_seconds=30*24*3600)

    workflow = orchestrator.create_workflow(f"harvest-{farmer_id}-{crop_type}")

    # Task 1: Analyze harvest readiness
    task1 = MCPTask(
        task_id='task-harvest-analysis',
        agent=Agent.HARVEST_READY,
        input_data={
            'farmer_id': farmer_id,
            'crop_type': crop_type,
            'current_growth_stage': growth_stage,
            'location': location,
        },
        timeout_seconds=60,
    )

    # Task 2: Check water/irrigation (depends on task 1)
    task2 = MCPTask(
        task_id='task-water-analysis',
        agent=Agent.WATER_WISE,
        input_data={
            'farmer_id': farmer_id,
            'crop_type': crop_type,
            'location': location,
        },
        depends_on=['task-harvest-analysis'],
        timeout_seconds=60,
    )

    # Task 3: Find buyers/supply chain (depends on task 1)
    task3 = MCPTask(
        task_id='task-supply-match',
        agent=Agent.SUPPLY_MATCH,
        input_data={
            'farmer_id': farmer_id,
            'crop_type': crop_type,
            'harvest_timing': '{}',  # Will be filled after task 1
            'location': location,
        },
        depends_on=['task-harvest-analysis'],
        timeout_seconds=60,
    )

    # Add tasks to workflow
    workflow.add_task(task1)
    workflow.add_task(task2)
    workflow.add_task(task3)

    # Save workflow state
    orchestrator.save_workflow_state(workflow)

    return workflow


def execute_workflow_step(workflow: MCPWorkflow, orchestrator: MCPOrchestrator) -> None:
    """Execute ready tasks in the workflow"""
    ready_tasks = workflow.get_ready_tasks()

    for task in ready_tasks:
        logger.info(f"Executing task: {task.task_id}")

        # Dispatch task to appropriate agent via EventBridge
        orchestrator.dispatch_event(task, 'agent.task.initiated')

        # Update task status
        workflow.update_task_status(task.task_id, TaskStatus.IN_PROGRESS)

    # Save updated state
    orchestrator.save_workflow_state(workflow)


# Lambda handler for workflow execution
def lambda_handler(event, context):
    """Handle SQS message for workflow orchestration"""
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        orchestrator = MCPOrchestrator(
            state_table_name='harvelogix-agent-state-dev'
        )

        # If a task completion event is received, update the workflow
        # before attempting to resume.  Agents should send
        # {workflow_id, task_id, status, output?, error?} once they finish.
        workflow = None
        if 'workflow_id' in event and 'task_id' in event:
            logger.info(f"Received task update for {event['task_id']} in {event['workflow_id']}")
            workflow = orchestrator.update_task_result(
                event['workflow_id'],
                event['task_id'],
                TaskStatus(event.get('status', TaskStatus.COMPLETED.value)),
                output=event.get('output'),
                error=event.get('error'),
            )
            if workflow:
                logger.info(f"Resuming workflow {workflow.workflow_id} after task update")
                execute_workflow_step(workflow, orchestrator)
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'workflow_id': workflow.workflow_id,
                        'status': workflow.status.value,
                    }),
                }

        # If workflow_id is provided without task_id, just resume state
        if 'workflow_id' in event:
            workflow = orchestrator.load_workflow_state(event['workflow_id'])
            if workflow:
                logger.info(f"Resuming workflow {workflow.workflow_id}")
                execute_workflow_step(workflow, orchestrator)
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'workflow_id': workflow.workflow_id,
                        'status': workflow.status.value,
                    }),
                }

        # Parse workflow creation request
        if 'workflow_type' in event:
            if event['workflow_type'] == 'harvest':
                workflow = create_harvest_workflow(
                    farmer_id=event.get('farmer_id'),
                    crop_type=event.get('crop_type'),
                    growth_stage=event.get('growth_stage'),
                    location=event.get('location'),
                )

                # Execute workflow steps
                execute_workflow_step(workflow, orchestrator)

                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'workflow_id': workflow.workflow_id,
                        'status': 'started',
                    }),
                }

        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Unknown workflow type or ID'}),
        }

    except Exception as e:
        logger.error(f"Error in workflow execution: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
        }
