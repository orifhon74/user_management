import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

export const loginUser = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/register', data);
export const getAllUsers = () => api.get('/users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
export const performUserAction = (action, userIds) =>
    api.post('/users/action', { action, userIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

export default api;