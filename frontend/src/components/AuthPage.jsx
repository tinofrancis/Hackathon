import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2,
    GraduationCap, Briefcase, Mail, Lock, User, Building2,
    ChevronLeft, Zap, Globe, ShieldCheck, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   ORG TYPE CONFIG
───────────────────────────────────────────── */
const ORG_TYPES = [
    {
        id: 'institution',
        label: 'Educational Institution',
        subtitle: 'University · College · School · Training Institute',
        icon: GraduationCap,
        access: ['Issue & sign certificates on-chain', 'Bulk CSV upload', 'Analytics dashboard', 'Revoke credentials'],
        accent: '#8b5cf6',
        glow: 'rgba(139,92,246,0.25)',
        border: 'rgba(139,92,246,0.4)',
        bg: 'rgba(139,92,246,0.08)',
        tag: 'ISSUER',
    },
    {
        id: 'organization',
        label: 'Company / Organisation',
        subtitle: 'Employer · Government · Verification Agency',
        icon: Briefcase,
        access: ['Instant certificate verification', 'QR code scanner', 'Bulk verification', 'Download verified PDFs'],
        accent: '#d946ef',
        glow: 'rgba(217,70,239,0.2)',
        border: 'rgba(217,70,239,0.4)',
        bg: 'rgba(217,70,239,0.08)',
        tag: 'VERIFIER',
    },
];

/* ─────────────────────────────────────────────
   ANIMATED DOT GRID (decorative)
───────────────────────────────────────────── */
const DotGrid = () => {
    const dots = Array.from({ length: 80 });
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {dots.map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 3, height: 3,
                        borderRadius: '50%',
                        background: 'rgba(139,92,246,0.4)',
                        left: `${(i % 10) * 11 + 3}%`,
                        top: `${Math.floor(i / 10) * 12 + 4}%`,
                    }}
                    animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.4, 1] }}
                    transition={{ duration: 3 + (i % 5) * 0.7, repeat: Infinity, delay: (i % 8) * 0.3 }}
                />
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   LEFT BRAND PANEL
───────────────────────────────────────────── */
const BrandPanel = ({ selectedType }) => {
    const type = ORG_TYPES.find(t => t.id === selectedType);
    const features = [
        { icon: ShieldCheck, text: 'Military-grade cryptography on Polygon' },
        { icon: Zap, text: 'Certificates issued in under 3 seconds' },
        { icon: Globe, text: 'Verifiable anywhere in the world' },
        { icon: Star, text: 'Zero-knowledge selective disclosure' },
    ];

    return (
        <div style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0a2a 50%, #0a0a1a 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '56px 52px', minHeight: '100vh',
        }}>
            {/* Glowing orbs */}
            <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 340, height: 340, borderRadius: '50%', background: 'rgba(139,92,246,0.18)', filter: 'blur(90px)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: 280, height: 280, borderRadius: '50%', background: 'rgba(217,70,239,0.12)', filter: 'blur(80px)' }} />
            <AnimatePresence>
                {type && (
                    <motion.div key={type.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', top: '40%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: type.glow, filter: 'blur(100px)', pointerEvents: 'none' }} />
                )}
            </AnimatePresence>
            <DotGrid />

            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
                    <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(124,58,237,0.5)' }}>
                        <Shield size={28} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(90deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TrustCert</div>
                        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginTop: 1 }}>Blockchain Portal</div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {type ? (
                        <motion.div key="typed" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                            <div style={{ fontSize: 13, color: type.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
                                ✦ {type.tag} ACCESS
                            </div>
                            <h2 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.15, color: '#fff', marginBottom: 20 }}>{type.label}</h2>
                            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>{type.subtitle}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {type.access.map((a, i) => (
                                    <motion.div key={a} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 6, background: type.bg, border: `1px solid ${type.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CheckCircle2 size={12} color={type.accent} />
                                        </div>
                                        <span style={{ color: '#d1d5db', fontSize: 13 }}>{a}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                            <h2 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.15, color: '#fff', marginBottom: 20 }}>
                                Secure Academic<br />
                                <span style={{ background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Credentials</span><br />
                                on Blockchain.
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.8, maxWidth: 340 }}>
                                The world's most trusted platform for issuing, managing, and verifying academic certificates using Polygon blockchain technology.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Features */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', marginBottom: 32 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {features.map(({ icon: Icon, text }, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 28, height: 28, background: 'rgba(139,92,246,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <Icon size={13} color="#a78bfa" />
                            </div>
                            <span style={{ color: '#9ca3af', fontSize: 11, lineHeight: 1.6 }}>{text}</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 32, display: 'flex', gap: 24, alignItems: 'center' }}>
                    {['100+ Institutions', '1M+ Certs Issued', '50K+ Verifications'].map((s, i) => (
                        <div key={i}>
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{s.split(' ')[0]}</div>
                            <div style={{ color: '#4b5563', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>{s.split(' ').slice(1).join(' ')}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN AUTH PAGE
───────────────────────────────────────────── */
const AuthPage = ({ onSuccess }) => {
    const { register, login } = useAuth();
    const [mode, setMode] = useState('login');
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', orgName: '', email: '', password: '', confirmPassword: '' });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const reset = () => { setForm({ name: '', orgName: '', email: '', password: '', confirmPassword: '' }); setError(''); setStep(1); setSelectedType(null); };

    const handleLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { const u = await login({ email: form.email, password: form.password }); onSuccess(u); }
        catch (err) { setError(err.response?.data?.error || 'Invalid email or password. Try the demo buttons below.'); }
        finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); setError('');
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        if (!selectedType) { setError('Please select your organisation type first.'); return; }
        setLoading(true);
        try { const u = await register({ name: form.name, orgName: form.orgName, orgType: selectedType, email: form.email, password: form.password }); onSuccess(u); }
        catch (err) { setError(err.response?.data?.error || 'Registration failed. Please try again.'); }
        finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '13px 16px', background: 'rgba(15,23,42,0.8)',
        border: '1px solid rgba(71,85,105,0.6)', borderRadius: 12, color: '#f1f5f9',
        fontSize: 14, outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };
    const labelStyle = { display: 'block', marginBottom: 7, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' };

    const InputField = ({ icon: Icon, label, type = 'text', id, placeholder, value, onChange, required, suffix }) => (
        <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>
                    <Icon size={15} />
                </div>
                <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
                    style={{ ...inputStyle, paddingLeft: 40, paddingRight: suffix ? 44 : 16 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.7)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(71,85,105,0.6)'}
                />
                {suffix && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>{suffix}</div>}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', position: 'fixed', inset: 0, zIndex: 100 }}>
            {/* ── LEFT: Brand Panel ── */}
            <BrandPanel selectedType={mode === 'register' && step === 2 ? selectedType : null} />

            {/* ── RIGHT: Auth Form ── */}
            <div style={{
                background: '#0c0c1e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 32px', overflowY: 'auto', position: 'relative',
            }}>
                {/* Subtle background glow */}
                <div style={{ position: 'absolute', top: '20%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(217,70,239,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }} className="md:hidden">
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={22} color="white" />
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#fff' }}>TrustCert</span>
                    </div>

                    {/* Header */}
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                            {mode === 'login' ? 'Welcome back' : step === 1 ? 'Choose access type' : 'Create your account'}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                            {mode === 'login' ? 'Sign in to your TrustCert dashboard.' : step === 1 ? 'Select how you will use TrustCert.' : 'Fill in your details to get started.'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(15,23,42,0.8)', borderRadius: 12, padding: 4, marginBottom: 28, border: '1px solid rgba(71,85,105,0.3)' }}>
                        {[['login', 'Sign In'], ['register', 'Register']].map(([m, l]) => (
                            <button key={m} type="button" onClick={() => { setMode(m); reset(); }}
                                style={{
                                    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                                    background: mode === m ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'transparent',
                                    color: mode === m ? '#fff' : '#64748b',
                                    boxShadow: mode === m ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
                                    transition: 'all 0.2s',
                                }}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ══ LOGIN FORM ══ */}
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleLogin}>

                                <InputField icon={Mail} label="Email Address" type="email" id="login-email"
                                    placeholder="admin@university.edu" value={form.email} onChange={e => set('email', e.target.value)} required />

                                <InputField icon={Lock} label="Password" type={showPass ? 'text' : 'password'} id="login-pass"
                                    placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required
                                    suffix={
                                        <button type="button" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    } />

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                                        {error}
                                    </motion.div>
                                )}

                                <button type="submit" disabled={loading} style={{
                                    width: '100%', padding: '14px 0', background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                    border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 4px 24px rgba(124,58,237,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase',
                                }}>
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Signing In...</> : <>Sign In <ArrowRight size={16} /></>}
                                </button>

                                {/* Divider */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(71,85,105,0.4)' }} />
                                    <span style={{ color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>QUICK DEMO</span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(71,85,105,0.4)' }} />
                                </div>

                                {/* Demo buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {[
                                        { label: 'Institution', sub: 'IIT Bombay', icon: GraduationCap, color: '#8b5cf6', email: 'admin@iitbombay.edu' },
                                        { label: 'Company', sub: 'Google Inc.', icon: Briefcase, color: '#d946ef', email: 'hr@google.com' },
                                    ].map(({ label, sub, icon: Icon, color, email }) => (
                                        <button key={email} type="button" onClick={() => { set('email', email); set('password', 'demo1234'); }}
                                            style={{
                                                padding: '13px 16px', background: 'rgba(15,23,42,0.8)', border: `1px solid ${color}30`,
                                                borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = color + '60'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = color + '30'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <Icon size={14} color={color} />
                                                <span style={{ color, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>{label}</span>
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{sub}</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.form>
                        )}

                        {/* ══ REGISTER STEP 1: TYPE SELECT ══ */}
                        {mode === 'register' && step === 1 && (
                            <motion.div key="reg1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                                    {ORG_TYPES.map(type => {
                                        const Icon = type.icon;
                                        const sel = selectedType === type.id;
                                        return (
                                            <motion.button key={type.id} type="button" onClick={() => setSelectedType(type.id)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                                style={{
                                                    padding: '20px 20px', borderRadius: 16, border: `2px solid ${sel ? type.border : 'rgba(71,85,105,0.3)'}`,
                                                    background: sel ? type.bg : 'rgba(15,23,42,0.5)', cursor: 'pointer', textAlign: 'left',
                                                    transition: 'all 0.2s', boxShadow: sel ? `0 0 24px ${type.glow}` : 'none',
                                                }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 11, background: sel ? type.bg : 'rgba(30,41,59,0.8)', border: `1px solid ${sel ? type.border : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Icon size={20} color={sel ? type.accent : '#64748b'} />
                                                        </div>
                                                        <div>
                                                            <div style={{ color: sel ? type.accent : '#e2e8f0', fontWeight: 800, fontSize: 14 }}>{type.label}</div>
                                                            <div style={{ color: '#475569', fontSize: 11, marginTop: 1 }}>{type.tag}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? type.accent : '#334155'}`, background: sel ? type.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {sel && <CheckCircle2 size={12} color="white" />}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{type.subtitle}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {type.access.slice(0, 2).map(a => (
                                                        <span key={a} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: sel ? type.bg : 'rgba(30,41,59,0.6)', color: sel ? type.accent : '#475569', border: `1px solid ${sel ? type.border : 'rgba(71,85,105,0.2)'}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                {error && (
                                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>
                                )}
                                <button type="button" onClick={() => { if (!selectedType) { setError('Please select an organisation type.'); return; } setError(''); setStep(2); }}
                                    style={{ width: '100%', padding: '14px 0', background: selectedType ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(71,85,105,0.3)', border: 'none', borderRadius: 12, color: selectedType ? '#fff' : '#64748b', fontWeight: 800, fontSize: 14, cursor: selectedType ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: selectedType ? '0 4px 24px rgba(124,58,237,0.35)' : 'none' }}>
                                    Continue <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {/* ══ REGISTER STEP 2: DETAILS ══ */}
                        {mode === 'register' && step === 2 && (
                            <motion.form key="reg2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRegister}>

                                {/* Type badge */}
                                {selectedType && (() => {
                                    const t = ORG_TYPES.find(x => x.id === selectedType);
                                    const Icon = t.icon;
                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: t.bg, border: `1px solid ${t.border}`, marginBottom: 22 }}>
                                            <Icon size={15} color={t.accent} />
                                            <span style={{ color: t.accent, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{t.label}</span>
                                            <button type="button" onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Change</button>
                                        </div>
                                    );
                                })()}

                                <InputField icon={User} label="Your Full Name" id="reg-name"
                                    placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} required />

                                <InputField icon={Building2} label={selectedType === 'institution' ? 'Institution Name' : 'Company Name'} id="reg-org"
                                    placeholder={selectedType === 'institution' ? 'IIT Bombay' : 'Google Inc.'} value={form.orgName} onChange={e => set('orgName', e.target.value)} required />

                                <InputField icon={Mail} label="Work Email" type="email" id="reg-email"
                                    placeholder={selectedType === 'institution' ? 'admin@university.edu' : 'hr@company.com'} value={form.email} onChange={e => set('email', e.target.value)} required />

                                <InputField icon={Lock} label="Password" type={showPass ? 'text' : 'password'} id="reg-pass"
                                    placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required
                                    suffix={<button type="button" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>} />

                                <InputField icon={Lock} label="Confirm Password" type="password" id="reg-pass2"
                                    placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                                        {error}
                                    </motion.div>
                                )}

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setStep(1)}
                                        style={{ padding: '13px 18px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(71,85,105,0.4)', borderRadius: 12, color: '#94a3b8', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                        <ChevronLeft size={15} /> Back
                                    </button>
                                    <button type="submit" disabled={loading}
                                        style={{ flex: 1, padding: '13px 0', background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7c3aed,#9333ea)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(124,58,237,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        {loading ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : <>Create Account <ArrowRight size={15} /></>}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p style={{ textAlign: 'center', color: '#334155', fontSize: 11, marginTop: 28 }}>
                        Protected by Polygon Blockchain · Zero data sold
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
