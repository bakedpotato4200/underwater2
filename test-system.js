#!/usr/bin/env node

/**
 * Under Water 2 - Full System Test Suite
 * Tests all major features: Auth, Profile, Transactions, Calendar, Settings
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';
let testToken = null;
let testUserId = null;
let testResults = { passed: 0, failed: 0, errors: [] };

const log = {
  test: (name) => console.log(`\n📋 Testing: ${name}`),
  pass: (msg) => { console.log(`  ✅ ${msg}`); testResults.passed++; },
  fail: (msg) => { console.log(`  ❌ ${msg}`); testResults.failed++; },
  error: (msg, err) => { console.error(`  ⚠️  ${msg}:`, err.message); testResults.errors.push(msg); }
};

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (testToken) options.headers['Authorization'] = `Bearer ${testToken}`;
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

// ========================================
// 1. AUTHENTICATION TESTS
// ========================================
async function testAuth() {
  log.test('Authentication Flow');

  // Signup
  try {
    const email = `test${Date.now()}@test.com`;
    const password = 'TestPass123!';
    const { status, data } = await apiCall('/auth/signup', 'POST', { email, password });
    
    if (status === 201 && data.token) {
      log.pass(`Signup successful for ${email}`);
      testToken = data.token;
      testUserId = data.userId;
    } else {
      log.fail(`Signup failed (status ${status})`);
    }
  } catch (err) {
    log.error('Signup test', err);
  }

  // Verify token
  try {
    const { status, data } = await apiCall('/auth/verify', 'GET');
    if (status === 200 && data.userId) {
      log.pass('Token verification successful');
    } else {
      log.fail(`Token verification failed (status ${status})`);
    }
  } catch (err) {
    log.error('Verify test', err);
  }
}

// ========================================
// 2. PROFILE TESTS
// ========================================
async function testProfile() {
  log.test('Profile Management');

  // Get profile
  try {
    const { status, data } = await apiCall('/auth/profile', 'GET');
    if (status === 200 && data.user) {
      log.pass('Profile fetched successfully');
    } else {
      log.fail(`Profile fetch failed (status ${status})`);
    }
  } catch (err) {
    log.error('Profile fetch', err);
  }

  // Update profile
  try {
    const { status, data } = await apiCall('/auth/profile', 'PUT', { name: 'Test User' });
    if (status === 200) {
      log.pass('Profile name updated');
    } else {
      log.fail(`Profile update failed (status ${status})`);
    }
  } catch (err) {
    log.error('Profile update', err);
  }

  // Change password
  try {
    const { status, data } = await apiCall('/auth/change-password', 'POST', { 
      currentPassword: 'TestPass123!',
      newPassword: 'NewPass456!' 
    });
    if (status === 200) {
      log.pass('Password changed successfully');
    } else {
      log.fail(`Password change failed (status ${status}): ${data.error || 'unknown'}`);
    }
  } catch (err) {
    log.error('Password change', err);
  }
}

// ========================================
// 3. STARTING BALANCE TESTS
// ========================================
async function testStartingBalance() {
  log.test('Starting Balance Management');

  // Set starting balance
  try {
    const { status, data } = await apiCall('/starting-balance', 'POST', { startingBalance: 5000 });
    if (status === 200 || status === 201) {
      log.pass('Starting balance set to $5000');
    } else {
      log.fail(`Starting balance set failed (status ${status})`);
    }
  } catch (err) {
    log.error('Set starting balance', err);
  }

  // Get starting balance
  try {
    const { status, data } = await apiCall('/starting-balance', 'GET');
    if (status === 200 && data.startingBalance === 5000) {
      log.pass('Starting balance retrieved correctly');
    } else {
      log.fail(`Starting balance mismatch: ${data.startingBalance}`);
    }
  } catch (err) {
    log.error('Get starting balance', err);
  }
}

// ========================================
// 4. PAYCHECK SETTINGS TESTS
// ========================================
async function testPaycheckSettings() {
  log.test('Paycheck Settings Management');

  // Create paycheck setting
  try {
    const { status, data } = await apiCall('/paycheck-settings', 'POST', {
      payAmount: 2000,
      frequency: 'bi-weekly',
      startDate: '2025-11-01'
    });
    if (status === 201 && data._id) {
      log.pass('Paycheck setting created');
      var paycheckId = data._id;
    } else {
      log.fail(`Paycheck creation failed (status ${status})`);
    }
  } catch (err) {
    log.error('Create paycheck', err);
  }

  // Get paycheck settings
  try {
    const { status, data } = await apiCall('/paycheck-settings', 'GET');
    if (status === 200 && Array.isArray(data)) {
      log.pass(`Retrieved ${data.length} paycheck settings`);
    } else {
      log.fail(`Get paycheck failed (status ${status})`);
    }
  } catch (err) {
    log.error('Get paycheck settings', err);
  }
}

// ========================================
// 5. RECURRING ITEMS TESTS
// ========================================
async function testRecurring() {
  log.test('Recurring Items Management');

  // Create recurring item
  try {
    const { status, data } = await apiCall('/recurring', 'POST', {
      name: 'Monthly Rent',
      type: 'expense',
      amount: 1200,
      dayOfMonth: 1
    });
    if (status === 201 && data._id) {
      log.pass('Recurring item created');
      var recurringId = data._id;
    } else {
      log.fail(`Recurring creation failed (status ${status})`);
    }
  } catch (err) {
    log.error('Create recurring', err);
  }

  // Get recurring items
  try {
    const { status, data } = await apiCall('/recurring', 'GET');
    if (status === 200 && Array.isArray(data)) {
      log.pass(`Retrieved ${data.length} recurring items`);
    } else {
      log.fail(`Get recurring failed (status ${status})`);
    }
  } catch (err) {
    log.error('Get recurring', err);
  }

  // Update recurring item
  if (recurringId) {
    try {
      const { status, data } = await apiCall(`/recurring/${recurringId}`, 'PUT', {
        name: 'Monthly Rent Updated',
        amount: 1300
      });
      if (status === 200) {
        log.pass('Recurring item updated');
      } else {
        log.fail(`Recurring update failed (status ${status})`);
      }
    } catch (err) {
      log.error('Update recurring', err);
    }
  }
}

// ========================================
// 6. TRANSACTIONS TESTS
// ========================================
async function testTransactions() {
  log.test('Transactions Management');

  let transactionId = null;

  // Create transaction
  try {
    const { status, data } = await apiCall('/transactions', 'POST', {
      type: 'income',
      name: 'Test Payment',
      amount: 1500,
      date: new Date(),
      projected: false
    });
    if (status === 200) {
      log.pass('Transaction created');
      transactionId = data._id;
    } else {
      log.fail(`Transaction creation failed (status ${status})`);
    }
  } catch (err) {
    log.error('Create transaction', err);
  }

  // Get transactions
  try {
    const { status, data } = await apiCall('/transactions', 'GET');
    if (status === 200 && Array.isArray(data)) {
      log.pass(`Retrieved ${data.length} transactions`);
    } else {
      log.fail(`Get transactions failed (status ${status})`);
    }
  } catch (err) {
    log.error('Get transactions', err);
  }

  // Delete transaction
  if (transactionId) {
    try {
      const { status, data } = await apiCall(`/transactions/${transactionId}`, 'DELETE');
      if (status === 200) {
        log.pass('Transaction deleted successfully');
      } else {
        log.fail(`Transaction delete failed (status ${status})`);
      }
    } catch (err) {
      log.error('Delete transaction', err);
    }
  }
}

// ========================================
// 7. CALENDAR TESTS
// ========================================
async function testCalendar() {
  log.test('Calendar Data');

  // Get monthly calendar
  try {
    const { status, data } = await apiCall('/calendar/month?year=2025&month=11', 'GET');
    if (status === 200 && data.days) {
      log.pass(`Calendar loaded for Nov 2025 with ${data.days.length} days`);
    } else {
      log.fail(`Calendar fetch failed (status ${status})`);
    }
  } catch (err) {
    log.error('Calendar monthly', err);
  }

  // Get yearly forecast
  try {
    const { status, data } = await apiCall('/calendar/year?year=2025', 'GET');
    if (status === 200 && data) {
      log.pass('Yearly forecast retrieved');
    } else {
      log.fail(`Yearly forecast failed (status ${status})`);
    }
  } catch (err) {
    log.error('Calendar yearly', err);
  }
}

// ========================================
// 8. ERROR HANDLING TESTS
// ========================================
async function testErrorHandling() {
  log.test('Error Handling & Edge Cases');

  // Invalid token
  try {
    const savedToken = testToken;
    testToken = 'invalid-token-xyz';
    const { status, data } = await apiCall('/auth/profile', 'GET');
    if (status === 401) {
      log.pass('Invalid token properly rejected');
    } else {
      log.fail(`Invalid token not rejected (status ${status})`);
    }
    testToken = savedToken;
  } catch (err) {
    log.error('Invalid token test', err);
  }

  // Missing required fields
  try {
    const { status, data } = await apiCall('/recurring', 'POST', { name: 'Incomplete' });
    if (status !== 201) {
      log.pass('Incomplete recurring item rejected');
    } else {
      log.fail('Incomplete recurring item was accepted');
    }
  } catch (err) {
    log.error('Incomplete data test', err);
  }

  // Negative amount validation
  try {
    const { status, data } = await apiCall('/transactions', 'POST', {
      type: 'expense',
      name: 'Invalid',
      amount: -100,
      date: new Date()
    });
    if (status !== 200 || data.error) {
      log.pass('Negative amount rejected');
    } else {
      log.fail('Negative amount was accepted');
    }
  } catch (err) {
    log.error('Negative amount test', err);
  }
}

// ========================================
// FRONTEND TESTS
// ========================================
async function testFrontend() {
  log.test('Frontend Loading');

  try {
    const res = await fetch('http://localhost:5000/');
    if (res.status === 200) {
      const html = await res.text();
      if (html.includes('Under Water') && html.includes('app-shell')) {
        log.pass('Frontend loads correctly');
      } else {
        log.fail('Frontend missing expected elements');
      }
    } else {
      log.fail(`Frontend returned status ${res.status}`);
    }
  } catch (err) {
    log.error('Frontend load', err);
  }
}

// ========================================
// MAIN TEST RUNNER
// ========================================
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  Under Water 2 - Full System Test Suite      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    await testAuth();
    await testProfile();
    await testStartingBalance();
    await testPaycheckSettings();
    await testRecurring();
    await testTransactions();
    await testCalendar();
    await testErrorHandling();
    await testFrontend();
  } catch (err) {
    console.error('Test suite error:', err);
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  Test Results Summary                         ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered:`);
    testResults.errors.forEach(err => console.log(`  - ${err}`));
  }

  const total = testResults.passed + testResults.failed;
  const percentage = total > 0 ? Math.round((testResults.passed / total) * 100) : 0;
  
  console.log(`\n📊 Success Rate: ${percentage}% (${testResults.passed}/${total})`);
  
  if (percentage === 100) {
    console.log('\n🎉 All tests passed! System is fully functional.\n');
  } else if (percentage >= 80) {
    console.log('\n⚠️  Most tests passed but some issues found.\n');
  } else {
    console.log('\n🔴 Multiple failures detected. Review errors above.\n');
  }

  process.exit(percentage === 100 ? 0 : 1);
}

runAllTests();
