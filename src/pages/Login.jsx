import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { loginUser } from '../utils/authStorage';
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError('');

    if (!identifier.trim()) {
      setError('Please enter your username or email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Small delay for a professional login experience
    setTimeout(() => {
      const result = loginUser(
        identifier.trim(),
        password
      );

      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      // Login successful
      navigate('/', { replace: true });
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Activity size={28} />
          </div>

          <div>
            <h1>MediCore</h1>
            <span>Pharmacy Management System</span>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>Welcome Back</h2>
          <p>
            Sign in to access your pharmacy management
            dashboard.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* Username / Email */}
          <div className="login-field">
            <label htmlFor="identifier">
              Username or Email
            </label>

            <div className="login-input-wrapper">
              <Mail size={18} />

              <input
                id="identifier"
                type="text"
                placeholder="Enter username or email"
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="login-input-wrapper">
              <Lock size={18} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-login">
          <strong>Demo Login</strong>

          <div>
            <span>Email:</span>
            <code>staff@medicore.com</code>
          </div>

          <div>
            <span>Password:</span>
            <code>medicore123</code>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          MediCore Pharmacy Management System
        </div>

      </div>
    </div>
  );
}

export default Login;