import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear any previous messages
        try {
            // Call the registration API
            const response = await registerUser({ name, email, password });

            // Save the token in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);

            // Redirect to the admin panel
            navigate('/admin');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Something went wrong!');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-5 shadow" style={{ width: '30rem' }}>
                <h2 className="text-center mb-4">Sign Up</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Enter a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Sign Up
                    </button>
                </form>
                {message && (
                    <div className="alert alert-info mt-3" role="alert">
                        {message}
                    </div>
                )}
                <div className="text-center mt-3">
                    <p>
                        Already have an account?{' '}
                        <a href="/login" className="text-primary">
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;