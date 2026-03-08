import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Hardcoded demo accounts for offline fallback
const DEMO_ACCOUNTS = [
    { id: 'demo-inst-001', name: 'Admin User', orgName: 'IIT Bombay', orgType: 'institution', email: 'admin@iitbombay.edu', password: 'demo1234', role: 'institution' },
    { id: 'demo-org-001', name: 'HR Manager', orgName: 'Google Inc.', orgType: 'organization', email: 'hr@google.com', password: 'demo1234', role: 'organization' },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkUser = () => {
            const saved = localStorage.getItem('trustcert_user');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Validate role to prevent broken sessions from getting stuck
                    if (parsed && typeof parsed.role === 'string') {
                        setUser(parsed);
                    } else {
                        localStorage.removeItem('trustcert_user');
                    }
                } catch {
                    localStorage.removeItem('trustcert_user');
                }
            }
            setAuthLoading(false);
        };
        // Small delay to allow aggressive caching to clear visually
        setTimeout(checkUser, 100);
    }, []);

    const persist = (userData) => {
        setUser(userData);
        localStorage.setItem('trustcert_user', JSON.stringify(userData));
    };

    const register = async ({ name, orgName, orgType, email, password }) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, orgName, orgType, email, password }, { timeout: 4000 });
            persist(data.user);
            return data.user;
        } catch (err) {
            // If backend is offline, use local registration
            if (!err.response) {
                const localUser = { id: 'local-' + Date.now(), name, orgName, orgType, email, role: orgType };
                persist(localUser);
                return localUser;
            }
            throw err;
        }
    };

    const login = async ({ email, password }) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password }, { timeout: 4000 });
            persist(data.user);
            return data.user;
        } catch (err) {
            // If backend is offline, fall back to demo accounts
            if (!err.response) {
                const demo = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
                if (demo) {
                    const { password: _, ...safeDemo } = demo;
                    persist(safeDemo);
                    return safeDemo;
                }
                throw { response: { data: { error: 'Backend server not running. Click "Start Backend" or use the demo buttons.' } } };
            }
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('trustcert_user');
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
