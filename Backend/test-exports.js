// Simple test script to verify server setup
// Run with: node test-server.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testServer() {
  console.log('🧪 Testing MetroExecuCare API Server...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test 2: Test registration
    console.log('2️⃣ Testing user registration...');
    const registerData = {
      email: `test.${Date.now()}@example.com`,
      password: 'TestPass123!',
      first_name: 'Test',
      last_name: 'User',
      department: 'IT',
      position: 'Developer',
      contact_number: '+63-917-123-4567',
      role: 'executive'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.data.user.email);
    const token = registerResponse.data.data.token;
    console.log('');

    // Test 3: Test login
    console.log('3️⃣ Testing login with seeded admin...');
    const loginData = {
      email: 'admin@metroexecucare.com',
      password: 'MetroAdmin123!'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.data.user.role);
    const adminToken = loginResponse.data.data.token;
    console.log('');

    // Test 4: Test profile retrieval
    console.log('4️⃣ Testing profile retrieval...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.data.user.email);
    console.log('');

    // Test 5: Test user list (admin only)
    console.log('5️⃣ Testing user list (admin)...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Users list retrieved:', usersResponse.data.data.users.length, 'users found');
    console.log('');

    console.log('🎉 All tests passed! Your API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('URL:', error.config.url);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if server is running: npm run dev');
    console.log('2. Verify database connection');
    console.log('3. Check if routes are properly imported');
    console.log('4. Ensure all environment variables are set');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testServer();
}

module.exports = { testServer };