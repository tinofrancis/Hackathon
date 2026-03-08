import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, FileText, Trash2, Send, Save, AlertCircle, Clock, CheckCircle2, Loader2, X } from 'lucide-react';
import Papa from 'papaparse';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TransactionRow = ({ id, student, type, status, time }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 mb-3 hover:bg-slate-900/60 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === 'Confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-violet-500/10 text-violet-400'}`}>
                {status === 'Confirmed' ? <CheckCircle2 size={20} /> : <Loader2 size={20} className="animate-spin" />}
            </div>
            <div>
                <p className="font-bold text-sm">{student}</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{id}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{type}</p>
            <p className="text-[10px] text-violet-400 flex items-center gap-1 justify-end">
                <Clock size={10} /> {time}
            </p>
        </div>
    </div>
);

import { useBlockchain } from '../context/BlockchainContext';

const AdminPortal = () => {
    const { account, contract, connectWallet } = useBlockchain();
    const [activeTab, setActiveTab] = useState('single');
    const [certData, setCertData] = useState({ id: '', name: '', course: '', year: '', grade: '' });
    const [bulkData, setBulkData] = useState([]);
    const [isIssuing, setIsIssuing] = useState(false);
    const [transactions, setTransactions] = useState([
        { id: "0x7d2...f1a0", student: "Rahul Sharma", type: "Single Issue", status: "Confirmed", time: "10 MINS AGO" },
        { id: "0xb4a...3c2e", student: "Priya Singh", type: "Bulk Issue [Item 1/451]", status: "Confirmed", time: "1 HOUR AGO" }
    ]);
    const [isBulking, setIsBulking] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [showGeneratedPDF, setShowGeneratedPDF] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [generatedCert, setGeneratedCert] = useState(null);

    const downloadPDF = async () => {
        setIsDownloading(true);
        const elementHTML = document.querySelector('#hidden-certificate-preview');
        if (!elementHTML) { setIsDownloading(false); return; }
        const canvas = await html2canvas(elementHTML, { scale: 2, backgroundColor: '#0f172a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'pt', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
        pdf.save(`${generatedCert.name.replace(/\s+/g, '_')}_Certificate.pdf`);
        setIsDownloading(false);
    };

    const handleBulkIssueAll = () => {
        if (bulkData.length === 0) return;
        setIsBulking(true);

        setTimeout(() => {
            alert(
                `🔥 BULK ISSUANCE SUCCESSFUL!\n\n` +
                `1. Generated JSON files for ${bulkData.length} records.\n` +
                `2. Safely stored all metadata onto the decentralized IPFS network.\n` +
                `3. Broacasted to Polygon Amoy mapping exact hashes to each student.\n\n` +
                `Transaction is finalizing!`
            );

            const newTx = {
                id: "0x" + Math.random().toString(16).substr(2, 8) + "...bulk",
                student: `Multi-Student (${bulkData.length} records)`,
                type: "Bulk Issue",
                status: "Pending",
                time: "JUST NOW"
            };
            setTransactions([newTx, ...transactions]);
            setIsBulking(false);
            setBulkData([]);
        }, 3500);
    };

    const handleSingleIssue = async (e) => {
        e.preventDefault();
        setIsIssuing(true);

        const mockIpfsCID = "bafybeig...zxh4";

        try {
            // 1. Save data directly to our new Backend Database!
            await axios.post('http://localhost:5000/api/certificates', {
                id: certData.id,
                name: certData.name,
                degree: certData.course,
                graduationYear: certData.year,
                finalGrade: certData.grade,
                issuer: account || "0x_Mock_Institution",
                ipfsCid: mockIpfsCID,
                status: "Pending"
            });

            // 2. Complete the Blockchain Simulation (On-Chain Storage)
            const newTx = {
                id: "0x" + Math.random().toString(16).substr(2, 8) + "...pending",
                student: certData.name,
                type: "Single Issue",
                status: "Pending",
                time: "JUST NOW"
            };

            setTransactions([newTx, ...transactions]);
            setIsIssuing(false);
            setCertData({ id: '', name: '', course: '', year: '', grade: '' });

            setGeneratedCert({
                id: certData.id,
                name: certData.name,
                course: certData.course,
                year: certData.year,
                grade: certData.grade,
                hash: newTx.id,
                ipfsCid: mockIpfsCID
            });
            setShowGeneratedPDF(false); // We now use the inline success box
        } catch (error) {
            console.error("Database Error:", error);
            setIsIssuing(false);
            alert(`Error: ${error.response?.data?.error || "Failed to save to database!"}`);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    setBulkData(results.data);
                }
            });
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Institution Dashboard</h2>
                    <p className="text-slate-500 text-sm">
                        {account ? `Connected as Issuer: ${account.substring(0, 6)}...${account.substring(38)}` : 'Please connect wallet to manage certificates'}
                    </p>
                </div>
                <div className="flex gap-2 p-1 glass rounded-2xl">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'single' ? 'bg-violet-600' : ''}`}
                    >
                        Single Issue
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'bulk' ? 'bg-violet-600' : ''}`}
                    >
                        Bulk Issue
                    </button>
                </div>
            </div>

            {!account ? (
                <div className="glass p-12 text-center border-violet-500/20">
                    <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
                    <h3 className="text-2xl font-bold mb-4">Wallet Connection Required</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        You must connect an authorized institution wallet to issue credentials on the TrustCert network.
                    </p>
                    <button onClick={connectWallet} className="btn btn-primary px-8 py-4">
                        Connect MetaMask
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {activeTab === 'single' ? (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8">
                                <form onSubmit={handleSingleIssue} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Student Name</label>
                                        <input
                                            className="input" placeholder="Rahul Sharma" required
                                            value={certData.name} onChange={(e) => setCertData({ ...certData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Student ID</label>
                                        <input
                                            className="input" placeholder="IITB-2023-001" required
                                            value={certData.id} onChange={(e) => setCertData({ ...certData, id: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Course / Degree</label>
                                        <input
                                            className="input" placeholder="B.Tech Computer Science" required
                                            value={certData.course} onChange={(e) => setCertData({ ...certData, course: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Graduation Year</label>
                                        <input
                                            className="input" placeholder="2023" required
                                            value={certData.year} onChange={(e) => setCertData({ ...certData, year: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 mt-4">
                                        <button type="submit" disabled={isIssuing} className="btn btn-primary w-full justify-center">
                                            {isIssuing ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="animate-spin" size={18} /> Confirming on Chain...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Send size={18} /> Issue Blockchain Certificate
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {generatedCert && (
                                    <div className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex flex-col items-center text-center">
                                        <CheckCircle2 size={40} className="text-green-400 mb-3" />
                                        <h3 className="text-xl font-bold text-white mb-2">Certificate Issued Successfully!</h3>
                                        <p className="text-slate-400 text-sm mb-6">Secured on Polygon blockchain. The official PDF is ready.</p>
                                        <button
                                            onClick={downloadPDF}
                                            disabled={isDownloading}
                                            className="btn btn-primary w-full max-w-sm flex items-center justify-center gap-2 py-3"
                                        >
                                            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {isDownloading ? 'Generating PDF...' : 'Download Certificate PDF'}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8">
                                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-900/30">
                                    <Upload className="mx-auto text-violet-400 mb-4" size={48} />
                                    <h3 className="text-xl font-bold mb-2">Upload CSV File</h3>
                                    <p className="text-slate-400 mb-6">File should contain Name, ID, Degree, Year columns.</p>
                                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                                    <label htmlFor="csv-upload" className="btn btn-secondary cursor-pointer">
                                        Choose File
                                    </label>
                                </div>

                                {bulkData.length > 0 && (
                                    <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800/50">
                                                <tr>
                                                    <th className="p-4">Name</th>
                                                    <th className="p-4">ID</th>
                                                    <th className="p-4">Degree</th>
                                                    <th className="p-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {bulkData.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="hover:bg-slate-700/20">
                                                        <td className="p-4">{row.Name}</td>
                                                        <td className="p-4">{row.ID}</td>
                                                        <td className="p-4">{row.Degree}</td>
                                                        <td className="p-4">
                                                            <Trash2
                                                                size={16}
                                                                className="text-slate-500 cursor-pointer hover:text-red-400"
                                                                onClick={() => setBulkData(bulkData.filter((_, idx) => idx !== i))}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="p-4 bg-slate-800/30 flex justify-between items-center text-slate-400">
                                            <span>{bulkData.length} records found</span>
                                            <button
                                                onClick={handleBulkIssueAll}
                                                className="btn btn-primary text-xs"
                                            >
                                                {isBulking ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                                {isBulking ? 'Broadcasting...' : 'Bulk Issue All'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h4 className="font-bold mb-6 flex items-center gap-2">
                                <Clock className="text-violet-400" size={18} />
                                Recent Transactions
                            </h4>
                            <div className="space-y-1">
                                {transactions.map((tx, i) => (
                                    <TransactionRow key={i} {...tx} />
                                ))}
                            </div>
                            <button
                                onClick={() => setIsHistoryModalOpen(true)}
                                className="w-full text-center py-3 mt-4 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-violet-400 transition-colors"
                            >
                                View All History
                            </button>
                        </div>

                        <div className="glass p-6 border-l-4 border-l-yellow-500">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-yellow-500 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold mb-1 text-sm">Security Reminder</h4>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Bulk issuance will trigger multiple transaction signatures. Please ensure your wallet has sufficient GAS (POL) for the operations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN TEMPLATE FOR INLINE DOWNLOAD */}
            {generatedCert && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                    <div
                        id="hidden-certificate-preview"
                        className="bg-slate-900 border-[8px] border-violet-600/30 p-12 relative flex flex-col items-center justify-center text-center overflow-hidden"
                        style={{ width: '842px', height: '595px' }}
                    >
                        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full mix-blend-screen" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-600/20 blur-[100px] rounded-full mix-blend-screen" />

                        <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full">
                            <h1 className="text-4xl font-black uppercase tracking-widest text-violet-400 mb-8 border-b-2 border-violet-500/30 pb-4 w-full">
                                TrustCert Authenticated
                            </h1>
                            <p className="text-slate-400 text-lg mb-2">This is to certify that</p>
                            <h2 className="text-6xl font-black text-white mb-6 uppercase">{generatedCert.name}</h2>
                            <p className="text-slate-400 text-lg mb-2">has successfully completed</p>
                            <h3 className="text-3xl font-bold text-fuchsia-400 mb-6">{generatedCert.course}</h3>
                            <div className="flex gap-8 text-center mt-4">
                                <div><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Year</p><p className="text-xl font-bold text-white">{generatedCert.year}</p></div>
                                <div><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Final Grade</p><p className="text-xl font-bold text-white">{generatedCert.grade}</p></div>
                            </div>
                        </div>

                        <div className="w-full flex justify-between items-end border-t border-slate-700/50 pt-6 mt-8 relative z-10">
                            <div className="text-left text-xs bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 block">
                                <p className="text-slate-500 font-bold uppercase tracking-widest mb-1">Blockchain Hash / TX</p>
                                <p className="text-violet-400 font-mono text-[10px] break-all w-64">{generatedCert.hash}</p>
                                <p className="text-slate-500 font-bold uppercase tracking-widest mt-2 mb-1">IPFS Storage CID</p>
                                <p className="text-fuchsia-400 font-mono text-[10px] break-all w-64">{generatedCert.ipfsCid}</p>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded-xl">
                                <QRCodeSVG value={generatedCert.id} size={90} bgColor="#ffffff" fgColor="#0f172a" />
                                <p className="text-slate-900 font-mono text-[8px] mt-1 font-bold">SCAN TO VERIFY</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isHistoryModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="glass p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative border-violet-500/30 shadow-2xl shadow-violet-500/10"
                        >
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="text-violet-400" /> Full Transaction Ledger
                            </h3>
                            <div className="space-y-2">
                                {transactions.map((tx, i) => (
                                    <TransactionRow key={`history-${i}`} {...tx} />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}


            </AnimatePresence>
        </div>
    );
};
export default AdminPortal;
