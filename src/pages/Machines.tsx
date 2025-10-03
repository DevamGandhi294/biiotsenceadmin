import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, Activity, Building2, Filter, Search, Settings, Cog, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMachines, getCompanies } from '../services/firebase';
import type { Machine, Company } from '../types';

const Machines: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadRefData = async () => {
      try {
        const [machinesData, companiesData] = await Promise.all([
          getMachines(),
          getCompanies(),
        ]);
        setMachines(machinesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error loading machines or companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRefData();
  }, []);

  const selectedCompanyName = companies.find(c => c.companyCode === selectedCompanyCode)?.companyName;
  const filteredMachines = machines.filter(m => {
    if (!selectedCompanyCode) return true;
    const mc = (m as any).companyCode;
    const mn = m.company;
    return mc === selectedCompanyCode || mn === selectedCompanyCode || (selectedCompanyName && mn === selectedCompanyName);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-lg font-medium text-gray-700">Loading machines data...</div>
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
                  Machines Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  All registered machines and their status
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Cpu className="h-8 w-8 text-white" />
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
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Total Machines</p>
                <p className="text-2xl font-bold text-blue-700">{machines.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">Active Machines</p>
                <p className="text-2xl font-bold text-emerald-700">{machines.filter(m => m.isActive).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">Inactive Machines</p>
                <p className="text-2xl font-bold text-red-700">{machines.filter(m => !m.isActive).length}</p>
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
                <p className="text-2xl font-bold text-purple-700">{companies.length}</p>
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
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCompanyCode}
                    onChange={(e) => setSelectedCompanyCode(e.target.value)}
                  >
                    <option value="">All Companies</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.companyCode}>{c.companyName} ({c.companyCode})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <div key={machine.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${machine.isActive ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' : 'bg-gradient-to-br from-red-100 to-red-200'}`}>
                      <Cpu className={`h-6 w-6 ${machine.isActive ? 'text-emerald-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{machine.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">ID: {machine.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                    machine.isActive 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {machine.isActive ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {machine.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="p-1 bg-blue-100 rounded-lg mr-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{machine.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="p-1 bg-purple-100 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <span><strong>Category:</strong> {machine.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="p-1 bg-orange-100 rounded-lg mr-3">
                      <Cog className="h-4 w-4 text-orange-600" />
                    </div>
                    <span><strong>Model:</strong> {machine.manufacturerModel}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="p-1 bg-indigo-100 rounded-lg mr-3">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span><strong>Commissioned:</strong> {new Date(machine.commissioningDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-medium">{machine.company}</span>
                  </div>
                  
                  <Link
                    to={`/machine-history/${machine.id}`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg group-hover:shadow-xl"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View History
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Information */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Last updated: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>Total machines: {machines.length}</span>
              <span>•</span>
              <span>Active machines: {machines.filter(m => m.isActive).length}</span>
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

export default Machines;