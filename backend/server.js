const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// ── DB Helpers ────────────────────────────────────────────────────────────────
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        const init = { users: [], certificates: [], verifications: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
        return init;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
};
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

// ── Seed demo accounts if not already present ─────────────────────────────────
const seedDemoAccounts = () => {
    const db = readDB();
    if (!db.users) db.users = [];
    if (!db.certificates) db.certificates = [];
    if (!db.verifications) db.verifications = [];

    const demoUsers = [
        {
            id: 'demo-inst-001', name: 'Admin User', orgName: 'IIT Bombay',
            orgType: 'institution', email: 'admin@iitbombay.edu',
            password: hashPassword('demo1234'), role: 'institution',
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-org-001', name: 'HR Manager', orgName: 'Google Inc.',
            orgType: 'organization', email: 'hr@google.com',
            password: hashPassword('demo1234'), role: 'organization',
            createdAt: new Date().toISOString()
        }
    ];

    demoUsers.forEach(demo => {
        if (!db.users.some(u => u.email === demo.email)) {
            db.users.push(demo);
        }
    });
    writeDB(db);
};

seedDemoAccounts();

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', (req, res) => {
    const { name, orgName, orgType, email, password } = req.body;
    if (!name || !orgName || !orgType || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!['institution', 'organization'].includes(orgType)) {
        return res.status(400).json({ error: 'Invalid organisation type.' });
    }

    const db = readDB();
    if (!db.users) db.users = [];

    if (db.users.some(u => u.email === email)) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const newUser = {
        id: 'user-' + Date.now(),
        name, orgName, orgType, email,
        password: hashPassword(password),
        role: orgType,
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ message: 'Account created!', user: safeUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const db = readDB();
    if (!db.users) return res.status(404).json({ error: 'No users found.' });

    const user = db.users.find(u => u.email === email && u.password === hashPassword(password));
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login successful!', user: safeUser });
});

// ── CERTIFICATE ROUTES ────────────────────────────────────────────────────────

// Save new certificate
app.post('/api/certificates', (req, res) => {
    const { id, name, degree, graduationYear, finalGrade, issuer, ipfsCid, status } = req.body;
    if (!id || !name) return res.status(400).json({ error: "Certificate ID and Student Name are required." });

    const db = readDB();
    if (!db.verifications) db.verifications = [];

    if (db.certificates.some(cert => cert.id === id)) {
        return res.status(409).json({ error: "Certificate ID already exists in the database." });
    }

    const newCert = {
        id, name, degree, graduationYear, finalGrade, issuer, ipfsCid,
        status: status || 'Confirmed',
        timestamp: new Date().toISOString()
    };

    db.certificates.push(newCert);
    writeDB(db);
    res.status(201).json({ message: "Certificate saved successfully!", data: newCert });
});

// Get all certificates
app.get('/api/certificates', (req, res) => {
    const db = readDB();
    res.json({ data: [...db.certificates].reverse() });
});

// Verify certificate by ID (also logs the event)
app.get('/api/certificates/:id', (req, res) => {
    const db = readDB();
    if (!db.verifications) db.verifications = [];

    const cert = db.certificates.find(c => c.id === req.params.id);
    if (!cert) return res.status(404).json({ error: "Certificate not found." });

    db.verifications.push({
        certId: cert.id,
        studentName: cert.name,
        timestamp: new Date().toISOString(),
        status: 'Valid'
    });
    writeDB(db);

    res.json({ data: cert });
});

// Analytics stats
app.get('/api/stats', (req, res) => {
    const db = readDB();
    const verifications = db.verifications || [];
    const certificates = db.certificates || [];

    const monthlyMap = {};
    verifications.forEach(v => {
        const month = new Date(v.timestamp).toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const verificationActivity = monthOrder
        .filter(m => monthlyMap[m])
        .map(m => ({ name: m, verifications: monthlyMap[m] }));

    const degreeMap = {};
    certificates.forEach(c => {
        const key = (c.degree || 'Other').split(' ')[0];
        degreeMap[key] = (degreeMap[key] || 0) + 1;
    });
    const degreeDistribution = Object.entries(degreeMap).map(([name, value]) => ({ name, value }));

    res.json({
        totalIssued: certificates.length,
        totalVerifications: verifications.length,
        uniqueVerifiers: new Set(verifications.map(v => v.certId)).size,
        revoked: certificates.filter(c => c.status === 'Revoked').length,
        totalUsers: (db.users || []).length,
        institutionCount: (db.users || []).filter(u => u.role === 'institution').length,
        orgCount: (db.users || []).filter(u => u.role === 'organization').length,
        verificationActivity: verificationActivity.length > 0 ? verificationActivity : [
            { name: 'Jan', verifications: 400 }, { name: 'Feb', verifications: 300 },
            { name: 'Mar', verifications: 600 }, { name: 'Apr', verifications: 800 },
            { name: 'May', verifications: 500 }, { name: 'Jun', verifications: 900 }
        ],
        degreeDistribution: degreeDistribution.length > 0 ? degreeDistribution : [
            { name: 'B.Tech', value: 400 }, { name: 'MBA', value: 300 },
            { name: 'M.Tech', value: 300 }, { name: 'B.Sc', value: 200 }
        ],
        recentCerts: certificates.slice(-5).reverse()
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 TrustCert API running on http://localhost:${PORT}`);
    console.log(`\n📋 Demo Accounts:`);
    console.log(`   Institution: admin@iitbombay.edu / demo1234`);
    console.log(`   Company:     hr@google.com / demo1234\n`);
});
