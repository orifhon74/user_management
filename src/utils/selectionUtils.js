// Toggle individual user selection
export const handleCheckboxChange = (userId, selectedUsers, setSelectedUsers) => {
    setSelectedUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
};

// Toggle "Select All" functionality
export const handleSelectAll = (users, selectAll, setSelectAll, setSelectedUsers) => {
    if (selectAll) {
        setSelectedUsers([]);
    } else {
        setSelectedUsers(users.map((user) => user.id));
    }
    setSelectAll(!selectAll);
};

export const handleSelfAction = (action, selectedUsers, currentUserId, navigate) => {
    const isSelfBlock = action === 'block' && selectedUsers.includes(parseInt(currentUserId));
    const isSelfDelete = action === 'delete' && selectedUsers.includes(parseInt(currentUserId));

    if (isSelfBlock || isSelfDelete) {
        const logoutMessage = isSelfBlock
            ? 'You have blocked yourself and will now be logged out.'
            : 'You have deleted yourself and will now be logged out.';
        alert(logoutMessage);
        localStorage.removeItem('token');
        navigate('/');
        return true;
    }
    return false;
};