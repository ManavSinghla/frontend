import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history`);
      setSessions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-IN', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPLIED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Applied</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'DISMISSED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle className="w-3.5 h-3.5" /> Dismissed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rebalance History</h1>
        <p className="text-gray-500">View past portfolio rebalancing recommendations and their status.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-1">No history found</p>
            <p>Save a rebalancing recommendation from the dashboard to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-right">Portfolio Value</th>
                  <th className="px-6 py-4 text-right">Total BUY</th>
                  <th className="px-6 py-4 text-right">Total SELL</th>
                  <th className="px-6 py-4 text-right">Fresh Money Needed</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((session, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{formatDate(session.created_at)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(session.portfolio_value)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">{formatCurrency(session.total_to_buy)}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-medium">{formatCurrency(session.total_to_sell)}</td>
                    <td className="px-6 py-4 text-right text-indigo-600 font-medium">{formatCurrency(session.net_cash_needed)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(session.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
