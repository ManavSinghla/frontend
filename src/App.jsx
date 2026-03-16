import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PieChart, History as HistoryIcon, SlidersHorizontal, Briefcase } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import CurrentInvestments from './pages/CurrentInvestments';
import History from './pages/History';
import EditPlan from './pages/EditPlan';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/investments', label: 'Investments', icon: PieChart },
    { path: '/history', label: 'Rebalance History', icon: HistoryIcon },
    { path: '/edit-plan', label: 'Model Portfolio', icon: SlidersHorizontal },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
        <Briefcase className="w-6 h-6 text-indigo-600" />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
          Valuefy
        </h1>
      </div>
      <div className="p-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
        Client: Amit Sharma
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 text-xs text-center text-gray-400">
        Portfolio Rebalancer v1.0
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50/50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investments" element={<CurrentInvestments />} />
            <Route path="/history" element={<History />} />
            <Route path="/edit-plan" element={<EditPlan />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
