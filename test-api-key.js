// Test your Gemini API key locally
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyAw5KOWC-_4_t4TVagYL6Fz1qwzgQE5dqY';
const MODEL = 'gemini-2.0-flash';

async function testGeminiAPI() {
    console.log('🧪 Testing your Gemini API key...\n');
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: 'Hello, this is a test message. Please respond briefly.' }]
                }]
            })
        });
        
        console.log('📡 Response Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text';
            
            console.log('✅ SUCCESS! Your API key works perfectly!');
            console.log('🤖 Gemini Response:', text.substring(0, 100) + '...');
            console.log('\n🎉 You can now add this key to Render with confidence!');
            
        } else {
            const errorText = await response.text();
            console.log('❌ API Key Error:', response.status);
            console.log('📝 Error Details:', errorText);
            
            if (response.status === 403) {
                console.log('\n💡 Possible issues:');
                console.log('   - API key might be invalid');
                console.log('   - Quota might be exceeded');
                console.log('   - API might not be enabled');
            } else if (response.status === 404) {
                console.log('\n💡 Model name issue - but our fix handles this');
            }
        }
        
    } catch (error) {
        console.log('💥 Connection Error:', error.message);
    }
}

testGeminiAPI();
