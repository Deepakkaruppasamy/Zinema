// Quick DeepAI status checker
async function checkDeepAIStatus() {
    console.log('🔍 Checking DeepAI status...\n');
    
    try {
        const response = await fetch('https://zinema-clvk.onrender.com/api/deepai/health');
        const data = await response.json();
        
        console.log('📡 Response Status:', response.status);
        console.log('📊 Health Data:', data);
        
        if (data.hasApiKey) {
            console.log('\n✅ SUCCESS: DeepAI is properly configured!');
            console.log('🎉 Your 502 errors should now be fixed.');
            
            // Test actual chat
            console.log('\n🧪 Testing chat functionality...');
            const chatResponse = await fetch('https://zinema-clvk.onrender.com/api/deepai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', text: 'Hello, test message' }],
                    user: {}
                })
            });
            
            if (chatResponse.ok) {
                const chatData = await chatResponse.json();
                console.log('✅ Chat test successful!');
                console.log('💬 Response preview:', chatData.text?.substring(0, 100) + '...');
            } else {
                console.log('❌ Chat test failed:', chatResponse.status);
            }
            
        } else {
            console.log('\n❌ ISSUE: API key is not configured');
            console.log('📝 Please follow the setup steps:');
            console.log('   1. Get API key from: https://makersuite.google.com/app/apikey');
            console.log('   2. Add GEMINI_API_KEY to Render environment variables');
            console.log('   3. Wait for redeploy to complete');
        }
        
    } catch (error) {
        console.log('\n💥 Connection error:', error.message);
        console.log('🔧 Make sure your server is running and deployed');
    }
}

// Run the check
checkDeepAIStatus();
