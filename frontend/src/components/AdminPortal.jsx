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
    const [selectedFile, setSelectedFile] = useState(null);
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

    const handleBulkIssueAll = async () => {
        if (bulkData.length === 0) return;
        setIsBulking(true);

        const processedResults = [];
        const newTransactions = [];

        try {
            for (const row of bulkData) {
                // Map fields: name, course, year, pdfLink
                const name = row.name || row.Name;
                const course = row.course || row.Course || row.Degree;
                const year = row.year || row.Year || row.GraduationYear;
                const pdfLink = row.pdf_link || row.pdfLink || row.PDF;

                if (!name || !course) continue;

                const uniqueKey = "TC-" + Math.random().toString(36).substr(2, 9).toUpperCase();
                const mockIpfsCID = "bafybeig..." + Math.random().toString(16).substr(2, 8);

                // Save to Backend
                await axios.post('http://localhost:5000/api/certificates', {
                    id: uniqueKey,
                    name,
                    degree: course,
                    graduationYear: year,
                    finalGrade: "A", // Default for bulk if not provided
                    issuer: account || "0x_Mock_Institution",
                    ipfsCid: mockIpfsCID,
                    status: "Confirmed",
                    fileName: pdfLink ? pdfLink.split('/').pop() : 'bulk_upload.pdf'
                });

                newTransactions.push({
                    id: uniqueKey,
                    student: name,
                    type: "Bulk Issue",
                    status: "Confirmed",
                    time: "JUST NOW"
                });
            }

            setTransactions(prev => [...newTransactions, ...prev]);
            alert(`Successfully issued ${newTransactions.length} bulk certificates!`);
            setBulkData([]);
        } catch (error) {
            console.error("Bulk Issuance Error:", error);
            alert("Error during bulk issuance. Some records might not have been processed.");
        } finally {
            setIsBulking(false);
        }
    };

    const handleSingleIssue = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please upload a certificate PDF file.');
            return;
        }
        setIsIssuing(true);

        const mockIpfsCID = "bafybeig..." + Math.random().toString(16).substr(2, 8);
        const uniqueKey = "TC-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        try {
            // 1. Save data directly to our Backend Database!
            await axios.post('http://localhost:5000/api/certificates', {
                id: uniqueKey, // Use generated unique key as ID
                name: certData.name,
                degree: certData.course,
                graduationYear: certData.year,
                finalGrade: certData.grade,
                issuer: account || "0x_Mock_Institution",
                ipfsCid: mockIpfsCID,
                status: "Pending",
                fileName: selectedFile.name
            });

            // 2. Complete the Blockchain Simulation (On-Chain Storage)
            const newTx = {
                id: uniqueKey,
                student: certData.name,
                type: "Single Issue (PDF)",
                status: "Confirmed",
                time: "JUST NOW"
            };

            setTransactions([newTx, ...transactions]);
            setIsIssuing(false);
            setCertData({ id: '', name: '', course: '', year: '', grade: '' });
            setSelectedFile(null);

            setGeneratedCert({
                id: uniqueKey,
                name: certData.name,
                course: certData.course,
                year: certData.year,
                grade: certData.grade,
                hash: "0x" + Math.random().toString(16).substr(2, 40),
                ipfsCid: mockIpfsCID,
                fileName: selectedFile.name
            });
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
                                        <label className="text-sm font-medium text-slate-400">Upload Certificate PDF</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                id="pdf-upload"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                            <label
                                                htmlFor="pdf-upload"
                                                className="w-full flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl cursor-pointer hover:border-violet-500/50 transition-all"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                                    <Upload size={18} />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold text-slate-300 truncate">
                                                        {selectedFile ? selectedFile.name : 'Choose certificate PDF...'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Max size 5MB'}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Unique Credential Key</label>
                                        <div className="flex items-center gap-2 p-3 bg-slate-900/30 border border-slate-800 rounded-xl">
                                            <Clock size={14} className="text-violet-400" />
                                            <span className="text-xs font-mono text-slate-500 italic">Will be auto-generated...</span>
                                        </div>
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
                                        <h3 className="text-xl font-bold text-white mb-2">Certificate Issued!</h3>
                                        <p className="text-slate-400 text-sm mb-4">
                                            Credential successfully stored on-chain with key: <span className="text-violet-400 font-mono font-bold">{generatedCert.id}</span>
                                        </p>
                                        <div className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl w-full max-w-sm mb-6">
                                            <FileText size={16} className="text-violet-400 shrink-0" />
                                            <p className="text-xs text-slate-300 truncate text-left">{generatedCert.fileName}</p>
                                        </div>
                                        <button
                                            onClick={() => setGeneratedCert(null)}
                                            className="btn btn-secondary w-full max-w-sm py-3"
                                        >
                                            Issue Another
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
                                                    <th className="p-4">Course</th>
                                                    <th className="p-4">Year</th>
                                                    <th className="p-4">PDF Link</th>
                                                    <th className="p-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {bulkData.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="hover:bg-slate-700/20">
                                                        <td className="p-4 font-bold">{row.name || row.Name}</td>
                                                        <td className="p-4">{row.course || row.Course || row.Degree}</td>
                                                        <td className="p-4">{row.year || row.Year}</td>
                                                        <td className="p-4 text-xs text-slate-500 font-mono truncate max-w-[150px]">
                                                            {row.pdf_link || row.pdfLink || row.PDF}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => setBulkData(bulkData.filter((_, idx) => idx !== i))}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
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

            {/* Legacy PDF template removed - using PDF upload system */}

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
