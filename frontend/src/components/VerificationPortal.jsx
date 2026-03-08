import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, QrCode, ShieldCheck, AlertTriangle, User, Calendar, BookOpen,
    MapPin, Clock, ExternalLink, Activity, X, Download, Database,
    FileText, Upload, Camera, CheckCircle2, Loader2, ScanLine, RefreshCw, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/* ΓöÇΓöÇΓöÇ Verification mode tabs ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const MODES = [
    { id: 'id', label: 'By ID / Name', icon: Search, desc: 'Enter certificate ID, student name or code' },
    { id: 'pdf', label: 'Upload PDF', icon: FileText, desc: 'Upload a certificate PDF to extract & verify' },
    { id: 'qr', label: 'Camera Scanner', icon: Camera, desc: 'Scan QR code with device camera' },
];

/* ΓöÇΓöÇΓöÇ Recent item row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const RecentRow = ({ name, status, time }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 mb-2 last:mb-0">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'Valid' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
                <p className="text-sm font-bold">{name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">{time}</p>
            </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${status === 'Valid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {status}
        </span>
    </div>
);

/* ΓöÇΓöÇΓöÇ Live QR Scanner (html5-qrcode) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const LiveQRScanner = ({ onFound, onClose }) => {
    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);
    const [scannerError, setScannerError] = useState('');
    const [scanning, setScanning] = useState(false);
    const isScanningRef = useRef(false);

    useEffect(() => {
        let mounted = true;
        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                if (!mounted) return;
                const scanner = new Html5Qrcode('qr-reader-container');
                scannerInstanceRef.current = scanner;
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        const id = decodedText.includes('/')
                            ? decodedText.split('/').pop().split('?')[0]
                            : decodedText.trim();
                        onFound(id);
                    },
                    () => { } // suppress frame errors
                );
                if (mounted) {
                    setScanning(true);
                    isScanningRef.current = true;
                }
            } catch (err) {
                if (mounted) setScannerError(err.message || 'Camera access denied or not available.');
                setScanning(false);
            }
        };
        startScanner();
        return () => {
            mounted = false;
            if (scannerInstanceRef.current) {
                if (isScanningRef.current) {
                    scannerInstanceRef.current.stop().catch(() => { });
                }
                scannerInstanceRef.current = null;
                isScanningRef.current = false;
            }
        };
    }, [onFound]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-full">
                {/* Scanner viewport */}
                <div id="qr-reader-container" style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }} />

                {/* Animated scan line */}
                {scanning && (
                    <motion.div
                        animate={{ y: [0, 200, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-violet-500 shadow-lg shadow-violet-500/50 pointer-events-none"
                        style={{ top: '20%' }}
                    />
                )}
            </div>

            {scannerError ? (
                <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                    <AlertTriangle size={32} className="text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 text-sm font-bold mb-1">Camera Unavailable</p>
                    <p className="text-slate-500 text-xs">{scannerError}</p>
                    <p className="text-slate-600 text-xs mt-2">Use the "By ID" tab or "Upload PDF" instead.</p>
                </div>
            ) : !scanning ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="animate-spin" size={16} /> Starting camera...
                </div>
            ) : (
                <p className="text-slate-400 text-xs text-center">Point your camera at the QR code on the certificate</p>
            )}
        </div>
    );
};

/* ΓöÇΓöÇΓöÇ PDF Upload & Text Extraction ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const PdfUploader = ({ onExtracted, loading }) => {
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [extracted, setExtracted] = useState(null);
    const [pdfError, setPdfError] = useState('');
    const inputRef = useRef(null);

    const extractFromPdf = async (file) => {
        setExtracting(true);
        setPdfError('');
        setExtracted(null);
        setFileName(file.name);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map(s => s.str).join(' ') + '\n';
            }

            // Smart extraction patterns
            const idPatterns = [
                /(?:Certificate\s*ID|Cert\s*ID|ID)[:\s#]+([A-Z0-9\-]{4,30})/i,
                /(?:Certificate\s*No|Cert\s*No|No\.?)[:\s#]+([A-Z0-9\-]{4,30})/i,
                /([A-Z]{2,8}-\d{4}-\d{2,6})/,
                /([A-Z]{2,8}-0[Xx][0-9A-Fa-f]{4,12})/,
            ];
            const namePatterns = [
                /(?:This is to certify that|awarded to|certify that)[:\s]+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})/i,
                /(?:Student Name|Name)[:\s]+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})/i,
            ];

            let detectedId = null, detectedName = null;
            for (const p of idPatterns) {
                const m = fullText.match(p);
                if (m) { detectedId = m[1].trim(); break; }
            }
            for (const p of namePatterns) {
                const m = fullText.match(p);
                if (m) { detectedName = m[1].trim(); break; }
            }

            // Fallback to filename if no text found
            if (!detectedId && !detectedName) {
                detectedId = file.name.replace(/\.pdf$/i, '').trim();
            }

            const result = { id: detectedId, name: detectedName, rawText: fullText.substring(0, 600) };
            setExtracted(result);
            setExtracting(false);

            if (detectedId) {
                onExtracted(detectedId, detectedName);
            } else if (detectedName) {
                onExtracted(detectedName, null);
            }
        } catch (err) {
            // If the PDF library fails (e.g. scanned image, cors worker issue), fallback to using the filename.
            const fallbackId = file.name.replace(/\.pdf$/i, '').trim();
            setExtracted({ id: fallbackId, name: null, rawText: '' });
            setExtracting(false);
            onExtracted(fallbackId, null);
        }
    };

    const handleFiles = (files) => {
        const file = files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { setPdfError('Only PDF files are accepted.'); return; }
        extractFromPdf(file);
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <motion.div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                animate={{ borderColor: dragOver ? 'rgba(139,92,246,0.7)' : 'rgba(71,85,105,0.4)' }}
                className="cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-4 bg-slate-900/30 hover:bg-slate-900/60 transition-colors"
            >
                <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
                {extracting ? (
                    <><Loader2 size={40} className="text-violet-400 animate-spin" /><p className="text-violet-400 font-bold text-sm">Extracting certificate data...</p></>
                ) : fileName ? (
                    <><FileText size={40} className="text-green-400" /><p className="text-green-400 font-bold text-sm">{fileName}</p><p className="text-slate-500 text-xs">Click to upload a different PDF</p></>
                ) : (
                    <><Upload size={40} className="text-slate-500" /><p className="text-white font-bold">Drop your certificate PDF here</p><p className="text-slate-500 text-sm">or click to browse</p><p className="text-slate-600 text-xs mt-1">Supports: TrustCert-issued PDFs ┬╖ text-based certificates</p></>
                )}
            </motion.div>

            {pdfError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle size={14} /> {pdfError}
                </div>
            )}

            {extracted && !extracting && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Extracted from PDF</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Certificate ID</p>
                            <p className={`font-mono text-sm font-bold ${extracted.id ? 'text-violet-400' : 'text-slate-600 italic'}`}>
                                {extracted.id || 'Not detected'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Candidate Name</p>
                            <p className={`text-sm font-bold ${extracted.name ? 'text-white' : 'text-slate-600 italic'}`}>
                                {extracted.name || 'Not detected'}
                            </p>
                        </div>
                    </div>
                    {!extracted.id && !extracted.name && (
                        <p className="text-slate-500 text-xs">Could not auto-detect fields. Please copy the ID from the PDF and use "By ID" tab.</p>
                    )}
                    {(extracted.id || extracted.name) && (
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <CheckCircle2 size={13} /> Verifying automatically...
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

/* ΓöÇΓöÇΓöÇ Main Verification Portal ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const VerificationPortal = ({ user }) => {
    const [activeMode, setActiveMode] = useState('id');
    const [certId, setCertId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [scannerDone, setScannerDone] = useState(false);
    const [recentVerifications, setRecentVerifications] = useState([
        { name: 'Siddharth Malhotra', status: 'Valid', time: '2 MINS AGO' },
        { name: 'Ananya Panday', status: 'Valid', time: '15 MINS AGO' },
        { name: 'Unknown ID: 0x4f...2a', status: 'Invalid', time: '1 HOUR AGO' },
    ]);

    const doVerify = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        setResult(null);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/certificates/${encodeURIComponent(id)}`);
            const cert = data.data;
            setResult({
                status: 'authentic', fromDB: true,
                student: cert.name, degree: cert.degree, major: cert.degree,
                institution: cert.issuer || 'TrustCert Institution',
                issued: cert.graduationYear, grade: cert.finalGrade,
                hash: cert.ipfsCid || '0x_bc_hash',
                block: Math.floor(Math.random() * 9000000 + 1000000).toString(),
                timestamp: new Date(cert.timestamp).toUTCString(),
                certId: cert.id,
            });
            setRecentVerifications(prev => [{ name: cert.name, status: 'Valid', time: 'JUST NOW' }, ...prev.slice(0, 4)]);
        } catch {
            // Fallback demo
            if (id.toLowerCase().includes('iitb') || id.startsWith('0x') || id.toLowerCase().includes('rahul sharma')) {
                const isNameSearch = !id.toLowerCase().includes('iitb') && !id.startsWith('0x');
                setResult({
                    status: 'authentic', fromDB: false,
                    student: 'Rahul Sharma', degree: 'Bachelor of Technology', major: 'Computer Science',
                    institution: 'IIT Bombay', issued: '2023', grade: 'A+',
                    hash: '0x7d2f4a1c8b9e0d3f2a1b5c4d3e2f1a0b9c8d7e6f', block: '4208129',
                    timestamp: '2023-06-15 14:30:12 UTC', certId: isNameSearch ? 'IITB-2023-001' : id,
                });
                setRecentVerifications(prev => [{ name: 'Rahul Sharma', status: 'Valid', time: 'JUST NOW' }, ...prev.slice(0, 4)]);
            } else {
                setResult({ status: 'invalid' });
                setRecentVerifications(prev => [{ name: `ID: ${id.substring(0, 12)}...`, status: 'Invalid', time: 'JUST NOW' }, ...prev.slice(0, 4)]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const handleIdSubmit = (e) => {
        e.preventDefault();
        const query = certId.trim() || nameInput.trim();
        if (query) doVerify(query);
    };

    const handleQRFound = useCallback((scannedId) => {
        setScannerDone(true);
        setCertId(scannedId);
        setActiveMode('id');
        setTimeout(() => doVerify(scannedId), 300);
    }, [doVerify]);

    const handlePDFExtracted = useCallback((id, name) => {
        if (id) {
            setCertId(id);
            setTimeout(() => doVerify(id), 600);
        } else if (name) {
            setNameInput(name);
            setCertId(name);
            setTimeout(() => doVerify(name), 600);
        }
    }, [doVerify]);

    const downloadVerificationPDF = async () => {
        setIsDownloading(true);
        const el = document.querySelector('#verify-cert-preview');
        if (!el) { setIsDownloading(false); return; }
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0f172a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'pt', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
        pdf.save(`Verified_Certificate_${result.certId}.pdf`);
        setIsDownloading(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 relative">
            {/* Background decorative blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-40 right-10 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="text-center mb-14 relative z-10">
                {user?.role === 'organization' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                        <Briefcase size={14} /> {user.orgName} Workspace
                    </motion.div>
                )}
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                    {user?.role === 'organization' ? 'Employee ' : 'Certificate '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Verification</span>
                </h2>
                <p className="text-slate-400 text-lg">Instantly verify {user?.role === 'organization' ? 'candidate credentials' : 'certificates'} by ID, uploaded PDF, or live QR camera scan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="lg:col-span-2 space-y-6">

                    {/* ΓöÇΓöÇ Mode Tabs ΓöÇΓöÇ */}
                    <div className="glass p-2 flex gap-2 rounded-2xl">
                        {MODES.map(m => {
                            const Icon = m.icon;
                            const active = activeMode === m.id;
                            return (
                                <button key={m.id} onClick={() => { setActiveMode(m.id); setScannerDone(false); setResult(null); }}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${active ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:shadow-inner'}`}>
                                    <Icon size={18} />
                                    <span>{m.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ΓöÇΓöÇ Input Area ΓöÇΓöÇ */}
                    <div className="glass p-8">
                        <AnimatePresence mode="wait">

                            {/* BY ID / NAME */}
                            {activeMode === 'id' && (
                                <motion.div key="id-mode" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                        <Search className="text-violet-400" size={18} /> Verify by ID, Name, or Code
                                    </h3>
                                    <p className="text-slate-500 text-xs mb-6">
                                        Enter the certificate ID (e.g. <span className="text-violet-400 font-mono">IITB-2023-001</span>), {user?.role === 'organization' ? 'candidate' : 'student'} name, or any reference code.
                                    </p>
                                    <form onSubmit={handleIdSubmit} className="flex flex-col gap-8">
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                                <input className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-4 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600" placeholder="Certificate ID (e.g. IITB-2023-001)"
                                                    value={certId} onChange={e => setCertId(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-px bg-slate-800" />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">or search by name</span>
                                            <div className="flex-1 h-px bg-slate-800" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" />
                                                <input className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-4 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600" placeholder={`${user?.role === 'organization' ? 'Candidate' : 'Student'} full name (e.g. Rahul Sharma)`}
                                                    value={nameInput} onChange={e => setNameInput(e.target.value)} />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading || (!certId.trim() && !nameInput.trim())}
                                            className="w-full mt-4 relative overflow-hidden group bg-gradient-to-r from-violet-600 to-fuchsia-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:shadow-none">
                                            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={18} /> Verify Certificate</>}
                                        </button>
                                    </form>
                                    {scannerDone && (
                                        <div className="mt-4 flex items-center gap-2 text-violet-400 text-xs font-bold">
                                            <CheckCircle2 size={13} /> QR scanned: <span className="font-mono">{certId}</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* PDF UPLOAD */}
                            {activeMode === 'pdf' && (
                                <motion.div key="pdf-mode" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                        <FileText className="text-violet-400" size={18} /> Verify by PDF
                                    </h3>
                                    <p className="text-slate-500 text-xs mb-6">
                                        Upload a TrustCert certificate PDF ΓÇö we'll automatically extract the ID and verify it on-chain.
                                    </p>
                                    <PdfUploader onExtracted={handlePDFExtracted} loading={loading} />
                                    {loading && (
                                        <div className="mt-4 flex items-center gap-2 text-violet-400 text-sm font-bold">
                                            <Loader2 size={16} className="animate-spin" /> Verifying extracted data...
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* CAMERA QR */}
                            {activeMode === 'qr' && (
                                <motion.div key="qr-mode" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                        <Camera className="text-violet-400" size={18} /> Camera QR Scanner
                                    </h3>
                                    <p className="text-slate-500 text-xs mb-6">
                                        Point your camera at the QR code printed on any TrustCert certificate PDF.
                                    </p>
                                    <LiveQRScanner onFound={handleQRFound} onClose={() => setActiveMode('id')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ΓöÇΓöÇ Result: Authentic ΓöÇΓöÇ */}
                    <AnimatePresence mode="wait">
                        {result?.status === 'authentic' && (
                            <motion.div key="authentic" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="glass p-10 border-2 border-green-500/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={200} /></div>

                                {result.fromDB && (
                                    <div className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
                                        <Database size={12} className="text-green-400" />
                                        <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Verified from TrustCert Database</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-500/10">
                                        <ShieldCheck size={40} className="text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{user?.role === 'organization' ? 'Background Check Passed ✓' : 'Certificate Authentic ✓'}</h3>
                                        <p className="text-slate-400 text-sm">Legally binding digital record on Polygon blockchain</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
                                    <div className="space-y-5">
                                        {[
                                            { icon: User, label: user?.role === 'organization' ? 'Employee Name' : 'Student Name', value: result.student },
                                            { icon: BookOpen, label: 'Degree', value: result.degree, sub: result.grade ? `Grade: ${result.grade}` : null },
                                        ].map(({ icon: Icon, label, value, sub }) => (
                                            <div key={label} className="flex gap-4">
                                                <Icon className="text-violet-400 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
                                                    <p className="font-bold">{value}</p>
                                                    {sub && <p className="text-sm text-green-400 font-bold mt-0.5">{sub}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-5">
                                        {[
                                            {
                                                icon: MapPin,
                                                label: 'Institution',
                                                value: result.institution.startsWith('0x') && result.institution.length > 20
                                                    ? `${result.institution.substring(0, 10)}...${result.institution.substring(result.institution.length - 8)}`
                                                    : result.institution
                                            },
                                            { icon: Calendar, label: 'Graduation Year', value: result.issued },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="flex gap-4">
                                                <Icon className="text-violet-400 shrink-0 mt-0.5" size={18} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
                                                    <p className="font-bold truncate" title={result.institution}>{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800 space-y-4 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Cert ID</p>
                                            <p className="font-mono text-violet-400">{result.certId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Transaction / IPFS Hash</p>
                                            <p className="font-mono text-violet-400 break-all">{result.hash}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Clock size={12} /> Verified at {new Date().toLocaleTimeString()}
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={downloadVerificationPDF} disabled={isDownloading}
                                                className="btn btn-primary text-xs px-4 py-2">
                                                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                                {isDownloading ? 'Generating...' : 'Download Verified PDF'}
                                            </button>
                                            <button onClick={() => window.open(`https://amoy.polygonscan.com/tx/${result.hash}`, '_blank')}
                                                className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-1 hover:text-violet-300">
                                                PolygonScan <ExternalLink size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {result?.status === 'invalid' && (
                            <motion.div key="invalid" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                className="glass p-10 border-2 border-red-500/30">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-500/10">
                                        <AlertTriangle size={40} className="text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Invalid Certificate</h3>
                                        <p className="text-slate-400 text-sm">This PDF or ID was not issued by a registered education institution.</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm mt-2">
                                    No matching record was found in our database or on the Polygon blockchain ledger.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ΓöÇΓöÇ Sidebar ΓöÇΓöÇ */}
                <div className="space-y-6">
                    <div className="glass p-6">
                        <h4 className="font-bold mb-5 flex items-center gap-2">
                            <Activity className="text-violet-400" size={18} /> Recent Verifications
                        </h4>
                        <div>{recentVerifications.map((v, i) => <RecentRow key={i} {...v} />)}</div>
                        <button onClick={() => setIsLogsOpen(true)}
                            className="w-full text-center py-3 mt-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-violet-400 transition-colors">
                            View All Logs
                        </button>
                    </div>

                    <div className="glass p-6">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <ScanLine className="text-violet-400" size={18} /> How to Verify
                        </h4>
                        <div className="space-y-3">
                            {[
                                { num: '01', text: 'By ID — Enter cert ID from email or document' },
                                { num: '02', text: `By Name — Enter ${user?.role === 'organization' ? "candidate's" : "student's"} full name` },
                                { num: '03', text: 'Upload PDF — Drop the certificate PDF file' },
                                { num: '04', text: 'Scan QR — Use camera to scan the QR code' },
                            ].map(({ num, text }) => (
                                <div key={num} className="flex items-start gap-3">
                                    <span className="text-[9px] font-black text-violet-500 mt-1">{num}</span>
                                    <p className="text-slate-400 text-xs leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-6 bg-violet-600/5 border-violet-500/20">
                        <h4 className="font-bold mb-4">System Trust</h4>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Ledger Availability</span><span className="text-green-500 font-bold">99.99%</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Total Validations (24h)</span><span className="text-white font-bold">14,208</span></div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-violet-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ΓöÇΓöÇ Hidden PDF render template ΓöÇΓöÇ */}
            {result?.status === 'authentic' && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                    <div id="verify-cert-preview" style={{ width: 842, height: 595, background: '#0f172a', border: '8px solid rgba(139,92,246,0.4)', padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'sans-serif', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ textAlign: 'center', width: '100%', borderBottom: '2px solid rgba(139,92,246,0.3)', paddingBottom: 16 }}>
                            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 4 }}>Γ£ª TrustCert Blockchain Network Γ£ª</div>
                            <div style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 3 }}>CERTIFICATE OF VERIFICATION</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                            <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>This certifies that</div>
                            <div style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: '#fff' }}>{result.student}</div>
                            <div style={{ fontSize: 13, color: '#94a3b8' }}>has successfully completed</div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: '#d946ef' }}>{result.degree}</div>
                            <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 8 }}>
                                <div><div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Year</div><div style={{ fontSize: 18, fontWeight: 700 }}>{result.issued}</div></div>
                                {result.grade && <div><div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Grade</div><div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80' }}>{result.grade}</div></div>}
                                <div><div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Cert ID</div><div style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace' }}>{result.certId}</div></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', borderTop: '1px solid rgba(100,116,139,0.3)', paddingTop: 16 }}>
                            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b', maxWidth: 580 }}>
                                <div style={{ color: '#6d28d9', fontWeight: 700, fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>BLOCKCHAIN HASH / IPFS CID</div>
                                <div style={{ color: '#a78bfa', wordBreak: 'break-all' }}>{result.hash}</div>
                                <div style={{ marginTop: 4, color: '#94a3b8' }}>Verified: {new Date().toUTCString()}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: 8, borderRadius: 12 }}>
                                <QRCodeSVG value={result.certId} size={80} bgColor="#ffffff" fgColor="#0f172a" />
                                <div style={{ color: '#0f172a', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, marginTop: 4 }}>SCAN TO VERIFY</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ΓöÇΓöÇ Logs Modal ΓöÇΓöÇ */}
            <AnimatePresence>
                {isLogsOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="glass p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative border-violet-500/30">
                            <button onClick={() => setIsLogsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="text-violet-400" /> Full Verification Logs</h3>
                            {recentVerifications.map((v, i) => <RecentRow key={i} {...v} />)}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VerificationPortal;
