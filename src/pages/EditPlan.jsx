import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function EditPlan() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchModelPortfolio();
  }, []);

  const fetchModelPortfolio = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/model-portfolio`);
      setFunds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePctChange = (index, value) => {
    const newFunds = [...funds];
    newFunds[index].allocation_pct = Number(value);
    setFunds(newFunds);
    setError(null);
    setSuccess(false);
  };

  const totalAllocation = funds.reduce((sum, f) => sum + (Number(f.allocation_pct) || 0), 0);

  const savePlan = async () => {
    if (Math.abs(totalAllocation - 100) > 0.01) {
      setError('Total allocation must equal 100% exactly.');
      return;
    }
    if (funds.length !== 5) {
      setError('Model portfolio must contain exactly 5 funds.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/model-portfolio`, { funds });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save the plan.');
      console.error(err);
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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Model Portfolio</h1>
        <p className="text-gray-500">Adjust the target allocation percentages for the recommended funds.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Allocation Rules</p>
          <ul className="list-disc list-inside space-y-1">
            <li>There must be exactly 5 funds in the model portfolio.</li>
            <li>The total allocation percentage must sum up to exactly 100%.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Target Allocations</h2>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${Math.abs(totalAllocation - 100) < 0.01 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            Total: {totalAllocation.toFixed(1)}%
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {funds.map((fund, index) => (
            <div key={fund.fund_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors bg-gray-50/30">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{fund.fund_name}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{fund.fund_id}</span>
                  <span>{fund.asset_class}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={fund.allocation_pct}
                  onChange={(e) => handlePctChange(index, e.target.value)}
                  className="w-32 sm:w-48 accent-indigo-600 disabled:opacity-50"
                  disabled={saving}
                />
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={fund.allocation_pct}
                    onChange={(e) => handlePctChange(index, e.target.value)}
                    className="w-20 pl-3 pr-8 py-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-medium text-gray-900"
                    disabled={saving}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                </div>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={savePlan}
              disabled={saving || Math.abs(totalAllocation - 100) > 0.01}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : (success ? 'Saved!' : 'Save Plan Changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
