# 🛡️ TrustCert — Blockchain Certificate Portal

> A full-stack decentralised platform for issuing, managing, and verifying academic certificates on the **Polygon Amoy** blockchain.

---

## ✨ Features

### 🏛️ Institutions (Admin Role)
- Issue certificates on-chain with one click
- PDF generation with QR code embedded
- Bulk upload via CSV
- Real-time analytics dashboard  
- Revoke credentials

### 🏢 Companies / Organisations (Verifier Role)
- **Verify by ID / Name / Code** — type any reference code
- **Verify by PDF** — upload a certificate PDF and auto-extract the ID
- **Camera QR Scanner** — scan the QR code printed on the cert using device camera
- Download verified certificate PDFs
- PolygonScan blockchain link for on-chain proof

### 🔐 Role-Based Auth
- Separate login / registration for Institutions vs Companies
- Session persistence via localStorage
- SHA-256 hashed passwords on backend
- Demo accounts included for quick testing

---

## 🗂️ Project Structure

```
blockchain-portal/
├── backend/               # Express.js REST API
│   ├── server.js          # All routes: auth, certificates, analytics
│   └── database.json      # Runtime JSON database (git-ignored)
│
├── frontend/              # React + Vite SPA
│   └── src/
│       ├── components/
│       │   ├── AuthPage.jsx          # Login / Register (split panel)
│       │   ├── AdminPortal.jsx       # Institution: issue certificates
│       │   ├── VerificationPortal.jsx # Org: verify by ID / PDF / QR
│       │   ├── GraduateWallet.jsx    # Org: view issued credentials
│       │   ├── Analytics.jsx         # Institution: live stats
│       │   ├── Hero.jsx              # Public landing page
│       │   └── Footer.jsx
│       ├── context/
│       │   ├── AuthContext.jsx       # Auth state + role management
│       │   └── BlockchainContext.jsx # MetaMask + ethers.js
│       └── App.jsx                   # Role-guarded routing
│
├── contracts/
│   └── TrustCert.sol      # Solidity smart contract
├── hardhat.config.js
├── start.bat              # One-click start (Windows)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MetaMask](https://metamask.io/) browser extension
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/blockchain-portal.git
cd blockchain-portal
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start the application

**Windows** — double-click `start.bat`

**Or manually:**
```bash
# Terminal 1 — backend
cd backend
node server.js

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**  
Backend API runs at: **http://localhost:5000**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🎓 Institution (IIT Bombay) | `admin@iitbombay.edu` | `demo1234` |
| 💼 Company (Google Inc.) | `hr@google.com` | `demo1234` |

---

## 🔄 Usage Flow

```
Institution logs in → Issues Certificate → PDF + QR generated → Saved to DB
                                                                       ↓
Company logs in → Verify by ID / Upload PDF / Scan QR → Result + Download PDF
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Framer Motion, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | JSON file (easily swappable to MongoDB) |
| Blockchain | Solidity, Hardhat, Ethers.js, Polygon Amoy |
| Auth | SHA-256 hashed passwords, localStorage sessions |
| PDF | jsPDF, html2canvas |
| QR Scanner | html5-qrcode |
| PDF Parsing | pdfjs-dist |

---

## 📜 Smart Contract

The `TrustCert.sol` contract is deployed on **Polygon Amoy Testnet**.

To compile and deploy:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy
```

---

## 📄 License

MIT © 2026 TrustCert
