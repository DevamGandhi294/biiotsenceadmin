import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Building, Pencil, Save, X, RotateCcw, Trash, Filter, Search, CheckCircle, BarChart3, Settings, Users, Mail } from 'lucide-react';
import { getUsersByCompany, getCompanies, updateUser, moveUserToPending, deleteUserById } from '../services/firebase';
import type { User as UserType, Company } from '../types';

const CompanyUsers: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>(companyCode || '');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserType>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load companies list for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const list = await getCompanies();
        setCompanies(list);
      } catch (error) {
        console.error('Error loading companies:', error);
      }
    };
    loadCompanies();
  }, []);

  // Load users when selected company changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedCompanyCode) return;
      setLoading(true);
      try {
        const data = await getUsersByCompany(selectedCompanyCode);
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [selectedCompanyCode]);

  const startEdit = (user: UserType) => {
    setEditingUserId(user.id);
    setEditForm({
      fullName: user.fullName,
      department: user.department,
      mobileNo: user.mobileNo,
      userType: user.userType,
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const saveEdit = async (userId: string) => {
    try {
      setLoading(true);
      await updateUser(userId, {
        fullName: editForm.fullName as string,
        department: editForm.department as string,
        mobileNo: editForm.mobileNo as string,
        userType: editForm.userType as any,
      });
      // Update locally
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editForm } as UserType : u));
      cancelEdit();
    } catch (e) {
      console.error('Error updating user:', e);
      alert('Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-lg font-medium text-gray-700">Loading employees data...</div>
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
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Companies
          </Link>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Company Employees
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage employees for: {selectedCompanyCode}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
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
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Total Employees</p>
                <p className="text-2xl font-bold text-blue-700">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">Active Users</p>
                <p className="text-2xl font-bold text-emerald-700">{users.filter(u => u.userType === 'user').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-600">Admins</p>
                <p className="text-2xl font-bold text-purple-700">{users.filter(u => u.userType === 'admin').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600">Companies</p>
                <p className="text-2xl font-bold text-orange-700">{users.filter(u => u.userType === 'company').length}</p>
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
                    {companies.map(c => (
                      <option key={c.id} value={c.companyCode}>{c.companyName} ({c.companyCode})</option>
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
            <h3 className="text-xl font-semibold text-gray-800">Employee Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          {editingUserId === user.id ? (
                            <>
                              <input
                                type="text"
                                className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-3 py-1 w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editForm.fullName || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                              />
                              <div className="text-sm text-gray-500 mt-1">{user.email}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="p-1 bg-purple-100 rounded-lg mr-2">
                            <Building className="h-4 w-4 text-purple-600" />
                          </div>
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg px-3 py-1 w-44 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.department || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="p-1 bg-purple-100 rounded-lg mr-2">
                            <Building className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-medium">{user.department}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="p-1 bg-green-100 rounded-lg mr-2">
                              <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <input
                              type="tel"
                              className="border border-gray-300 rounded-lg px-3 py-1 w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={editForm.mobileNo || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, mobileNo: e.target.value }))}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="p-1 bg-green-100 rounded-lg mr-2">
                              <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="font-medium">{user.mobileNo}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <select
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editForm.userType || 'user'}
                          onChange={(e) => setEditForm(prev => ({ ...prev, userType: e.target.value as any }))}
                        >
                          <option value="user">user</option>
                          <option value="company">company</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                          user.userType === 'user' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : user.userType === 'admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {user.userType === 'user' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {user.userType === 'admin' && <Settings className="h-3 w-3 mr-1" />}
                          {user.userType === 'company' && <Building className="h-3 w-3 mr-1" />}
                          {user.userType}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="p-1 bg-gray-100 rounded-lg mr-2">
                          <BarChart3 className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>{user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingUserId === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(user.id)}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                          >
                            <Save className="h-4 w-4 mr-1" /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              const ok = confirm('Move this user to Pending (not verified)? They will be removed from active users.');
                              if (!ok) return;
                              try {
                                setLoading(true);
                                await moveUserToPending(user as any);
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                              } catch (e) {
                                console.error('Failed to move to pending:', e);
                                alert('Failed to move user to pending.');
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" /> Move to Pending
                          </button>
                          <button
                            onClick={async () => {
                              const ok = confirm('Permanently delete this user? This cannot be undone.');
                              if (!ok) return;
                              try {
                                setLoading(true);
                                await deleteUserById(user.id);
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                              } catch (e) {
                                console.error('Failed to delete user:', e);
                                alert('Failed to delete user.');
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No employees found</p>
                <p className="text-gray-400 text-sm">Try selecting a different company</p>
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
              <span>Total employees: {users.length}</span>
              <span>•</span>
              <span>Active users: {users.filter(u => u.userType === 'user').length}</span>
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

export default CompanyUsers;