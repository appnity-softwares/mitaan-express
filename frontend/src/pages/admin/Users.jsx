import React, { useState } from 'react';
import { Search, Trash2, Users as UsersIcon } from 'lucide-react';
import { useUsers } from '../../hooks/useQueries';
import { API_URL } from '../../services/api';

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // TanStack Query Hook
    const {
        data: users = [],
        isLoading: loading,
        refetch: loadUsers
    } = useUsers();

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                loadUsers();
                alert('Role updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                loadUsers();
                alert('User deleted!');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const badges = {
            ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            EDITOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            USER: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
        return badges[role] || badges.USER;
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        editors: users.filter(u => u.role === 'EDITOR').length,
        users: users.filter(u => u.role === 'USER').length
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

    return (
        <div className="p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">User Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage users and their roles</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Total Users</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/20">
                    <div className="text-2xl font-black text-red-800 dark:text-red-400">{stats.admins}</div>
                    <div className="text-xs text-red-600 dark:text-red-500 uppercase tracking-wide">Admins</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/20">
                    <div className="text-2xl font-black text-blue-800 dark:text-blue-400">{stats.editors}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-500 uppercase tracking-wide">Editors</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-900/20">
                    <div className="text-2xl font-black text-green-800 dark:text-green-400">{stats.users}</div>
                    <div className="text-xs text-green-600 dark:text-green-500 uppercase tracking-wide">Regular Users</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ADMIN', 'EDITOR', 'USER'].map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${roleFilter === role
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Articles</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <UsersIcon size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center text-white font-black">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                {user._count?.articles || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer ${getRoleBadge(user.role)}`}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="EDITOR">EDITOR</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Delete user"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
