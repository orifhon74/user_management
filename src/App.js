import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';

const App = () => {
    const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Route */}
                <Route
                    path="/admin"
                    element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />}
                />

                {/* Catch-All Redirect */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;