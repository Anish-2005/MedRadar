"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiPlus, FiRefreshCw, FiDownload, FiUpload, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function Resources() {
    const [activeTab, setActiveTab] = useState('beds');
    const [isLoading, setIsLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const router = useRouter();

    // Mock data - replace with real API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const resourceData = {
        beds: {
            summary: {
                total: 150,
                occupied: 112,
                available: 38,
                occupancyRate: 75,
                icu: { total: 20, occupied: 19, available: 1 },
                isolation: { total: 15, occupied: 8, available: 7 },
                pediatric: { total: 10, occupied: 5, available: 5 },
                maternity: { total: 8, occupied: 3, available: 5 }
            },
            details: [
                { id: 1, ward: 'General Ward', total: 97, occupied: 77, available: 20, lastUpdated: '10 mins ago' },
                { id: 2, ward: 'ICU', total: 20, occupied: 19, available: 1, lastUpdated: '5 mins ago' },
                { id: 3, ward: 'Isolation', total: 15, occupied: 8, available: 7, lastUpdated: '15 mins ago' },
                { id: 4, ward: 'Pediatric', total: 10, occupied: 5, available: 5, lastUpdated: '20 mins ago' },
                { id: 5, ward: 'Maternity', total: 8, occupied: 3, available: 5, lastUpdated: '30 mins ago' }
            ],
            history: [
                { date: 'Today', time: '08:00 AM', action: 'Patient discharge', ward: 'General', bedsChanged: +2 },
                { date: 'Today', time: '07:30 AM', action: 'New admission', ward: 'ICU', bedsChanged: -1 },
                { date: 'Yesterday', time: '11:45 PM', action: 'Patient transfer', ward: 'Isolation', bedsChanged: +1 },
                { date: 'Yesterday', time: '09:20 PM', action: 'Emergency admission', ward: 'General', bedsChanged: -1 }
            ]
        },
        oxygen: {
            summary: {
                capacity: 5000, // liters
                remaining: 1250,
                usageRate: '250L/hr',
                estimatedRemaining: '5 hours',
                cylinders: { total: 50, inUse: 32, available: 18 },
                tanks: { total: 4, inUse: 3, available: 1 }
            },
            details: [
                { id: 1, type: 'Cylinder (40L)', total: 50, inUse: 32, available: 18, status: 'Normal' },
                { id: 2, type: 'Bulk Tank (1000L)', total: 4, inUse: 3, available: 1, status: 'Critical' }
            ],
            history: [
                { date: 'Today', time: '06:00 AM', action: 'Cylinder refill', quantity: 10, staff: 'Nurse Roy' },
                { date: 'Yesterday', time: '10:30 PM', action: 'Tank replenishment', quantity: 2000, staff: 'Dr. Sharma' },
                { date: 'Yesterday', time: '04:15 PM', action: 'Cylinder usage', quantity: -5, staff: 'Auto' }
            ]
        },
        medicines: {
            summary: {
                criticalItems: 4,
                lowStock: 2,
                adequateStock: 5
            },
            details: [
                {
                    id: 1,
                    name: 'Antibiotics (Ceftriaxone)',
                    stock: 150,
                    threshold: 50,
                    status: 'Adequate',
                    usageRate: '25/day',
                    estimatedDepletion: '6 days'
                },
                {
                    id: 2,
                    name: 'Antivirals (Remdesivir)',
                    stock: 85,
                    threshold: 30,
                    status: 'Adequate',
                    usageRate: '15/day',
                    estimatedDepletion: '5.6 days'
                },
                {
                    id: 3,
                    name: 'Analgesics (Paracetamol)',
                    stock: 320,
                    threshold: 100,
                    status: 'Adequate',
                    usageRate: '40/day',
                    estimatedDepletion: '8 days'
                },
                {
                    id: 4,
                    name: 'Sedatives (Midazolam)',
                    stock: 42,
                    threshold: 20,
                    status: 'Low',
                    usageRate: '8/day',
                    estimatedDepletion: '5.2 days'
                },
                {
                    id: 5,
                    name: 'Vasopressors (Noradrenaline)',
                    stock: 18,
                    threshold: 15,
                    status: 'Critical',
                    usageRate: '3/day',
                    estimatedDepletion: '6 days'
                }
            ],
            history: [
                { date: 'Today', time: '08:30 AM', action: 'New delivery', item: 'Paracetamol', quantity: 100, staff: 'Pharm. Kumar' },
                { date: 'Yesterday', time: '04:00 PM', action: 'Usage', item: 'Remdesivir', quantity: -12, staff: 'Auto' },
                { date: 'Yesterday', time: '11:00 AM', action: 'Adjustment', item: 'Midazolam', quantity: +5, staff: 'Pharm. Singh' }
            ]
        }
    };

    const toggleSection = (section) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    const handleAddResource = () => {
        // Implement add resource logic
        console.log(`Add new ${activeTab} resource`);
    };

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    const handleExport = () => {
        // Implement export logic
        console.log(`Export ${activeTab} data`);
    };

    const handleImport = () => {
        // Implement import logic
        console.log(`Import ${activeTab} data`);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'beds':
                return (
                    <div className="space-y-6">
                        {/* Bed Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Beds</h3>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.beds.summary.total}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Occupied Beds</h3>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.beds.summary.occupied} <span className="text-sm font-normal text-gray-500">({resourceData.beds.summary.occupancyRate}%)</span>
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Available Beds</h3>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.beds.summary.available}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>ICU Availability</h3>
                                <p className={`text-2xl font-bold mt-1 ${resourceData.beds.summary.icu.available === 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.beds.summary.icu.available}/{resourceData.beds.summary.icu.total}
                                </p>
                            </div>
                        </div>

                        {/* Bed Details */}
                        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSection('bedDetails')}
                            >
                                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bed Details by Ward</h2>
                                {expandedSection === 'bedDetails' ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>

                            {expandedSection === 'bedDetails' && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Ward</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Total</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Occupied</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Available</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Last Updated</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                {resourceData.beds.details.map((ward) => (
                                                    <tr key={ward.id}>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ward.ward}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ward.total}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${ward.occupied === ward.total ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {ward.occupied}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${ward.available === 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {ward.available}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ward.lastUpdated}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className={`mr-2 ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                                                                <FiEdit2 />
                                                            </button>
                                                            <button className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className={`px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex-1 flex justify-between items-center">
                                            <button
                                                onClick={handleAddResource}
                                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${darkMode ? 'ring-offset-gray-800' : ''}`}
                                            >
                                                <FiPlus className="mr-1" /> Add Ward
                                            </button>
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                Showing <span className="font-medium">1</span> to <span className="font-medium">{resourceData.beds.details.length}</span> of{' '}
                                                <span className="font-medium">{resourceData.beds.details.length}</span> wards
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bed History */}
                        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSection('bedHistory')}
                            >
                                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Bed Changes</h2>
                                {expandedSection === 'bedHistory' ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>

                            {expandedSection === 'bedHistory' && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Time</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Ward</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Beds Changed</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                {resourceData.beds.history.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{entry.date}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{entry.time}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.action}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.ward}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.bedsChanged > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {entry.bedsChanged > 0 ? '+' : ''}{entry.bedsChanged}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'oxygen':
                return (
                    <div className="space-y-6">
                        {/* Oxygen Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Capacity</h3>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {(resourceData.oxygen.summary.capacity / 1000).toFixed(1)}k L
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Remaining</h3>
                                <p className={`text-2xl font-bold mt-1 ${resourceData.oxygen.summary.remaining < 1000 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {(resourceData.oxygen.summary.remaining / 1000).toFixed(1)}k L
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Usage Rate</h3>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.oxygen.summary.usageRate}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Estimated Remaining</h3>
                                <p className={`text-2xl font-bold mt-1 ${resourceData.oxygen.summary.estimatedRemaining.includes('hour') ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.oxygen.summary.estimatedRemaining}
                                </p>
                            </div>
                        </div>

                        {/* Oxygen Details */}
                        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSection('oxygenDetails')}
                            >
                                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Oxygen Supply Details</h2>
                                {expandedSection === 'oxygenDetails' ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>

                            {expandedSection === 'oxygenDetails' && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Type</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Total</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>In Use</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Available</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                {resourceData.oxygen.details.map((type) => (
                                                    <tr key={type.id}>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{type.type}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{type.total}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{type.inUse}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${type.available === 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {type.available}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${type.status === 'Critical'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                }`}>
                                                                {type.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className={`mr-2 ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                                                                <FiEdit2 />
                                                            </button>
                                                            <button className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className={`px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex-1 flex justify-between items-center">
                                            <button
                                                onClick={handleAddResource}
                                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${darkMode ? 'ring-offset-gray-800' : ''}`}
                                            >
                                                <FiPlus className="mr-1" /> Add Supply
                                            </button>
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                Showing <span className="font-medium">1</span> to <span className="font-medium">{resourceData.oxygen.details.length}</span> of{' '}
                                                <span className="font-medium">{resourceData.oxygen.details.length}</span> types
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Oxygen History */}
                        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSection('oxygenHistory')}
                            >
                                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Oxygen Usage History</h2>
                                {expandedSection === 'oxygenHistory' ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>

                            {expandedSection === 'oxygenHistory' && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Time</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Quantity (L)</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Staff</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                {resourceData.oxygen.history.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{entry.date}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{entry.time}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.action}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.staff}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'medicines':
                return (
                    <div className="space-y-6">
                        {/* Medicine Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Critical Items</h3>
                                <p className={`text-2xl font-bold mt-1 ${resourceData.medicines.summary.criticalItems > 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.medicines.summary.criticalItems}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Low Stock Items</h3>
                                <p className={`text-2xl font-bold mt-1 ${resourceData.medicines.summary.lowStock > 0 ? 'text-amber-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.medicines.summary.lowStock}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Adequate Stock</h3>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {resourceData.medicines.summary.adequateStock}
                                </p>
                            </div>
                        </div>

                        {/* Medicine Details */}
                        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSection('medicineDetails')}
                            >
                                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Medicine Stock Details</h2>
                                {expandedSection === 'medicineDetails' ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>

                            {expandedSection === 'medicineDetails' && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Medicine</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Current Stock</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Threshold</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Usage Rate</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Estimated Depletion</th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                {resourceData.medicines.details.map((medicine) => (
                                                    <tr key={medicine.id}>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.name}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${medicine.stock < medicine.threshold
                                                                ? 'text-red-500'
                                                                : darkMode
                                                                    ? 'text-white'
                                                                    : 'text-gray-900'
                                                            }`}>{medicine.stock}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.threshold}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${medicine.status === 'Critical'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    : medicine.status === 'Low'
                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                }`}>
                                                                {medicine.status}
                                                            </span>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.usageRate}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.estimatedDepletion}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className={`mr-2 ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                                                                <FiEdit2 />
                                                            </button>
                                                            <button className={darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className={`px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex-1 flex justify-between items-center">
                                            <button
                                                onClick={handleAddResource}
                                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${darkMode ? 'ring-offset-gray-800' : ''}`}
                                            >
                                                <FiPlus className="mr-1" /> Add Medicine
                                            </button>
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                Showing <span className="font-medium">1</span> to <span className="font-medium">{resourceData.medicines.details.length}</span> of{' '}
                                                <span className="font-medium">{resourceData.medicines.details.length}</span> items
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Medicine History */}
                        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSection('medicineHistory')}
                            >
                                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Medicine Activity</h2>
                                {expandedSection === 'medicineHistory' ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>

                            {expandedSection === 'medicineHistory' && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Time</th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Item</th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Quantity</th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Staff</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                {resourceData.medicines.history.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{entry.date}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{entry.time}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.action}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.item}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>{entry.quantity > 0 ? '+' : ''}{entry.quantity}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.staff}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            {renderTabContent()}
        </div>
    );
}
