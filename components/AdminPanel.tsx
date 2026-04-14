import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Eye, CreditCard, X, Activity, Calendar, Clock } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'visits' | 'payments'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Users
        const usersQuery = query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(50));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);

        // Fetch Visits
        const visitsQuery = query(collection(db, 'visits'), orderBy('timestamp', 'desc'), limit(100));
        const visitsSnapshot = await getDocs(visitsQuery);
        const visitsData = visitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVisits(visitsData);

        // Payments would be fetched here once a payment gateway is integrated
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-indigo-600" />
              Admin Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">Monitor your app's users, traffic, and revenue.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Activity size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Users size={18} /> Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'visits' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Eye size={18} /> Visits ({visits.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'payments' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CreditCard size={18} /> Payments
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700">Total Users</h3>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700">Total Visits</h3>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Eye size={20} /></div>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{visits.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700">Revenue</h3>
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><CreditCard size={20} /></div>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">₹0</p>
                      <p className="text-xs text-slate-500 mt-1">Requires Payment Gateway</p>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                          <th className="p-4 font-semibold">User</th>
                          <th className="p-4 font-semibold">Email</th>
                          <th className="p-4 font-semibold">Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-4 flex items-center gap-3">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><Users size={14} /></div>
                              )}
                              <span className="font-medium text-slate-900">{u.displayName || 'Unknown'}</span>
                            </td>
                            <td className="p-4 text-slate-600">{u.email}</td>
                            <td className="p-4 text-slate-500 text-sm">{formatDate(u.lastLogin)}</td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={3} className="p-8 text-center text-slate-500">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'visits' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                          <th className="p-4 font-semibold">Time</th>
                          <th className="p-4 font-semibold">Device / Browser</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visits.map(v => (
                          <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-4 text-slate-900 font-medium whitespace-nowrap">{formatDate(v.timestamp)}</td>
                            <td className="p-4 text-slate-500 text-sm truncate max-w-md">{v.userAgent}</td>
                          </tr>
                        ))}
                        {visits.length === 0 && (
                          <tr><td colSpan={2} className="p-8 text-center text-slate-500">No visits recorded yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-2xl mx-auto mt-10">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Gateway Required</h3>
                    <p className="text-slate-600 mb-6">
                      To track real UPI payments and automatically add coins to users' accounts, you need to integrate a payment gateway like <strong>Razorpay</strong> or <strong>Cashfree</strong>.
                    </p>
                    <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-2">
                      <p><strong>Why?</strong> Right now, your QR code opens a UPI app, but your website has no way of knowing if the user actually completed the payment or cancelled it.</p>
                      <p><strong>How to fix:</strong> A backend server (Node.js) is required to receive "Webhooks" from the payment provider to verify the transaction securely.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
