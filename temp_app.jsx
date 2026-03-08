import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Shield, Wallet, Menu, X, ChevronRight, Activity, Globe, LogOut, GraduationCap, Briefcase, BarChart2, Search, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Hero from './components/Hero';
import AdminPortal from './components/AdminPortal';
import GraduateWallet from './components/GraduateWallet';
import VerificationPortal from './components/VerificationPortal';
import Analytics from './components/Analytics';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// ΓöÇΓöÇ Network status bar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const NetworkStatus = () => (
  <div className="bg-violet-600/10 border-b border-violet-500/20 py-2">
    <div className="container mx-auto px-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
      <div className="flex items-center gap-2 text-violet-400">
        <Activity size={12} className="animate-pulse" />
        Live: Polygon Amoy Testnet
      </div>
      <div className="flex items-center gap-4 text-slate-500">
        <span>Block: #4208129</span>
        <span className="flex items-center gap-1 text-green-500">
          <Globe size={10} /> Network Healthy
        </span>
      </div>
    </div>
  </div>
);

// ΓöÇΓöÇ Navbar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { account, connectWallet, isConnecting } = useBlockchain();
  const { user, logout } = useAuth();

  // Role-based navigation
  const institutionLinks = [
    { name: 'Issue Certs', path: '/admin', icon: GraduationCap },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];
  const organizationLinks = [
    { name: 'Verify', path: '/verify', icon: Search },
    { name: 'Graduate Wallet', path: '/graduate', icon: Wallet },
  ];

  const navLinks = !user ? [] : user.role === 'institution' ? institutionLinks : organizationLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  const roleColor = user?.role === 'institution' ? 'text-violet-400' : 'text-fuchsia-400';
  const roleBg = user?.role === 'institution' ? 'bg-violet-500/10 border-violet-500/20' : 'bg-fuchsia-500/10 border-fuchsia-500/20';

  return (
    <nav className="glass sticky top-4 z-50 mx-4 my-6 py-4 px-8 flex items-center justify-between border-white/5">
      <Link to={user ? (user.role === 'institution' ? '/admin' : '/verify') : '/'} className="flex items-center gap-2 group no-underline">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
          <Shield className="text-white" size={24} />
        </div>
        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          TrustCert
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.path} to={link.path}
              className={`nav-link flex items-center gap-1.5 ${location.pathname === link.path ? 'active' : ''}`}>
              <Icon size={14} /> {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* User badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${roleBg} ${roleColor}`}>
              {user.role === 'institution' ? <GraduationCap size={13} /> : <Briefcase size={13} />}
              <span className="max-w-[120px] truncate">{user.orgName}</span>
            </div>
            {/* MetaMask wallet */}
            <button onClick={connectWallet} disabled={isConnecting}
              className="btn btn-secondary py-2 px-3 text-xs hidden sm:flex">
              <Wallet size={14} />
              {account ? `${account.substring(0, 6)}...${account.substring(38)}` : (isConnecting ? '...' : 'Wallet')}
            </button>
            {/* Logout */}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-xs font-bold transition-all">
              <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary shadow-lg shadow-violet-500/20 text-sm">
            Sign In <ChevronRight size={16} />
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-0 w-full glass p-6 flex flex-col gap-2 md:hidden border-white/5">

            {user && (
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-2 border ${roleBg} ${roleColor}`}>
                {user.role === 'institution' ? <GraduationCap size={16} /> : <Briefcase size={16} />}
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-70">{user.orgName}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 no-underline text-white font-semibold">
                  <span className="flex items-center gap-2"><Icon size={16} /> {link.name}</span>
                  <ChevronRight size={18} className="text-slate-500" />
                </Link>
              );
            })}

            {user ? (
              <button onClick={() => { handleLogout(); setIsOpen(false); }}
                className="flex items-center gap-2 p-4 text-red-400 hover:text-red-300 font-bold text-sm">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}
                className="btn btn-primary justify-center mt-2">Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ΓöÇΓöÇ Role-guarded route ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to the right dashboard
    const home = user.role === 'institution' ? '/admin' : '/verify';
    return <Navigate to={home} replace />;
  }
  return children;
};

// ΓöÇΓöÇ App Routes ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const AppRoutes = () => {
  const { user, authLoading } = useAuth();
  const { account } = useBlockchain();
  const navigate = useNavigate();

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  const handleAuthSuccess = (userData) => {
    if (userData.role === 'institution') navigate('/admin');
    else navigate('/verify');
  };

  return (
    <>
      <NetworkStatus />
      <div className="min-h-screen container mx-auto pb-20">
        <Navbar />
        <main className="px-4">
          <Routes>
            {/* Public */}
            <Route path="/" element={user
              ? <Navigate to={user.role === 'institution' ? '/admin' : '/verify'} replace />
              : <Hero />}
            />
            <Route path="/login" element={user
              ? <Navigate to={user.role === 'institution' ? '/admin' : '/verify'} replace />
              : <AuthPage onSuccess={handleAuthSuccess} />}
            />

            {/* Institution only */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="institution">
                <AdminPortal account={account} user={user} />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRole="institution">
                <Analytics />
              </ProtectedRoute>
            } />

            {/* Organisation only */}
            <Route path="/verify" element={
              <ProtectedRoute allowedRole="organization">
                <VerificationPortal user={user} />
              </ProtectedRoute>
            } />
            <Route path="/graduate" element={
              <ProtectedRoute allowedRole="organization">
                <GraduateWallet account={account} />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
};

// ΓöÇΓöÇ Root App ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Router>
          <AppRoutes />
        </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
