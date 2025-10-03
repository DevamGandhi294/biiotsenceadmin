import React, { useState, useEffect } from 'react';
import { Monitor, Calendar, Building2, Hash, Filter, Search, CheckCircle, Settings, Activity } from 'lucide-react';
import { getDeviceData } from '../services/firebase';
import type { DeviceData } from '../types';

const DeviceDataPage: React.FC = () => {
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadDeviceData = async () => {
      try {
        const data = await getDeviceData();
        setDeviceData(data);
      } catch (error) {
        console.error('Error loading device data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeviceData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-lg font-medium text-gray-700">Loading device data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Device Data Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  All registered devices and their scan history
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Monitor className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Total Devices</p>
                <p className="text-2xl font-bold text-blue-700">{deviceData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">Registered Devices</p>
                <p className="text-2xl font-bold text-emerald-700">{deviceData.filter(d => d.action === 'qr_scan_registration').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-600">Companies</p>
                <p className="text-2xl font-bold text-purple-700">{new Set(deviceData.map(d => d.company)).size}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600">Scan Actions</p>
                <p className="text-2xl font-bold text-orange-700">{new Set(deviceData.map(d => d.action)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Controls</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </div>
          
          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Companies</option>
                    {Array.from(new Set(deviceData.map(d => d.company))).map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Actions</option>
                    {Array.from(new Set(deviceData.map(d => d.action))).map(action => (
                      <option key={action} value={action}>{action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Device Scan History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scanned At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deviceData.map((device, index) => (
                  <tr key={device.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                          <Monitor className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{device.deviceId}</div>
                          <div className="text-sm text-gray-500 font-mono">ID: {device.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="p-1 bg-blue-100 rounded-lg mr-3">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{device.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="p-1 bg-green-100 rounded-lg mr-3">
                          <Hash className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium font-mono">{device.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        device.action === 'qr_scan_registration' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {device.action === 'qr_scan_registration' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Settings className="h-3 w-3 mr-1" />
                        )}
                        {device.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="p-1 bg-orange-100 rounded-lg mr-3">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-medium">{device.scannedAt?.toDate?.()?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {deviceData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Monitor className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No device data available</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Information */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Last updated: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>Total devices: {deviceData.length}</span>
              <span>•</span>
              <span>Unique companies: {new Set(deviceData.map(d => d.company)).size}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDataPage;