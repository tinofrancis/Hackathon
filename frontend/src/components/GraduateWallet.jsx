import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, Eye, ExternalLink, ShieldCheck, History, Info, Lock, Loader2, X, Mail, Send, CheckCircle2, FileText, User, BookOpen, Award, Calendar, Hash, RefreshCw, Database } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import { API_BASE } from '../config';

const HistoryItem = ({ label, date, hash }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 mb-2 last:mb-0 hover:border-violet-500/30 transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <History size={14} className="text-slate-500" />
            </div>
            <div>
                <p className="text-xs font-bold">{label}</p>
                <p className="text-[10px] text-slate-500 font-mono">{hash}</p>
            </div>
        </div>
        <span className="text-[10px] font-black text-slate-600 uppercase">{date}</span>
    </div>
);

const GraduateWallet = () => {
    const [selectedCert, setSelectedCert] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [employerEmail, setEmployerEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [privacyToggles, setPrivacyToggles] = useState({
        degree: true, year: true, institution: true, grade: false, modules: false
    });
    const [dbCerts, setDbCerts] = useState([]);
    const [dbLoading, setDbLoading] = useState(true);

    const sampleCert = {
        id: "IITB-0X9F2A",
        name: "Rahul Sharma",
        degree: "Bachelor of Technology",
        major: "Computer Science",
        year: "2023",
        grade: "A+",
        institution: "Indian Institute of Technology, Bombay",
        status: "Verified",
        hash: "0x7d2f4a1c8b9e0d3f2a1b5c4d3e2f1a0b9c8d7e6f",
        history: [
            { label: "Certificate Issued", date: "JUN 15, 2023", hash: "0x7d2f...3a1c" },
            { label: "Verified by Google Inc.", date: "AUG 10, 2023", hash: "0xe4b8...1a2d" },
            { label: "Privacy Link Created", date: "AUG 12, 2023", hash: "0xf9c2...0b3e" }
        ]
    };

    const fetchDbCerts = async () => {
        setDbLoading(true);
        setDbLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/certificates`);
            const mapped = data.data.map(c => ({
                id: c.id,
                name: c.name,
                degree: c.degree,
                major: c.degree,
                year: c.graduationYear,
                grade: c.finalGrade,
                institution: c.issuer || 'TrustCert Institution',
                status: c.status || 'Confirmed',
                hash: c.ipfsCid || '0x_pending',
                fromDB: true,
                timestamp: c.timestamp,
                history: [
                    { label: 'Certificate Issued to Blockchain', date: new Date(c.timestamp).toDateString().toUpperCase(), hash: c.ipfsCid || '0x_pending' }
                ]
            }));
            setDbCerts(mapped);
        } catch {
            setDbCerts([]);
        } finally {
            setDbLoading(false);
        }
    };

    useEffect(() => { fetchDbCerts(); }, []);

    const certificates = [
        {
            id: "IITB-0X9F2A",
            name: "Rahul Sharma",
            degree: "Bachelor of Technology",
            major: "Computer Science",
            year: "2023",
            grade: "A+",
            institution: "Indian Institute of Technology, Bombay",
            status: "Verified",
            hash: "0x7d2f4a1c8b9e0d3f2a1b5c4d3e2f1a0b9c8d7e6f",
            history: [
                { label: "Certificate Issued", date: "JUN 15, 2023", hash: "0x7d2f...3a1c" },
                { label: "Verified by Google Inc.", date: "AUG 10, 2023", hash: "0xe4b8...1a2d" },
                { label: "Privacy Link Created", date: "AUG 12, 2023", hash: "0xf9c2...0b3e" }
            ]
        }
    ];

    // Send to Employer
    const handleSendToEmployer = () => {
        if (!selectedCert) return;
        setIsSendModalOpen(true);
        setSendSuccess(false);
        setEmployerEmail('');
    };

    const submitSendToEmployer = (e) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSendSuccess(true);
        }, 2000);
    };

    // PDF Snapshot
    const handlePdfSnapshot = (cert) => {
        setSelectedCert(cert);
        setIsPdfModalOpen(true);
    };

    const downloadPDF = async () => {
        setIsDownloading(true);
        const el = document.querySelector('#grad-cert-pdf');
        if (!el) { setIsDownloading(false); return; }
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0f172a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'pt', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
        pdf.save(`${selectedCert.name.replace(/\s+/g, '_')}_Certificate.pdf`);
        setIsDownloading(false);
    };

    // View Details
    const handleViewDetails = (cert) => {
        setSelectedCert(cert);
        setIsDetailsModalOpen(true);
    };

    const togglePrivacy = (key) => {
        setPrivacyToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleGenerateLink = () => {
        setIsGenerating(true);
        const enabled = Object.entries(privacyToggles).filter(([, v]) => v).map(([k]) => k);
        setTimeout(() => {
            setIsGenerating(false);
            navigator.clipboard?.writeText(`https://trustcert.io/verify/zk/${selectedCert?.id || 'IITB-0X9F2A'}?fields=${enabled.join(',')}`)
                .catch(() => { });
            alert(`🔐 Zero-Knowledge Proof link generated!\n\nSharing: ${enabled.join(', ')}\n\nLink copied to clipboard:\nhttps://trustcert.io/verify/zk/${selectedCert?.id || 'IITB-0X9F2A'}?fields=${enabled.join(',')}`);
        }, 2000);
    };

    return (
        <div className="max-w-6xl mx-auto py-10">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black mb-2">Graduate Wallet</h2>
                    <p className="text-slate-400">Manage and share your verifiable academic credentials with full privacy control.</p>
                </div>
                <div className="hidden sm:flex p-4 glass rounded-3xl items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20" />
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Connected as</p>
                        <p className="font-mono text-sm text-violet-400">rahul.eth</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database size={14} className="text-violet-400" />
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                {dbLoading ? 'Loading...' : `${dbCerts.length > 0 ? dbCerts.length : 1} credential${dbCerts.length !== 1 ? 's' : ''} on file`}
                            </span>
                        </div>
                        <button onClick={fetchDbCerts} disabled={dbLoading}
                            className="btn btn-secondary py-1.5 px-3 text-[10px] uppercase font-bold tracking-widest">
                            <RefreshCw size={12} className={dbLoading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>

                    {dbLoading && (
                        <div className="space-y-4">
                            {[...Array(1)].map((_, i) => <div key={i} className="glass h-48 rounded-2xl animate-pulse bg-slate-900/50" />)}
                        </div>
                    )}

                    {!dbLoading && [...dbCerts, ...(dbCerts.length === 0 ? [sampleCert] : [])].map((cert) => (
                        <motion.div
                            key={cert.id}
                            whileHover={{ y: -4 }}
                            className="glass p-8 relative overflow-hidden border-l-4 border-l-violet-600"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <ShieldCheck className="text-success animate-pulse" size={32} />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <div className="w-24 h-24 bg-white p-2 rounded-2xl flex items-center justify-center shrink-0">
                                    <QRCodeSVG value={cert.id} size={80} bgColor="#ffffff" fgColor="#0f172a" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-1">{cert.degree}</h3>
                                    {cert.fromDB && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded mb-2">
                                            <Database size={9} /> Live from Database
                                        </span>
                                    )}
                                    <p className="text-violet-400 font-bold mb-4 uppercase text-xs tracking-widest">{cert.institution}</p>

                                    <div className="grid grid-cols-3 gap-6 text-sm">
                                        <div>
                                            <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest mb-1">Major</p>
                                            <p className="font-bold">{cert.major}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest mb-1">Year</p>
                                            <p className="font-bold">{cert.year}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest mb-1">Status</p>
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] font-black uppercase inline-block border border-green-500/20">
                                                {cert.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Always-visible action buttons */}
                            <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap gap-3">
                                <button
                                    onClick={() => { setSelectedCert(cert); handleSendToEmployer(); }}
                                    className="btn btn-primary py-2.5 px-5 text-xs font-black uppercase tracking-widest"
                                >
                                    <Send size={14} />
                                    Send to Employer
                                </button>
                                <button
                                    onClick={() => handlePdfSnapshot(cert)}
                                    className="btn btn-secondary py-2.5 px-5 text-xs font-black uppercase tracking-widest"
                                >
                                    <FileText size={14} />
                                    PDF Snapshot
                                </button>
                                <button
                                    onClick={() => handleViewDetails(cert)}
                                    className="btn btn-secondary py-2.5 px-5 text-xs font-black uppercase tracking-widest"
                                >
                                    <Eye size={14} />
                                    View Details
                                </button>
                            </div>

                            {/* Transaction History */}
                            <div className="mt-6 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/30">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <History size={12} /> Transaction Lifecycle
                                </h4>
                                <div className="space-y-1">
                                    {cert.history.map((item, i) => (
                                        <HistoryItem key={i} {...item} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Privacy Control Sidebar */}
                <div className="space-y-6">
                    <div className="glass p-6 border-t-4 border-t-violet-500">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Lock className="text-violet-400" size={18} />
                            Privacy Control
                        </h4>
                        <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                            Generate Zero-Knowledge Proofs. Toggle what data you want to share.
                        </p>
                        <div className="space-y-3">
                            {[
                                { key: 'degree', label: 'Degree Title' },
                                { key: 'year', label: 'Completion Year' },
                                { key: 'institution', label: 'Institution' },
                                { key: 'grade', label: 'Final GPA/Grade' },
                                { key: 'modules', label: 'Course Modules' },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    onClick={() => togglePrivacy(key)}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900/80 transition-colors cursor-pointer"
                                >
                                    <span className="text-xs font-bold text-slate-300">{label}</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${privacyToggles[key] ? 'bg-violet-600' : 'bg-slate-700'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${privacyToggles[key] ? 'translate-x-4' : ''}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleGenerateLink}
                            disabled={isGenerating}
                            className="btn btn-primary w-full mt-6 justify-center py-3 text-xs uppercase tracking-widest font-black"
                        >
                            {isGenerating ? <><Loader2 className="animate-spin" size={14} /> Generating...</> : '🔐 Generate Privacy Link'}
                        </button>
                    </div>

                    <div className="glass p-6 bg-slate-900/50">
                        <div className="flex items-center gap-2 text-violet-400 mb-2">
                            <Info size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Self-Sovereign Identity</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Your credentials are yours forever. Even if TrustCert or your university shuts down, your records remain verifiable on the Polygon public ledger.
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── MODALS ─── */}
            <AnimatePresence>

                {/* SEND TO EMPLOYER MODAL */}
                {isSendModalOpen && selectedCert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="glass p-8 w-full max-w-md relative border-violet-500/30 shadow-2xl shadow-violet-500/10">
                            <button onClick={() => { setIsSendModalOpen(false); setSendSuccess(false); }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>

                            {!sendSuccess ? (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Send to Employer</h3>
                                            <p className="text-slate-500 text-xs">Share a verified credential link</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 mb-6">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Sharing Certificate</p>
                                        <p className="font-bold text-sm">{selectedCert.degree}</p>
                                        <p className="text-violet-400 text-xs">{selectedCert.institution}</p>
                                        <p className="font-mono text-[9px] text-slate-600 mt-1">{selectedCert.hash}</p>
                                    </div>

                                    <form onSubmit={submitSendToEmployer} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Employer Email</label>
                                            <input
                                                className="input"
                                                type="email"
                                                placeholder="hr@company.com"
                                                value={employerEmail}
                                                onChange={(e) => setEmployerEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Personal Message (Optional)</label>
                                            <textarea
                                                className="input resize-none h-20"
                                                placeholder="Please find my verified credential for your review..."
                                            />
                                        </div>
                                        <button type="submit" disabled={isSending} className="btn btn-primary w-full justify-center py-3 font-black uppercase tracking-widest">
                                            {isSending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Credential</>}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-8">
                                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mx-auto mb-4">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">Sent Successfully!</h3>
                                    <p className="text-slate-400 text-sm mb-2">Verification link delivered to</p>
                                    <p className="text-violet-400 font-bold mb-6">{employerEmail}</p>
                                    <p className="text-slate-500 text-xs">The employer can now verify your credential directly on the Polygon blockchain.</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* PDF SNAPSHOT MODAL */}
                {isPdfModalOpen && selectedCert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-4xl relative flex flex-col items-center">
                            <button onClick={() => setIsPdfModalOpen(false)}
                                className="absolute -top-12 right-0 text-slate-400 hover:text-white"><X size={32} /></button>

                            <p className="text-slate-400 text-sm mb-4">Preview your official certificate below</p>

                            {/* Certificate Visual — also used by html2canvas */}
                            <div
                                id="grad-cert-pdf"
                                style={{
                                    width: '842px', height: '595px', maxWidth: '100%',
                                    background: '#0f172a',
                                    border: '8px solid rgba(139,92,246,0.4)',
                                    padding: '48px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontFamily: 'sans-serif',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Glow effects */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '300px', height: '300px', background: 'rgba(139,92,246,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '300px', height: '300px', background: 'rgba(217,70,239,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />

                                <div style={{ textAlign: 'center', width: '100%', borderBottom: '2px solid rgba(139,92,246,0.3)', paddingBottom: '16px', position: 'relative' }}>
                                    <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '900', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '6px' }}>✦ TrustCert Blockchain Network ✦</div>
                                    <div style={{ fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' }}>CERTIFICATE OF ACHIEVEMENT</div>
                                </div>

                                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', position: 'relative' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px' }}>This is to certify that</div>
                                    <div style={{ fontSize: '52px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.1 }}>{selectedCert.name}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>has successfully completed</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#d946ef' }}>{selectedCert.degree} — {selectedCert.major}</div>
                                    <div style={{ fontSize: '14px', color: '#a78bfa', fontWeight: '600' }}>{selectedCert.institution}</div>
                                    <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '8px' }}>
                                        <div><div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Year</div>
                                            <div style={{ fontSize: '18px', fontWeight: '700' }}>{selectedCert.year}</div></div>
                                        <div><div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Grade</div>
                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#4ade80' }}>{selectedCert.grade}</div></div>
                                        <div><div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Cert ID</div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#a78bfa', fontFamily: 'monospace' }}>{selectedCert.id}</div></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', borderTop: '1px solid rgba(100,116,139,0.3)', paddingTop: '16px', position: 'relative' }}>
                                    <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b', maxWidth: '580px' }}>
                                        <div style={{ color: '#7c3aed', fontWeight: '700', fontSize: '8px', letterSpacing: '2px', marginBottom: '4px' }}>BLOCKCHAIN HASH (POLYGON AMOY)</div>
                                        <div style={{ color: '#a78bfa', wordBreak: 'break-all' }}>{selectedCert.hash}</div>
                                        <div style={{ marginTop: '6px', color: '#94a3b8' }}>Issued: {selectedCert.year} | via TrustCert Protocol v2.0</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '8px', borderRadius: '12px' }}>
                                        <QRCodeSVG value={selectedCert.id} size={80} bgColor="#ffffff" fgColor="#0f172a" />
                                        <div style={{ color: '#0f172a', fontSize: '8px', fontFamily: 'monospace', fontWeight: '700', marginTop: '4px' }}>SCAN TO VERIFY</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={downloadPDF}
                                disabled={isDownloading}
                                className="btn btn-primary mt-6 px-12 py-4 text-lg font-black tracking-wider uppercase"
                            >
                                {isDownloading
                                    ? <><Loader2 size={20} className="animate-spin mr-2" />Generating PDF...</>
                                    : <><Download size={20} className="mr-2" />Download Official PDF</>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* VIEW DETAILS MODAL */}
                {isDetailsModalOpen && selectedCert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="glass p-8 w-full max-w-lg relative border-violet-500/30 shadow-2xl shadow-violet-500/10">
                            <button onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Certificate Details</h3>
                                    <p className="text-slate-500 text-xs">Full on-chain credential info</p>
                                </div>
                            </div>

                            <div className="w-full flex justify-center mb-6 bg-white p-3 rounded-2xl">
                                <QRCodeSVG value={selectedCert.id} size={120} bgColor="#ffffff" fgColor="#0f172a" />
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: Hash, label: 'Certificate ID', value: selectedCert.id, mono: true, accent: 'violet' },
                                    { icon: User, label: 'Student Name', value: selectedCert.name },
                                    { icon: BookOpen, label: 'Degree & Major', value: `${selectedCert.degree} — ${selectedCert.major}` },
                                    { icon: Award, label: 'Institution', value: selectedCert.institution },
                                    { icon: Calendar, label: 'Graduation Year', value: selectedCert.year },
                                    { icon: Award, label: 'Final Grade', value: selectedCert.grade, accent: 'green' },
                                ].map(({ icon: Icon, label, value, mono, accent }) => (
                                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                        <Icon size={16} className="text-violet-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{label}</p>
                                            <p className={`text-sm font-bold break-all ${mono ? 'font-mono' : ''} ${accent === 'green' ? 'text-green-400' : ''}`}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                    <Hash size={16} className="text-violet-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Blockchain Hash</p>
                                        <p className="text-[11px] font-mono text-violet-400 break-all">{selectedCert.hash}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => { setIsDetailsModalOpen(false); handlePdfSnapshot(selectedCert); }}
                                    className="btn btn-primary flex-1 justify-center text-xs uppercase font-black tracking-widest py-3">
                                    <Download size={14} /> Download PDF
                                </button>
                                <button onClick={() => window.open(`https://amoy.polygonscan.com/tx/${selectedCert.hash}`, '_blank')}
                                    className="btn btn-secondary flex-1 justify-center text-xs uppercase font-black tracking-widest py-3">
                                    <ExternalLink size={14} /> PolygonScan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default GraduateWallet;
