import axios from 'axios';

const testVisualAgent = async () => {
    try {
        console.log('--- Testing QualityHub (Visual) Agent via REST API ---');
        const payload = {
            farmerId: 'siva-86',
            cropType: 'tomato',
            imageS3Uri: 's3://harvelogix-020513638290-multimodal-dev-020513638290/multimodal/crop-health/2026-04-03/15f6b0c0-370b-4b20-bb7f-aa047c675fb4.png',
            farmerPhoto: 's3://harvelogix-020513638290-multimodal-dev-020513638290/multimodal/crop-health/2026-04-03/15f6b0c0-370b-4b20-bb7f-aa047c675fb4.png',
            batchSizeKg: 100
        };
        
        console.log('Sending Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/agents/quality-hub', payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });
        
        console.log('--- Success Response ---');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('--- Test Failed ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

testVisualAgent();
