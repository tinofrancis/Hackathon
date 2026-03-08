import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Twitter, Github, Linkedin, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-20 border-t border-slate-800 bg-slate-950/50 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Shield className="text-violet-500" size={32} />
                            <span className="text-2xl font-black tracking-tighter">TrustCert</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            The global standard for decentralized academic credentialing.
                            Ensuring integrity and trust for institutions and graduates worldwide.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="/how-it-works" className="hover:text-violet-400 transition-colors">How it Works</Link></li>
                            <li><Link to="/institutions" className="hover:text-violet-400 transition-colors">Institutions</Link></li>
                            <li><Link to="/verification-apis" className="hover:text-violet-400 transition-colors">Verification APIs</Link></li>
                            <li><Link to="/trust-network" className="hover:text-violet-400 transition-colors">Trust Network</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Resources</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="/documentation" className="hover:text-violet-400 transition-colors">Documentation</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors text-violet-400 flex items-center gap-1">
                                Polygon Scan <ExternalLink size={12} />
                            </a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Newsletter</h4>
                        <p className="text-slate-400 text-xs mb-4">Stay updated with the latest in blockchain integrity.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="input text-xs py-2 px-3" />
                            <button className="btn btn-primary px-4 py-2 text-xs">Join</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-xs text-center md:text-left">
                        © 2026 TrustCert Protocol. Built on Polygon. <br className="md:hidden" />
                        <span className="hidden md:inline"> | </span>
                        Compliant with IT Act 2000 & GDPR.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-600">
                        <Link to="/status" className="hover:text-slate-400">Status</Link>
                        <Link to="/help-center" className="hover:text-slate-400">Help Center</Link>
                        <Link to="/security" className="hover:text-slate-400">Security</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
