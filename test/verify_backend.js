const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testVerification() {
    const baseUrl = { hostname: 'localhost', port: 5000 };
    const testId = 'TEST-CERT-' + Date.now();
    const testCert = {
        id: testId,
        name: 'Test Student',
        degree: 'Testing',
        graduationYear: '2026',
        fileName: 'test_certificate.pdf'
    };

    try {
        console.log('1. Saving test certificate...');
        const saveRes = await request({
            ...baseUrl,
            path: '/api/certificates',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, testCert);
        console.log('✅ Response:', saveRes.statusCode);

        console.log('\n2. Verifying by ID...');
        const resId = await request({ ...baseUrl, path: `/api/certificates/${testId}`, method: 'GET' });
        if (resId.data.data.id === testCert.id) {
            console.log('✅ ID verification success.');
        } else {
            console.log('❌ ID verification failed.');
        }

        console.log('\n3. Verifying by FileName...');
        const resFile = await request({ ...baseUrl, path: `/api/certificates/${encodeURIComponent(testCert.fileName)}`, method: 'GET' });
        if (resFile.data.data.fileName === testCert.fileName) {
            console.log('✅ FileName verification success.');
        } else {
            console.log('❌ FileName verification failed.');
        }

    } catch (error) {
        console.error('❌ Test failed (Is backend running?):', error.message);
    }
}

testVerification();
