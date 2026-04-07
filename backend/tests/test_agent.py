import sys
import os
sys.path.append(os.path.abspath('backend'))
from agents.strands_analysis_agent import StrandsAnalysisAgent, AnalysisContext
import json
import logging

logging.basicConfig(level=logging.INFO)

def run_test():
    print("Initializing StrandsAnalysisAgent...")
    agent = StrandsAnalysisAgent()
    
    context = AnalysisContext(
        farmer_id='farmer_1234',
        region='Karnataka',
        crop_type='Tomato',
        timeframe='Next 3 months',
        analysis_type='Yield Optimization'
    )
    
    print(f"Context initialized: {context.to_dict()}")
    print("Running analysis... This might take a few moments.")
    
    try:
        result = agent.analyze(context)
        print("--- ANALYSIS COMPLETE ---")
        print(f"Status: {result.status}")
        print(f"Confidence Score: {result.confidence_score}")
        print(f"Insights: {json.dumps(result.insights, indent=2)}")
        print(f"Recommendations: {json.dumps(result.recommendations, indent=2)}")
        if getattr(result, 'reasoning', None):
            print(f"--- RAW REASONING ---")
            print(result.reasoning)
            print(f"---------------------")
        print(f"Metrics: {json.dumps(result.metrics, indent=2)}")
        if result.error:
            print(f"Error: {result.error}")
    except Exception as e:
        print(f"Test failed with exception: {e}")

if __name__ == '__main__':
    run_test()
