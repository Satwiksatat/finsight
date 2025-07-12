#!/usr/bin/env node

/**
 * Test script for Dify API connection
 * Usage: node scripts/test-api.js
 */

const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const DIFY_API_URL = process.env.DIFY_API_URL || 'http://172.16.3.123:80';
const DIFY_APP_ID = process.env.DIFY_APP_ID;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

console.log('🔍 Testing Dify API connection...');
console.log(`URL: ${DIFY_API_URL}`);
console.log(`App ID: ${DIFY_APP_ID || 'NOT SET'}`);
console.log(`API Key: ${DIFY_API_KEY ? DIFY_API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
console.log('');

if (!DIFY_API_KEY) {
  console.error('❌ DIFY_API_KEY not found in environment variables');
  console.log('Please set DIFY_API_KEY in your .env.local file');
  process.exit(1);
}

if (!DIFY_APP_ID) {
  console.error('❌ DIFY_APP_ID not found in environment variables');
  console.log('Please set DIFY_APP_ID in your .env.local file');
  process.exit(1);
}

function testApiConnection() {
  const url = new URL(DIFY_API_URL);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  const postData = JSON.stringify({
    inputs: {},
    query: 'Hello, this is a test message',
    response_mode: 'blocking',
    user: 'test-user',
    app_id: DIFY_APP_ID
  });

  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: '/v1/chat-messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = client.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Response:');
        console.log(JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n🎉 API connection successful!');
          console.log('✅ App ID is working');
          console.log('✅ API Key is valid');
          console.log('✅ Endpoint is accessible');
        } else {
          console.log('\n⚠️  API responded but with non-200 status');
        }
      } catch (error) {
        console.log('📄 Raw Response:');
        console.log(data);
        console.log('\n⚠️  Could not parse JSON response');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API Connection Error:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your Dify instance is running');
      console.log('2. Verify the DIFY_API_URL is correct');
      console.log('3. Ensure the port is accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the DIFY_API_URL hostname is correct');
    }
  });

  req.write(postData);
  req.end();
}

// Test title generation API
function testTitleGeneration() {
  console.log('\n🔍 Testing Title Generation API...');
  
  const url = new URL(DIFY_API_URL);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  const postData = JSON.stringify({
    inputs: {},
    query: 'Test conversation about financial analysis',
    response_mode: 'blocking',
    user: 'system-title-generator',
    app_id: DIFY_APP_ID
  });

  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: '/v1/chat-messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = client.request(options, (res) => {
    console.log(`📡 Title API Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200 && response.answer) {
          console.log('✅ Title generation working!');
          console.log(`📝 Generated title: "${response.answer}"`);
        } else {
          console.log('⚠️  Title generation failed or returned unexpected response');
          console.log('Response:', response);
        }
      } catch (error) {
        console.log('⚠️  Could not parse title generation response');
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Title Generation API Error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the tests
testApiConnection();
setTimeout(testTitleGeneration, 2000); // Wait 2 seconds before testing title generation 