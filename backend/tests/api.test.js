/**
 * API Test Suite
 * 
 * Validates endpoints for Auth, Equipment, and Bookings.
 */

import assert from 'assert';
import app from '../src/app.js';
import http from 'http';

const server = http.createServer(app);
const PORT = 5099;

server.listen(PORT, async () => {
  console.log(`[Test Runner] Test server started on port ${PORT}`);

  try {
    // 1. Test Health Endpoint
    console.log('Testing GET /api/health...');
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'healthy');
    console.log('✓ Health check passed');

    // 2. Test Equipment Catalog
    console.log('Testing GET /api/equipment...');
    const equipRes = await fetch(`http://localhost:${PORT}/api/equipment`);
    const equipData = await equipRes.json();
    assert.strictEqual(equipRes.status, 200);
    assert.strictEqual(equipData.success, true);
    assert(Array.isArray(equipData.data));
    assert(equipData.data.length > 0);
    console.log(`✓ Equipment catalog query passed (${equipData.data.length} apparatus returned)`);

    // 3. Test Booking Creation
    console.log('Testing POST /api/bookings...');
    const bookingPayload = {
      patientName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 555-0123',
      departmentId: 'cardiology',
      departmentName: 'Cardiology Ward',
      doctorId: 'dr-scott',
      doctorName: 'Dr. Scott Lang',
      date: '2026-12-01',
      time: '11:00 AM',
      visitType: 'in-person',
      reason: 'Routine checkup'
    };

    const bookRes = await fetch(`http://localhost:${PORT}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    const bookData = await bookRes.json();
    assert.strictEqual(bookRes.status, 201);
    assert.strictEqual(bookData.success, true);
    assert(bookData.data.bookingId);
    console.log(`✓ Booking creation passed (ID: ${bookData.data.bookingId})`);

    // 4. Test 404 handler
    console.log('Testing 404 Not Found handler...');
    const notFoundRes = await fetch(`http://localhost:${PORT}/api/non-existent-route`);
    assert.strictEqual(notFoundRes.status, 404);
    console.log('✓ 404 handler passed');

    console.log('\n========================================');
    console.log('ALL API TESTS PASSED SUCCESSFULLY! ✓');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
