"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiAlertTriangle, FiTrendingUp, FiActivity, FiDatabase, FiSettings, FiUser, FiLogOut, FiBell, FiSun, FiMoon } from 'react-icons/fi';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Mock data - replace with real API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAlerts([
        { id: 1, type: 'warning', message: 'Oxygen supply at 25% capacity', time: '10 mins ago' },
        { id: 2, type: 'critical', message: 'ICU beds at 95% occupancy', time: '25 mins ago' },
        { id: 3, type: 'info', message: 'Antibiotic stock replenished', time: '2 hours ago' }
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const metrics = {
    beds: {
      total: 150,
      occupied: 112,
      available: 38,
      icu: { total: 20, occupied: 19 },
      isolation: { total: 15, occupied: 8 }
    },
    oxygen: {
      capacity: 5000, // liters
      remaining: 1250,
      usageRate: '250L/hr'
    },
    medicines: {
      antibiotics: { stock: 150, threshold: 50 },
      antivirals: { stock: 85, threshold: 30 },
      analgesics: { stock: 320, threshold: 100 }
    },
    patients: {
      total: 112,
      admissions: 8,
      discharges: 5,
      waiting: 14
    }
  };

  const predictions = {
    beds: [
      { day: 'Today', required: 22 },
      { day: 'Tomorrow', required: 28 },
      { day: 'Day 3', required: 31 },
      { day: 'Day 4', required: 29 },
      { day: 'Day 5', required: 26 }
    ],
    oxygen: [
      { hour: '6AM', usage: 200 },
      { hour: '9AM', usage: 280 },
      { hour: '12PM', usage: 320 },
      { hour: '3PM', usage: 290 },
      { hour: '6PM', usage: 250 },
      { hour: '9PM', usage: 180 }
    ]
  };

  const aiSummary = [
    "ICU bed capacity will likely be exceeded within 24 hours",
    "Oxygen supply at current usage will last approximately 5 hours",
    "Antibiotic stock needs replenishment within 2 days",
    "Isolation ward capacity is adequate for predicted admissions"
  ];

  const handleLogout = () => {
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navigateTo = (path) => {
    setActiveTab(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiActivity },
    { id: 'resources', label: 'Resources', icon: FiDatabase },
    { id: 'prediction', label: 'AI Predictions', icon: FiTrendingUp },
    { id: 'alerts', label: 'Alerts', icon: FiAlertTriangle, badge: alerts.filter(a => a.type === 'critical').length },
    { id: 'export', label: 'Export', icon: FiDatabase },
    { id: 'admin', label: 'Admin', icon: FiSettings }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Head>
        <title>Dashboard | Hospital Resource Optimizer</title>
      </Head>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform lg:hidden ${
          darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className={`flex items-center justify-between h-16 px-4 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          <div className="flex items-center">
            <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className={`ml-2 text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Hospital Hub</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="mt-6 flex-1">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    activeTab === item.id 
                      ? darkMode 
                        ? 'bg-cyan-900 text-cyan-100' 
                        : 'bg-cyan-50 text-cyan-600'
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Sidebar Footer */}
          <div className={`absolute bottom-0 w-full ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <div className="px-2 py-2 space-y-1">
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                <span className="ml-3">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                onClick={() => navigateTo('profile')}
                className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                  activeTab === 'profile' 
                    ? darkMode 
                      ? 'bg-cyan-900 text-cyan-100' 
                      : 'bg-cyan-50 text-cyan-600'
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUser className="h-5 w-5" />
                <span className="ml-3">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </motion.div>

      {/* Desktop Top Navbar */}
      <div className={`hidden lg:block sticky top-0 z-40 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="px-6 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center">
              <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Hospital Hub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeTab === item.id 
                        ? darkMode 
                          ? 'bg-cyan-900 text-cyan-100' 
                          : 'bg-cyan-50 text-cyan-600'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop Right Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 relative">
                <FiBell className="h-5 w-5" />
                {alerts.filter(a => a.type === 'critical').length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>

              {/* Profile */}
              <button
                onClick={() => navigateTo('profile')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === 'profile' 
                    ? darkMode 
                      ? 'bg-cyan-900 text-cyan-100' 
                      : 'bg-cyan-50 text-cyan-600'
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <span className="text-sm font-medium">Admin</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className={`lg:hidden sticky top-0 z-40 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-3"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 relative">
              <FiBell className="h-5 w-5" />
              {alerts.filter(a => a.type === 'critical').length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
              U
            </div>
          </div>
        </div>
      </div>

        <main className="py-4 px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <>
              {/* Critical Alerts */}
              {alerts.filter(a => a.type === 'critical').length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 border-l-4 border-red-500 p-4 ${darkMode ? 'bg-gray-800' : 'bg-red-50'}`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>Critical Alerts</h3>
                      <div className={`mt-2 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                        <ul className="list-disc pl-5 space-y-1">
                          {alerts.filter(a => a.type === 'critical').map(alert => (
                            <li key={alert.id}>{alert.message} <span className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>({alert.time})</span></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Resource Summary Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
  {/* Bed Availability Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm transition-all duration-300 hover:shadow-md`}
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-10 from-cyan-400 to-blue-500"></div>
    <div className="relative px-5 py-6">
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-3 rounded-lg ${darkMode ? 'bg-cyan-600' : 'bg-cyan-100'} shadow-sm`}>
          <svg className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-cyan-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-1`}>Available Beds</h3>
          <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {metrics.beds.available} <span className="text-lg font-medium text-gray-400">/ {metrics.beds.total}</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full" 
              style={{ width: `${(metrics.beds.available / metrics.beds.total) * 100}%` }}
            ></div>
          </div>
          <div className={`mt-3 flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
              ICU: {metrics.beds.icu.occupied}/{metrics.beds.icu.total}
            </span>
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${darkMode ? 'bg-cyan-400' : 'bg-cyan-600'}`}></span>
              Isolation: {metrics.beds.isolation.occupied}/{metrics.beds.isolation.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>

  {/* Oxygen Supply Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm transition-all duration-300 hover:shadow-md`}
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-10 from-amber-400 to-orange-500"></div>
    <div className="relative px-5 py-6">
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-3 rounded-lg ${darkMode ? 'bg-amber-600' : 'bg-amber-100'} shadow-sm`}>
          <svg className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-amber-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-1`}>Oxygen Supply</h3>
          <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {(metrics.oxygen.remaining / 1000).toFixed(1)}k <span className="text-lg font-medium text-gray-400">/ {(metrics.oxygen.capacity / 1000).toFixed(1)}k L</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full" 
              style={{ width: `${(metrics.oxygen.remaining / metrics.oxygen.capacity) * 100}%` }}
            ></div>
          </div>
          <div className={`mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${metrics.oxygen.usageRate > 50 ? 'bg-red-500' : 'bg-green-500'}`}></span>
            Current usage: {metrics.oxygen.usageRate}%
          </div>
        </div>
      </div>
    </div>
  </motion.div>

  {/* Medicine Stock Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm transition-all duration-300 hover:shadow-md`}
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-10 from-emerald-400 to-green-500"></div>
    <div className="relative px-5 py-6">
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-3 rounded-lg ${darkMode ? 'bg-emerald-600' : 'bg-emerald-100'} shadow-sm`}>
          <svg className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-emerald-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-1`}>Medicine Stock</h3>
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Critical Items</p>
          
          <div className="space-y-3">
            <div>
              <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                <span>Antibiotics</span>
                <span className={`font-medium ${metrics.medicines.antibiotics.stock < metrics.medicines.antibiotics.threshold ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.medicines.antibiotics.stock}/{metrics.medicines.antibiotics.threshold}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className={`h-1.5 rounded-full ${metrics.medicines.antibiotics.stock < metrics.medicines.antibiotics.threshold ? 'bg-gradient-to-r from-red-400 to-pink-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`}
                  style={{ width: `${(metrics.medicines.antibiotics.stock / (metrics.medicines.antibiotics.threshold * 1.5)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                <span>Antivirals</span>
                <span className={`font-medium ${metrics.medicines.antivirals.stock < metrics.medicines.antivirals.threshold ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.medicines.antivirals.stock}/{metrics.medicines.antivirals.threshold}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className={`h-1.5 rounded-full ${metrics.medicines.antivirals.stock < metrics.medicines.antivirals.threshold ? 'bg-gradient-to-r from-red-400 to-pink-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`}
                  style={{ width: `${(metrics.medicines.antivirals.stock / (metrics.medicines.antivirals.threshold * 1.5)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>

  {/* Patients Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm transition-all duration-300 hover:shadow-md`}
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-10 from-purple-400 to-indigo-500"></div>
    <div className="relative px-5 py-6">
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-3 rounded-lg ${darkMode ? 'bg-purple-600' : 'bg-purple-100'} shadow-sm`}>
          <svg className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-purple-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-1`}>Patients</h3>
          <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {metrics.patients.total}
          </p>
          <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${darkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
              Admissions: {metrics.patients.admissions}
            </span>
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
              Discharges: {metrics.patients.discharges}
            </span>
          </div>
          <div>
            <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              <span>Waiting Patients</span>
              <span className={`font-medium ${metrics.patients.waiting > 10 ? 'text-amber-500' : 'text-green-500'}`}>
                {metrics.patients.waiting}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-purple-400 to-indigo-500 h-1.5 rounded-full"
                style={{ width: `${Math.min((metrics.patients.waiting / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
</div>

              {/* Charts and Predictions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-6 rounded-lg shadow lg:col-span-2 transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bed Requirement Forecast (Next 5 Days)</h2>
                  <div className="h-64">
                    <div className="flex h-full">
                      {predictions.beds.map((day, index) => (
                        <div key={day.day} className="flex-1 flex flex-col justify-end px-2">
                          <div className="flex justify-center">
                            <div
                              className="w-8 bg-cyan-500 rounded-t hover:bg-cyan-600 transition-colors duration-200"
                              style={{ height: `${(day.required / 40) * 100}%` }}
                              title={`${day.required} beds`}
                            ></div>
                          </div>
                          <div className={`text-center text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day.day}</div>
                        </div>
                      ))}
                    </div>
                    <div className={`flex justify-between text-xs mt-2 px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>0</span>
                      <span>20</span>
                      <span>40</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Oxygen Usage Pattern</h2>
                  <div className="h-64">
                    <div className="flex h-full items-end">
                      {predictions.oxygen.map((hour, index) => (
                        <div key={hour.hour} className="flex-1 flex flex-col justify-end px-1">
                          <div
                            className="w-full bg-amber-500 rounded-t hover:bg-amber-600 transition-colors duration-200"
                            style={{ height: `${(hour.usage / 400) * 100}%` }}
                            title={`${hour.usage}L at ${hour.hour}`}
                          ></div>
                          <div className={`text-center text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{hour.hour}</div>
                        </div>
                      ))}
                    </div>
                    <div className={`flex justify-between text-xs mt-2 px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>0</span>
                      <span>200</span>
                      <span>400L</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* AI Summary and Recent Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className={`p-6 rounded-lg shadow lg:col-span-2 transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Resource Summary</h2>
                  <div className="space-y-4">
                    {aiSummary.map((item, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</p>
                        </div>
                      </div>
                    ))}
                    <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                      <button className={`text-sm font-medium ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                        View detailed recommendations →
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className={`p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Alerts</h2>
                    <button className={`text-sm font-medium ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                      View all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {alerts.map(alert => (
                      <div key={alert.id} className="flex">
                        <div className="flex-shrink-0">
                          {alert.type === 'critical' && <FiAlertTriangle className="h-5 w-5 text-red-500" />}
                          {alert.type === 'warning' && <FiAlertTriangle className="h-5 w-5 text-amber-500" />}
                          {alert.type === 'info' && <FiAlertTriangle className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{alert.message}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </main>
      </div>
  );
}