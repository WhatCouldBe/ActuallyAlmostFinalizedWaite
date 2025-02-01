// client/src/pages/OtpLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { otpLogin } from '../api';

export default function OtpLogin({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const result = await otpLogin(email, code);
      if (result.message && result.message.toLowerCase().includes('otp login successful')) {
        // Mark user as logged in so we can do the forced change
        localStorage.setItem('bacshotsUser', JSON.stringify(result.user));
        setIsAuthenticated(true);
        // Now navigate to change password page
        navigate('/change-password');
      } else {
        setErrorMsg(result.message || 'OTP Login failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to reach server.');
    }
  };

  return (
    <div className="card">
      <h2>One-Time Login</h2>
      <p className="subheader">
        Enter the email and code we sent you to sign in temporarily.
      </p>
      {errorMsg && <div className="error">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input 
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>One-Time Code</label>
          <input 
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In with Code</button>
      </form>
    </div>
  );
}
