#!/usr/bin/env node

/**
 * Quick Test Script for Authentication Fixes
 * Tests the key endpoints that were failing
 */

const API_BASE = 'http://localhost:8000/api/v1'

// Test credentials (replace with actual test credentials)
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'testpassword123'

let authToken = null

// Utility function to make requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    ...options.headers,
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  console.log(`\n${options.method || 'GET'} ${endpoint}`)
  console.log(`Headers:`, headers)
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  console.log(`Status: ${response.status} ${response.statusText}`)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log(`❌ Error: ${errorText}`)
    return null
  }
  
  try {
    const data = await response.json()
    console.log(`✅ Success:`, JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    const text = await response.text()
    console.log(`✅ Success: ${text}`)
    return text
  }
}

// Test 1: Authentication
async function testAuth() {
  console.log('\n=== Test 1: Authentication ===')
  
  const response = await makeRequest('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  })
  
  if (response && response.token) {
    authToken = response.token
    console.log('✅ Authentication successful')
    return true
  } else {
    console.log('❌ Authentication failed')
    return false
  }
}

// Test 2: Upload Spec (Simple)
async function testUploadSpec() {
  console.log('\n=== Test 2: Upload Spec (Simple) ===')
  
  if (!authToken) {
    console.log('❌ No auth token available')
    return false
  }
  
  // Create a simple text file for testing
  const fileContent = 'This is a test spec file content.'
  const file = new Blob([fileContent], { type: 'text/plain' })
  
  const formData = new FormData()
  formData.append('file', file, 'test-spec.txt')
  
  const response = await makeRequest('/specs/specs', {
    method: 'POST',
    body: formData
  })
  
  if (response) {
    console.log('✅ Spec upload successful')
    return true
  } else {
    console.log('❌ Spec upload failed')
    return false
  }
}

// Test 3: Upload Spec with Metadata
async function testUploadSpecWithMetadata() {
  console.log('\n=== Test 3: Upload Spec with Metadata ===')
  
  if (!authToken) {
    console.log('❌ No auth token available')
    return false
  }
  
  // Create a simple text file for testing
  const fileContent = 'This is a test spec file with metadata.'
  const file = new Blob([fileContent], { type: 'text/plain' })
  
  const formData = new FormData()
  formData.append('file', file, 'test-spec-with-metadata.txt')
  formData.append('name', 'Test Spec with Metadata')
  formData.append('version', '1.0.0')
  formData.append('description', 'This is a test spec with metadata')
  
  const response = await makeRequest('/specs/projects/1/specs', {
    method: 'POST',
    body: formData
  })
  
  if (response) {
    console.log('✅ Spec upload with metadata successful')
    return true
  } else {
    console.log('❌ Spec upload with metadata failed')
    return false
  }
}

// Test 4: Test without Authentication (should fail)
async function testWithoutAuth() {
  console.log('\n=== Test 4: Test without Authentication ===')
  
  // Temporarily remove auth token
  const tempToken = authToken
  authToken = null
  
  const response = await makeRequest('/specs/projects/1/specs')
  
  // Restore auth token
  authToken = tempToken
  
  if (!response) {
    console.log('✅ Correctly rejected request without authentication')
    return true
  } else {
    console.log('❌ Request should have been rejected without authentication')
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Testing Authentication Fixes')
  console.log('================================')
  
  const tests = [
    { name: 'Authentication', fn: testAuth },
    { name: 'Upload Spec (Simple)', fn: testUploadSpec },
    { name: 'Upload Spec with Metadata', fn: testUploadSpecWithMetadata },
    { name: 'Test without Auth', fn: testWithoutAuth }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message)
      failed++
    }
  }
  
  console.log('\n================================')
  console.log('📊 Test Results')
  console.log('================================')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The fixes are working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the implementation.')
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testAuth,
  testUploadSpec,
  testUploadSpecWithMetadata,
  testWithoutAuth,
  runTests
} 