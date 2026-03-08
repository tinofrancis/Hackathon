import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Construction } from 'lucide-react';

const PlaceholderPage = () => {
    const location = useLocation();

    // Convert pathname like '/how-it-works' to 'How It Works'
    const pageName = location.pathname
        .slice(1)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20 animate-fade">
            <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mb-8 border border-violet-500/20">
                <Construction className="text-violet-400" size={40} />
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4">
                <span className="gradient-text">{pageName}</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
                This section of the TrustCert portal is currently under active development.
                Check back soon for updates to the {pageName} details.
            </p>

            <Link to="/" className="btn btn-secondary px-6">
                <ArrowLeft size={18} /> Back to Home
            </Link>
        </div>
    );
};

export default PlaceholderPage;
