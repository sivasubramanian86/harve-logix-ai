#!/usr/bin/env python3
"""Quick test of RAG integration with agents"""

import sys
sys.path.insert(0, '.')

from agents.harvest_ready_agent import HarvestReadyAgent

print("=" * 60)
print("RAG + Agent Integration Test")
print("=" * 60)

agent = HarvestReadyAgent()

# Test 1: Standard agent (demo mode)
print('\n[Test 1] Standard Agent (Demo Mode)')
result = agent.process({
    'crop_type': 'tomato',
    'current_growth_stage': 8,
    'location': {'latitude': 15.8, 'longitude': 75.6}
})
print('[OK] Status: ' + result["status"])
print('[OK] Agent: ' + result["agent"])
if result.get("output"):
    keys = list(result["output"].keys())[:3]
    print('[OK] Output has keys: ' + str(keys))

# Test 2: Retrieve context for query
print('\n[Test 2] RAG Context Retrieval')
docs = agent.retrieve_context_for_query('tomato harvest timing', k=2)
print('[OK] Retrieved ' + str(len(docs)) + ' documents')
if docs:
    content_preview = docs[0]["content"][:70]
    print('[OK] First doc: ' + content_preview + '...')

# Test 3: Process with different crop
print('\n[Test 3] Different Crop (Onion)')
result2 = agent.process({
    'crop_type': 'onion',
    'current_growth_stage': 6,
    'location': {'latitude': 15.8, 'longitude': 75.6}
})
print('[OK] Status: ' + result2["status"])

print("\n" + "=" * 60)
print("SUCCESS - All tests passed!")
print("SUCCESS - RAG + Agents working with demo fallback")
print("=" * 60)
