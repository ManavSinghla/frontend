import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function CurrentInvestments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/holdings`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const chartData = data.holdings.map(h => ({
    name: h.fund_name,
    value: h.current_value
  })).filter(h => h.value > 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Investments</h1>
        <p className="text-gray-500">Overview of Amit Sharma's current mutual fund holdings.</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <p className="text-indigo-100 font-medium">Total Portfolio Value</p>
            <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(data.total_portfolio_value)}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Holdings Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Fund Name</th>
                  <th className="px-6 py-4 text-right">Current Value</th>
                  <th className="px-6 py-4 text-right">% of Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.holdings.map((h, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        {h.fund_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(h.current_value)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{h.percent_of_portfolio.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 w-full mb-6">Asset Allocation</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
