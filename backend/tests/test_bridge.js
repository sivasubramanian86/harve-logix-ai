import axios from 'axios';

const testAgent = async () => {
    try {
        console.log('--- Testing HarvestReady Agent via REST API ---');
        const payload = {
            farmerId: "siva-86",
            cropType: "tomato",
            growthStage: 4,
            phenologyData: {},
            marketPrices: {},
            weatherForecast: {}
        };
        
        console.log('Sending Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/agents/harvest-ready', payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
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

testAgent();
