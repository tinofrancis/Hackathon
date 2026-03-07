import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Eye, ShieldAlert, TrendingUp, RefreshCw, Award, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#8b5cf6', '#d946ef', '#a78bfa', '#e879f9'];

const StatCard = ({ label, value, icon: Icon, loading }) => (
    <div className="glass p-6">
        <div className="flex items-center gap-3 mb-4">
            <Icon size={20} className="text-violet-400" />
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-3xl font-black">
            {loading ? <span className="inline-block w-16 h-8 bg-slate-800 rounded animate-pulse" /> : value}
        </p>
    </div>
);

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/stats');
            setStats(data);
        } catch {
            // Fallback to mock data if backend is not running
            setStats({
                totalIssued: 12480,
                totalVerifications: 8245,
                uniqueVerifiers: 1120,
                revoked: 12,
                verificationActivity: [
                    { name: 'Jan', verifications: 400 }, { name: 'Feb', verifications: 300 },
                    { name: 'Mar', verifications: 600 }, { name: 'Apr', verifications: 800 },
                    { name: 'May', verifications: 500 }, { name: 'Jun', verifications: 900 }
                ],
                degreeDistribution: [
                    { name: 'Tech', value: 400 }, { name: 'Finance', value: 300 },
                    { name: 'Govt', value: 300 }, { name: 'Edu', value: 200 }
                ],
                recentCerts: []
            });
        } finally {
            setLoading(false);
            setLastRefreshed(new Date());
        }
    };

    useEffect(() => { fetchStats(); }, []);

    return (
        <div className="py-10">
            <div className="flex items-start justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Verification Analytics</h2>
                    <p className="text-slate-400">Live insights into certificate issuance and verification activity.</p>
                    <p className="text-slate-600 text-[10px] uppercase tracking-widest mt-1">
                        Last refreshed: {lastRefreshed.toLocaleTimeString()}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="btn btn-secondary py-2 px-4 text-xs uppercase font-bold tracking-widest"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Issued" value={stats?.totalIssued?.toLocaleString() || '0'} icon={TrendingUp} loading={loading} />
                <StatCard label="Total Verifications" value={stats?.totalVerifications?.toLocaleString() || '0'} icon={Eye} loading={loading} />
                <StatCard label="Unique Verifiers" value={stats?.uniqueVerifiers?.toLocaleString() || '0'} icon={Search} loading={loading} />
                <StatCard label="Revoked" value={stats?.revoked?.toLocaleString() || '0'} icon={ShieldAlert} loading={loading} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="glass p-8 min-h-[400px]">
                    <h3 className="text-xl font-bold mb-8">Verification Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.verificationActivity || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} itemStyle={{ color: '#f8fafc' }} />
                            <Bar dataKey="verifications" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass p-8 min-h-[400px]">
                    <h3 className="text-xl font-bold mb-8">Degree Distribution</h3>
                    <div className="flex h-[300px] items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats?.degreeDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {(stats?.degreeDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-1/3 space-y-3">
                            {(stats?.degreeDistribution || []).map((entry, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs text-slate-400">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Certificates from DB */}
            <div className="glass p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Award className="text-violet-400" size={20} /> Recently Issued Certificates
                </h3>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-900/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : stats?.recentCerts?.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recentCerts.map((cert, i) => (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-violet-500/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle2 size={18} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{cert.name}</p>
                                        <p className="text-xs text-slate-500">{cert.degree} · {cert.graduationYear}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-[10px] text-violet-400">{cert.id}</p>
                                    <p className="text-[10px] text-slate-600 flex items-center gap-1 justify-end mt-0.5">
                                        <Clock size={8} /> {new Date(cert.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-600">
                        <Award size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">No certificates issued yet.</p>
                        <p className="text-sm mt-1">Go to the Admin Portal to issue your first certificate!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
