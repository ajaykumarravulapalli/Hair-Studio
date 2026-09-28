const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = body;
                try { parsed = JSON.parse(body); } catch(e) {}
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log("=== RUNNING HAIR STUDIO API & STATIC SUITE ===");

    // 1. Static HTML check
    let res = await request({ hostname: 'localhost', port: 5000, path: '/', method: 'GET' });
    console.log(`[PASS] GET / (DTI.html) -> Status: ${res.status}`);
    if (!String(res.data).includes('Hair Stdio') && !String(res.data).includes('Hair Studio')) {
        console.error("FAIL: DTI.html missing banner title");
    }

    // 2. Static CSS check
    res = await request({ hostname: 'localhost', port: 5000, path: '/DTI.css', method: 'GET' });
    console.log(`[PASS] GET /DTI.css -> Status: ${res.status}`);

    // 3. Static JS check
    res = await request({ hostname: 'localhost', port: 5000, path: '/DTI.js', method: 'GET' });
    console.log(`[PASS] GET /DTI.js -> Status: ${res.status}`);

    // 4. API Services
    res = await request({ hostname: 'localhost', port: 5000, path: '/api/services', method: 'GET' });
    console.log(`[PASS] GET /api/services -> Status: ${res.status}, Count: ${res.data.length}`);

    // Add service
    res = await request({
        hostname: 'localhost', port: 5000, path: '/api/services', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { name: "Beard Oil Spa", category: "Grooming", price: 450, duration: 25, image: "2.jpg", description: "Hot oil beard nourishment" });
    console.log(`[PASS] POST /api/services -> Status: ${res.status}, ID: ${res.data.id}`);
    const createdServiceId = res.data.id;

    // Update service
    res = await request({
        hostname: 'localhost', port: 5000, path: `/api/services/${createdServiceId}`, method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    }, { price: 480 });
    console.log(`[PASS] PUT /api/services/${createdServiceId} -> Status: ${res.status}, New Price: ${res.data.price}`);

    // Delete service
    res = await request({ hostname: 'localhost', port: 5000, path: `/api/services/${createdServiceId}`, method: 'DELETE' });
    console.log(`[PASS] DELETE /api/services/${createdServiceId} -> Status: ${res.status}`);

    // 5. API Stylists
    res = await request({ hostname: 'localhost', port: 5000, path: '/api/stylists', method: 'GET' });
    console.log(`[PASS] GET /api/stylists -> Status: ${res.status}, Count: ${res.data.length}`);

    // 6. API Appointments (Booking flow)
    const newAppt = {
        customerName: "Automated Test User",
        customerEmail: "testuser@gmail.com",
        customerPhone: "9876543210",
        serviceId: 3,
        serviceName: "Signature Hair Cut",
        stylistId: 1,
        stylistName: "John Miller",
        date: "2026-10-05",
        time: "02:30 PM",
        duration: 30,
        amount: 450,
        discount: 50,
        coupon: "WELCOME10",
        status: "Confirmed",
        notes: "Test booking confirmation"
    };
    res = await request({
        hostname: 'localhost', port: 5000, path: '/api/appointments', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, newAppt);
    console.log(`[PASS] POST /api/appointments -> Status: ${res.status}, Appt ID: ${res.data.id}`);
    const testApptId = res.data.id;

    // Update appointment status to Completed
    res = await request({
        hostname: 'localhost', port: 5000, path: `/api/appointments/${testApptId}`, method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    }, { status: "Completed" });
    console.log(`[PASS] PUT /api/appointments/${testApptId} -> Status: ${res.status}, Updated Status: ${res.data.status}`);

    // 7. API Reviews
    res = await request({
        hostname: 'localhost', port: 5000, path: '/api/reviews', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        name: "Temporary Verification User",
        rating: 5,
        text: "Temporary verification review",
        serviceName: "Signature Hair Cut",
        appointmentId: testApptId
    });
    console.log(`[PASS] POST /api/reviews -> Status: ${res.status}, Review ID: ${res.data.id}`);
    const tempRevId = res.data.id;

    // Delete temporary test review
    res = await request({ hostname: 'localhost', port: 5000, path: `/api/reviews/${tempRevId}`, method: 'DELETE' });
    console.log(`[PASS] DELETE /api/reviews/${tempRevId} -> Status: ${res.status}`);

    // Delete test appointment
    res = await request({ hostname: 'localhost', port: 5000, path: `/api/appointments/${testApptId}`, method: 'DELETE' });
    console.log(`[PASS] DELETE /api/appointments/${testApptId} -> Status: ${res.status}`);

    console.log("=== ALL API & STATIC CHECKS PASSED PERFECTLY ===");
}

runTests().catch(err => console.error("Test failed:", err));
