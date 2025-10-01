// Test script to verify deepai endpoint
import fetch from 'node-fetch';

const BASE_URL = 'https://zinema-clvk.onrender.com';

async function testDeepAIEndpoint() {
  console.log('Testing DeepAI endpoint...');
  
  try {
    // Test if server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    console.log('Server health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Server response:', healthData);
    }
    
    // Test deepai endpoint
    console.log('\n2. Testing DeepAI assistant endpoint...');
    const deepaiResponse = await fetch(`${BASE_URL}/api/deepai/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', text: 'Hello' }],
        user: {}
      })
    });
    
    console.log('DeepAI endpoint status:', deepaiResponse.status);
    
    if (deepaiResponse.ok) {
      const deepaiData = await deepaiResponse.json();
      console.log('DeepAI response:', deepaiData);
    } else {
      const errorText = await deepaiResponse.text();
      console.log('DeepAI error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDeepAIEndpoint();
