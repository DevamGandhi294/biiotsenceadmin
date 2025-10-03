import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Activity, BarChart3, List, TrendingUp, Calendar, RefreshCw, Download, Filter, Eye, Settings, MapPin, Building, Cog, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, AreaChart, Area } from 'recharts';
import { getSensorHistory, getMachines, getCompanies } from '../services/firebase';
import type { SensorHistory, Machine, Company } from '../types';

const MachineHistory: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const [sensorData, setSensorData] = useState<SensorHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [dataType, setDataType] = useState<'temperature' | 'vibration'>('temperature');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [selectedMachineId, setSelectedMachineId] = useState<string | undefined>(machineId);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [quickDate, setQuickDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState('line');
  // Local today string in yyyy-mm-dd for date input max
  const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  // Ensure To date is not earlier than From date
  useEffect(() => {
    if (fromDate && toDate && toDate < fromDate) {
      setToDate(fromDate);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    // Load companies and machines for selectors
    const loadRefData = async () => {
      try {
        const [companyList, machineList] = await Promise.all([
          getCompanies(),
          getMachines(),
        ]);
        setCompanies(companyList);
        setMachines(machineList);

        // If route has machineId, derive its company and set as selected
        const routedMachine = machineList.find(m => m.id === machineId);
        if (routedMachine) {
          setSelectedCompanyCode((routedMachine as any).companyCode || routedMachine.company || '');
          setSelectedMachineId(routedMachine.id);
        } else if (companyList.length > 0) {
          // Default to first company and its first machine
          const defaultCompanyCode = companyList[0].companyCode;
          setSelectedCompanyCode(defaultCompanyCode);
          const firstMachine = machineList.find(m => m.company === defaultCompanyCode);
          if (firstMachine) setSelectedMachineId(firstMachine.id);
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };
    loadRefData();
  }, [machineId]);

  // Helper: map selected companyCode to its companyName (if available)
  const selectedCompanyName = companies.find(c => c.companyCode === selectedCompanyCode)?.companyName;
  // Machines filtered by selected company (support both company and companyCode fields)
  const machinesByCompany = machines.filter(m => {
    if (!selectedCompanyCode) return true; // All
    const mc = (m as any).companyCode;
    const mn = m.company;
    // Match by companyCode directly, or by name if machine stores name
    return mc === selectedCompanyCode || mn === selectedCompanyCode || (selectedCompanyName && mn === selectedCompanyName);
  });

  // When company changes, ensure selected machine belongs to it
  useEffect(() => {
    if (selectedCompanyCode) {
      const currentInCompany = machinesByCompany.some(m => m.id === selectedMachineId);
      if (!currentInCompany) {
        const first = machinesByCompany[0];
        setSelectedMachineId(first?.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyCode, machines.length]);

  useEffect(() => {
    const loadSensorData = async () => {
      setLoading(true);
      try {
        // If quickDate set, derive from/to from it
        let from: Date | undefined;
        let to: Date | undefined;
        if (quickDate) {
          const d = new Date(quickDate);
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          from = start;
          to = end;
        } else {
          if (fromDate) {
            const d = new Date(fromDate);
            d.setHours(0, 0, 0, 0);
            from = d;
          }
          if (toDate) {
            const d = new Date(toDate);
            d.setHours(23, 59, 59, 999);
            to = d;
          }
        }

        const data = await getSensorHistory(selectedMachineId, {
          from,
          to,
          limitCount: 500,
        });
        setSensorData(data);
      } catch (error) {
        console.error('Error loading sensor data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load immediately when the route param changes initially
    // and when selectedMachineId changes without waiting for Apply
    loadSensorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachineId, machineId]);

  const applyFilters = async () => {
    setLoading(true);
    try {
      let from: Date | undefined;
      let to: Date | undefined;
      if (quickDate) {
        const d = new Date(quickDate);
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        from = start;
        to = end;
      } else {
        if (fromDate) {
          const d = new Date(fromDate);
          d.setHours(0, 0, 0, 0);
          from = d;
        }
        if (toDate) {
          const d = new Date(toDate);
          d.setHours(23, 59, 59, 999);
          to = d;
        }
      }

      const data = await getSensorHistory(selectedMachineId, {
        from,
        to,
        limitCount: 1000,
      });
      setSensorData(data);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (data: SensorHistory[], field: keyof SensorHistory): number => {
    const values = data.map(item => Number(item[field])).filter(val => !isNaN(val) && val > 0);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  };

  // Filter out zero values based on selected data type
  const filteredSensorData = sensorData.filter(item => {
    if (dataType === 'temperature') {
      return item.temperature && Number(item.temperature) > 0;
    } else {
      return (item.rms_vibration && Number(item.rms_vibration) > 0) || 
             (item.vibration_velocity && Number(item.vibration_velocity) > 0);
    }
  });

  const chartData = filteredSensorData.map(item => ({
    timestamp: item.timestamp?.toDate?.()?.toLocaleString() || 'N/A',
    temperature: item.temperature && Number(item.temperature) > 0 ? item.temperature : null,
    rms_vibration: item.rms_vibration && Number(item.rms_vibration) > 0 ? item.rms_vibration : null,
    vibration_velocity: item.vibration_velocity && Number(item.vibration_velocity) > 0 ? item.vibration_velocity : null,
  })).reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-lg font-medium text-gray-700">Loading sensor data...</div>
          </div>
        </div>
      </div>
    );
  }

  const temperatureAvg = calculateAverage(filteredSensorData, 'temperature');
  const rmsVibrationAvg = calculateAverage(filteredSensorData, 'rms_vibration');
  const velocityAvg = calculateAverage(filteredSensorData, 'vibration_velocity');
  const selectedMachine = machines.find(m => m.id === (selectedMachineId || machineId));

  const alarmCount = filteredSensorData.filter(item => item.alarm !== 'NORMAL').length;
  const normalCount = filteredSensorData.filter(item => item.alarm === 'NORMAL').length;

  // Alert checkpoints: latest data point
  const latestData = filteredSensorData[filteredSensorData.length - 1];
  const latestTemp = latestData?.temperature || 0;
  const latestRms = latestData?.rms_vibration || 0;
  const latestVelocity = latestData?.vibration_velocity || 0;

  const tempAlert = temperatureAvg > 0 && latestTemp > temperatureAvg * 1.2;
  const rmsAlert = rmsVibrationAvg > 0 && latestRms > rmsVibrationAvg * 1.4;
  const velocityAlert = velocityAvg > 0 && latestVelocity > velocityAvg * 1.4;

  // Derived alert level and badge classes based on checkpoints
  const alertLevel: 'HIGH' | 'MID' | 'NORMAL' = (rmsAlert || velocityAlert)
    ? 'HIGH'
    : (tempAlert ? 'MID' : 'NORMAL');
  const alertBadgeClass =
    alertLevel === 'HIGH'
      ? 'bg-red-100 text-red-700 border border-red-200'
      : alertLevel === 'MID'
      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      : 'bg-green-100 text-green-700 border border-green-200';

  // Export current filtered data to CSV (Excel-compatible)
  const exportToCSV = () => {
    if (!filteredSensorData || filteredSensorData.length === 0) return;
    const headers = [
      'Timestamp',
      'Temperature (°C)',
      'RMS Vibration',
      'Vibration Velocity',
      'Alarm',
      'Machine ID',
      'Company',
    ];

    const escape = (val: any) => {
      const s = val === undefined || val === null ? '' : String(val);
      // Escape quotes by doubling them and wrap in quotes
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const rows = filteredSensorData.map((item) => {
      const ts = item.timestamp?.toDate?.() ? (item.timestamp as any).toDate().toISOString() : '';
      return [
        ts,
        item.temperature && Number(item.temperature) > 0 ? item.temperature : '',
        item.rms_vibration && Number(item.rms_vibration) > 0 ? item.rms_vibration : '',
        item.vibration_velocity && Number(item.vibration_velocity) > 0 ? item.vibration_velocity : '',
        item.alarm ?? '',
        selectedMachineId || machineId || '',
        selectedMachine?.company ?? '',
      ].map(escape).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dt = new Date();
    const stamp = dt.toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `machine-history_${selectedMachineId || machineId}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Link 
            to="/machines" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Machines
          </Link>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Machine History Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Real-time sensor monitoring for {selectedMachine?.name || selectedMachineId || machineId}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Details Card */}
        {selectedMachine && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Machine Details</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                selectedMachine.isActive 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
                {selectedMachine.isActive ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
                {selectedMachine.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{selectedMachine.company}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{selectedMachine.location}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cog className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium text-gray-900">{selectedMachine.manufacturerModel}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{selectedMachine.category}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commissioned</p>
                <p className="font-medium text-gray-900">
                    {selectedMachine.commissioningDate ? new Date(selectedMachine.commissioningDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Eye className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Machine ID</p>
                  <p className="font-medium text-gray-900 font-mono text-sm">{selectedMachine.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <Thermometer className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">Avg Temperature</p>
                <p className="text-2xl font-bold text-red-700">{temperatureAvg.toFixed(1)}°C</p>
                {tempAlert && (
                  <div className="flex items-center justify-end mt-1">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-xs font-medium text-yellow-700">Alert Level: High</span>
                  </div>
                )}
              </div>
            </div>
            {tempAlert && (
              <div className="absolute top-2 right-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Avg RMS Vibration</p>
                <p className="text-2xl font-bold text-blue-700">{rmsVibrationAvg.toFixed(2)}</p>
                {rmsAlert && (
                  <div className="flex items-center justify-end mt-1">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-xs font-medium text-yellow-700">Alert Level: High</span>
                  </div>
                )}
              </div>
            </div>
            {rmsAlert && (
              <div className="absolute top-2 right-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">Avg Vibration Velocity</p>
                <p className="text-2xl font-bold text-emerald-700">{velocityAvg.toFixed(2)}</p>
                {velocityAlert && (
                  <div className="flex items-center justify-end mt-1">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-xs font-medium text-yellow-700">Alert Level: High</span>
                  </div>
                )}
              </div>
            </div>
            {velocityAlert && (
              <div className="absolute top-2 right-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-600">Alarm Status</p>
                <div className="flex items-center justify-end space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${alertBadgeClass}`}>
                    {alertLevel === 'HIGH' ? 'High Alert' : alertLevel === 'MID' ? 'Mid Alert' : 'Normal'}
                  </span>
                </div>
                <p className="text-xs text-purple-500 mt-1">
                  Alerts: <span className="font-semibold text-red-600">{alarmCount}</span> / Normal: <span className="font-semibold text-green-600">{normalCount}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800">Data Controls</h3>
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
              {/* View Mode Toggle */}
              <div className="bg-gray-100 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'chart'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Chart
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </button>
              </div>
              
              {/* Data Type Toggle */}
              <div className="bg-gray-100 rounded-xl p-1 flex">
                <button
                  onClick={() => setDataType('temperature')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dataType === 'temperature'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Temperature
                </button>
                <button
                  onClick={() => setDataType('vibration')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dataType === 'vibration'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Vibration
                </button>
              </div>
              
              <button
                onClick={exportToCSV}
                disabled={!filteredSensorData.length}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg ${
                  filteredSensorData.length 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Machine</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                  >
                    {machinesByCompany.map(m => (
                      <option key={m.id} value={m.id}>{m.name ? `${m.name} (${m.id})` : m.id}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setQuickDate(''); }}
                    max={todayLocal}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setQuickDate(''); }}
                    min={fromDate || undefined}
                    max={todayLocal}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Display */}
        {viewMode === 'chart' ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {dataType === 'temperature' ? 'Temperature Trends' : 'Vibration Data Trends'}
              </h3>
              
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    chartType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    chartType === 'area' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Area
                </button>
              </div>
            </div>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="vibrationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                      }} 
                    />
                    <Legend />
                    {dataType === 'temperature' ? (
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        name="Temperature (°C)"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#ef4444' }}
                      />
                    ) : (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="rms_vibration" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="RMS Vibration"
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#3b82f6' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="vibration_velocity" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          name="Vibration Velocity"
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#10b981' }}
                        />
                      </>
                    )}
                    <Brush dataKey="timestamp" height={24} stroke="#8884d8" travellerWidth={10} />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="temperatureArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="vibrationArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                      }} 
                    />
                    <Legend />
                    {dataType === 'temperature' ? (
                      <Area 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        fill="url(#temperatureArea)"
                        name="Temperature (°C)"
                      />
                    ) : (
                      <>
                        <Area 
                          type="monotone" 
                          dataKey="rms_vibration" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fill="url(#vibrationArea)"
                          name="RMS Vibration"
                        />
                      </>
                    )}
                    <Brush dataKey="timestamp" height={24} stroke="#8884d8" travellerWidth={10} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Sensor Data Table</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temperature (°C)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RMS Vibration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vibration Velocity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alarm Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSensorData.map((item, index) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {item.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          <span className="font-semibold">
                            {item.temperature && Number(item.temperature) > 0 ? item.temperature.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-semibold">
                            {item.rms_vibration && Number(item.rms_vibration) > 0 ? item.rms_vibration.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="font-semibold">
                            {item.vibration_velocity && Number(item.vibration_velocity) > 0 ? item.vibration_velocity.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.alarm === 'NORMAL' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : item.alarm === 'WARNING'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {item.alarm === 'NORMAL' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {item.alarm !== 'NORMAL' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {item.alarm}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredSensorData.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Activity className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">No valid sensor data available</p>
                  <p className="text-gray-400 text-sm">
                    {dataType === 'temperature' 
                      ? 'No temperature readings above 0 found' 
                      : 'No vibration readings above 0 found'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer Information */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Last updated: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>Valid records: {filteredSensorData.length}</span>
              <span>•</span>
              <span>Total records: {sensorData.length}</span>
              <span>•</span>
              <span>Data refresh rate: Real-time</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live monitoring active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MachineHistory;