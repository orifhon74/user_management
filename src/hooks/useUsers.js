import { useState, useEffect } from 'react';
import api from '../services/api';
import { handleCheckboxChange, handleSelectAll, handleSelfAction } from '../utils/selectionUtils';

const useUsers = (navigate) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const fetchUsers = async () => {
        try {
            console.log('Token used for API call:', localStorage.getItem('token'));
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await api.get('/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            console.log('Users fetched from API:', response.data);
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid response from API');
            }

            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const performAction = async (action) => {
        if (selectedUsers.length === 0) {
            alert('No users selected.');
            return;
        }

        const token = localStorage.getItem('token');
        const currentUserId = parseInt(localStorage.getItem('userId'), 10);
        const isSelfAction = selectedUsers.includes(currentUserId);

        if (!token) {
            alert('Session expired. Redirecting to home.');
            navigate('/');
            return;
        }

        try {
            // Perform the backend action first
            await api.post(
                '/users/action',
                { action, userIds: selectedUsers },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const actionVerb = action === 'delete' ? 'deleted' : `${action}ed`;
            alert(
                `${selectedUsers.length} ${
                    selectedUsers.length === 1 ? 'user' : 'users'
                } successfully ${actionVerb}.`
            );

            if (isSelfAction) {
                // If the user is blocking or deleting themselves, log them out immediately
                alert(`You have ${action}ed yourself. Redirecting to the home page.`);
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/'); // Redirect to the home page
                return; // Stop execution here for self-action
            }

            // Refresh the user list for other actions
            fetchUsers();
            setSelectedUsers([]);
            setSelectAll(false);
        } catch (err) {
            console.error(err);
            alert('Action failed.');
        }
    };

    return {
        users,
        selectedUsers,
        selectAll,
        fetchUsers,
        performAction,
        handleCheckboxChange: (userId) =>
            handleCheckboxChange(userId, selectedUsers, setSelectedUsers),
        handleSelectAll: () =>
            handleSelectAll(users, selectAll, setSelectAll, setSelectedUsers),
    };
};

export default useUsers;