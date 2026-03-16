import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownRight, Minus, IndianRupee, RefreshCw, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/portfolio`);
      setData(res.data);
      // Reset saved state whenever fresh data is loaded
      setAlreadySaved(false);
      setSaveMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveRebalancing = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/api/rebalance/save`, data);
      setSavedSuccess(true);
      setAlreadySaved(true);
      setSaveMessage('Saved successfully');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // No changes — already saved
        setAlreadySaved(true);
        setSaveMessage('Already up-to-date');
      } else {
        console.error('Failed to save', error);
        setSaveMessage('Save failed');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, items } = data;

  const getActionBadge = (action) => {
    switch (action) {
      case 'BUY':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><ArrowUpRight className="w-3 h-3" /> BUY</span>;
      case 'SELL':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><ArrowDownRight className="w-3 h-3" /> SELL</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Minus className="w-3 h-3" /> REVIEW</span>;
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Rebalancing Dashboard</h1>
          <p className="text-gray-500">Compare current investments against the recommended model portfolio.</p>
        </div>
        <button
          onClick={saveRebalancing}
          disabled={saving || alreadySaved}
          title={alreadySaved ? 'No changes to save. Portfolio data is unchanged since last save.' : ''}
          className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 ${
            alreadySaved
              ? 'bg-gray-400 cursor-not-allowed shadow-gray-200 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
          }`}
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : (savedSuccess || alreadySaved ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />)}
          {saving ? 'Saving...' : (saveMessage || 'Save Rebalancing')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.total_portfolio_value)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <p className="text-sm text-emerald-600 font-medium mb-1">Total to BUY</p>
          <p className="text-3xl font-bold text-emerald-700">{formatCurrency(summary.total_buy)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 bg-gradient-to-br from-white to-red-50/30">
          <p className="text-sm text-red-600 font-medium mb-1">Total to SELL</p>
          <p className="text-3xl font-bold text-red-700">{formatCurrency(summary.total_sell)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
          <p className="text-sm text-indigo-600 font-medium mb-1">Fresh Money Needed</p>
          <p className="text-3xl font-bold text-indigo-700">{formatCurrency(summary.net_cash_needed)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Rebalancing Actions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Fund Name</th>
                <th className="px-6 py-4 text-right">Plan %</th>
                <th className="px-6 py-4 text-right">Today %</th>
                <th className="px-6 py-4 text-right">Drift</th>
                <th className="px-6 py-4 text-center">Action</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div>{item.fund_name}</div>
                    {!item.is_model_fund && <div className="text-xs font-normal text-amber-600 mt-0.5">Note: Not in advisor plan</div>}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{item.target_pct !== null ? `${item.target_pct}%` : '-'}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{item.current_pct.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">
                    {item.drift !== null ? (
                      <span className={item.drift > 0 ? 'text-emerald-600' : item.drift < 0 ? 'text-red-600' : 'text-gray-500'}>
                        {item.drift > 0 ? '+' : ''}{item.drift.toFixed(1)}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">{getActionBadge(item.action)}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
