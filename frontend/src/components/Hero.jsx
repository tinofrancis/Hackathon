import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, Globe, Zap, Cpu, Lock, Share2, ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-violet-400 transition-colors"
            >
                <span className="font-bold text-lg">{question}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-400 leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Hero = () => {
    const navigate = useNavigate();
    return (
        <div className="relative">
            {/* Hero Section */}
            <div className="py-20 text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Zap size={14} /> Powering 100+ Institutions
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                        Securing the Future of <br />
                        <span className="gradient-text">Academic Integrity</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The ultimate on-chain certificate issuance and verification portal.
                        Instant, immutable, and fraud-proof credentials powered by Polygon.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mb-20">
                        <button
                            onClick={() => navigate('/admin')}
                            className="btn btn-primary px-8 py-4 text-lg"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/verify')}
                            className="btn btn-secondary px-8 py-4 text-lg"
                        >
                            Explore Demo
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    {[
                        { icon: Shield, title: "Fraud-Proof", desc: "Hash-based on-chain storage ensures zero manipulation of academic records." },
                        { icon: CheckCircle, title: "Instant Verification", desc: "Verify authenticity in seconds via QR or ID without institution contact." },
                        { icon: Globe, title: "Global Standard", desc: "Open standards compatible with OpenCerts and Blockcerts protocols." }
                    ].map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * i }}
                            className="glass card text-left"
                        >
                            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6">
                                <feat.icon className="text-violet-400" size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* How it Works Section */}
            <div className="py-24 border-t border-slate-800">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4">How It Works</h2>
                    <p className="text-slate-400">A seamless 3-step process for institutions and graduates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent -translate-y-1/2 z-0"></div>

                    {[
                        { step: "01", icon: Cpu, title: "Issue On-Chain", desc: "Institutions upload student data and sign hashes to the Polygon blockchain." },
                        { step: "02", icon: Lock, title: "Secure Storage", desc: "Encrypted hashes stay immutable. Data remains private and secure." },
                        { step: "03", icon: Share2, title: "Instant Verify", desc: "Graduates share QR codes. Employers verify authenticity instantly." }
                    ].map((item, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 glass rounded-full flex items-center justify-center mb-6 border-2 border-violet-500/30 bg-background shadow-lg shadow-violet-500/10">
                                <item.icon className="text-violet-400" size={32} />
                            </div>
                            <span className="text-xs font-black text-violet-500 mb-2">{item.step}</span>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-[250px]">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Partners Marquee (Static simulation) */}
            <div className="py-16 bg-slate-900/30 overflow-hidden border-y border-slate-800">
                <div className="container mx-auto px-4">
                    <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-10">Trusted By Global Institutions</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="text-2xl font-black tracking-tighter">IIT BOMBAY</div>
                        <div className="text-2xl font-black tracking-tighter">STANFORD</div>
                        <div className="text-2xl font-black tracking-tighter">MIT OPEN</div>
                        <div className="text-2xl font-black tracking-tighter">NUS CERT</div>
                        <div className="text-2xl font-black tracking-tighter">OXFORD UNI</div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-24 max-w-3xl mx-auto px-4">
                <h2 className="text-4xl font-black mb-12 text-center">Frequently Asked <span className="gradient-text">Questions</span></h2>
                <div className="glass p-8">
                    <FAQItem
                        question="Is my personal data stored on the blockchain?"
                        answer="No. TrustCert only stores a cryptographic hash of your certificate. Your actual name and grades remain private and are only visible when you choose to share the original digital file or link."
                    />
                    <FAQItem
                        question="Can a certificate be revoked?"
                        answer="Yes. Institutions can mark a certificate hash as 'Revoked' on-chain if errors were found or degrees were rescinded. This is reflected instantly during verification."
                    />
                    <FAQItem
                        question="What is Selective Disclosure?"
                        answer="Selective Disclosure allows you to share only specific parts of your certificate (e.g., just the degree name and year) without revealing sensitive data like your exact GPA."
                    />
                    <FAQItem
                        question="Is verification free for employers?"
                        answer="Yes. Verification is free and open to everyone. Employers do not need a wallet or account to verify a certificate ID or QR code."
                    />
                </div>
            </div>
        </div>
    );
};

export default Hero;
