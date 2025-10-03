import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Users, Cpu, Activity, Database, Monitor, Settings, Bell, Search, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Building2, label: 'Companies', description: 'Manage companies' },
    { path: '/machines', icon: Cpu, label: 'Machines', description: 'View all machines' },
    { path: '/machine-history', icon: Activity, label: 'Machine History', description: 'Sensor data & analytics' },
    { path: '/devices', icon: Database, label: 'Device Data', description: 'Device scan history' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  BiiotSense Admin
                </h1>
                <p className="text-xs text-gray-500">Machine Monitoring System</p>
              </div>
            </div>
            
            {/* <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <Settings className="h-5 w-5" />
              </button>
            </div> */}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <nav className="w-72 bg-white/80 backdrop-blur-sm shadow-xl border-r border-white/20 min-h-screen sticky top-16">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Navigation</h2>
              {/* <p className="text-sm text-gray-600">Quick access to all features</p> */}
            </div>
            
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md hover:text-blue-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <item.icon className={`h-5 w-5 ${
                        location.pathname === item.path
                          ? 'text-white'
                          : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${
                        location.pathname === item.path
                          ? 'text-white/80'
                          : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Sidebar Footer */}
            {/* <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-xs font-medium text-green-800">System Status</p>
                  <p className="text-xs text-green-600">All services operational</p>
                </div>
              </div>
            </div> */}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;