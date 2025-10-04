// Quick Email System Verification
console.log('📧 Quick Email System Verification\n');

const vars = [
  'BREVO_API_KEY',
  'SMTP_USER',
  'SMTP_PASS',
  'SENDER_EMAIL',
  'INNGEST_EVENT_KEY',
  'SUPPORT_EMAIL'
];

console.log('🔍 Environment Variables Status:');
let allSet = true;

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allSet = false;
  }
});

if (allSet) {
  console.log('\n🎉 ALL VARIABLES ARE SET!');
  console.log('✅ Email system should be working now');
  console.log('✅ Try making a booking to test email sending');
} else {
  console.log('\n🚨 SOME VARIABLES ARE MISSING!');
  console.log('❌ Fix the .env file formatting issues');
  console.log('❌ Restart your server after fixing');
}

console.log('\n📋 Next Steps:');
console.log('1. Fix .env file formatting (remove line breaks)');
console.log('2. Restart your server');
console.log('3. Run this test again');
console.log('4. Test email sending with a booking');
