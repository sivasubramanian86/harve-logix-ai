#!/usr/bin/env python3
"""Test script to verify Bedrock model invocation with inference profile."""

import os
import sys

# Ensure we're in the backend directory
sys.path.insert(0, os.path.dirname(__file__))

# Set correct AWS region (overrides environment)
os.environ['AWS_REGION'] = 'ap-south-2'

from core.bedrock_client import BedrockClient

def main():
    client = BedrockClient()
    print(f"Model: {client.model_id}")
    print(f"Region: {client.region}")
    print("\n" + "="*60)
    print("Testing Bedrock Inference Profile Invocation")
    print("="*60)
    
    try:
        print("\nCalling invoke_model()...")
        response = client.invoke_model(
            "What are the top 3 crops grown in Punjab, India?",
            "You are an agricultural expert with knowledge of Indian farming."
        )
        print(f"\n✓ SUCCESS! Got response from Bedrock:\n")
        print(response)
        return 0
        
    except Exception as e:
        error_str = str(e)
        print(f"\n✗ Error occurred:\n{error_str}\n")
        
        # Check error type
        if 'INVALID_PAYMENT_INSTRUMENT' in error_str or 'Marketplace' in error_str:
            print("⏳ Status: Marketplace subscription still syncing")
            print("Expected wait: 2-15 minutes after payment method was added")
            print("\nNext steps:")
            print("  1. Wait a few more minutes")
            print("  2. Run this test again")
            print("  3. Check AWS console for subscription status")
            return 1
        else:
            print("This is a different error. Check details above.")
            return 2

if __name__ == '__main__':
    sys.exit(main())
