import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUsers from '../hooks/useUsers';
import { formatDistanceToNow } from 'date-fns';

const AdminPanel = () => {
    const navigate = useNavigate();
    const {
        users,
        selectedUsers,
        selectAll,
        fetchUsers,
        performAction,
        handleCheckboxChange,
        handleSelectAll,
    } = useUsers(navigate);

    const [filter, setFilter] = useState(''); // Search filter state

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Filtered users based on search input
    const filteredUsers = Array.isArray(users)
        ? users.filter(
            (user) =>
                user.name.toLowerCase().includes(filter?.toLowerCase() || '') ||
                user.email.toLowerCase().includes(filter?.toLowerCase() || '')
        )
        : [];

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Admin Panel</h2>
                <button className="btn btn-warning d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
            </div>
            <div className="mb-4 d-flex gap-3">
                <button
                    className="btn border border-primary text-primary d-flex align-items-center gap-2 px-4"
                    onClick={() => performAction('block')}
                >
                    <i className="bi bi-lock"></i>
                    <span>Block</span>
                </button>
                <button
                    className="btn border border-primary text-primary d-flex align-items-center gap-2 px-4"
                    onClick={() => performAction('unblock')}
                >
                    <i className="bi bi-unlock"></i>
                </button>
                <button
                    className="btn border border-danger text-danger d-flex align-items-center gap-2 px-4"
                    onClick={() => performAction('delete')}
                >
                    <i className="bi bi-trash"></i>
                </button>
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Filter..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="card shadow-sm">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Last Seen</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleCheckboxChange(user.id)}
                                    />
                                </td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.last_login
                                        ? `${formatDistanceToNow(new Date(user.last_login))} ago`
                                        : 'Never logged in'}
                                </td>
                                <td>
                                        <span
                                            className={`badge ${
                                                user.status === 'active'
                                                    ? 'bg-success'
                                                    : 'bg-danger'
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;