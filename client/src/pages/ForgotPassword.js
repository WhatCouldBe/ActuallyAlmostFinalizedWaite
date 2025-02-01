import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordOTP, otpLogin } from '../api';

export default function ForgotPassword({ setIsAuthenticated }) {
  const navigate = useNavigate();

  // Step indicates which part of the flow we're on
  // step = 1 -> user enters email
  // step = 2 -> user enters OTP
  const [step, setStep] = useState(1);

  // For step 1:
  const [email, setEmail] = useState('');
  // For step 2 (OTP):
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Refs to each OTP input
  const otpRefs = useRef([]);

  // Move focus to next field automatically
  const handleOTPChange = (val, index) => {
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1); // only last char (in case user typed multiple)
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      return setErrorMsg('Please enter your email.');
    }

    try {
      const result = await requestPasswordOTP(email);
      if (result.message && result.message.toLowerCase().includes('one-time code sent')) {
        setSuccessMsg(result.message);
        // Switch to OTP step aftr a short delay or immediately
        setTimeout(() => {
          setStep(2);
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(result.message || 'Failed to send code.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to reach server.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const code = otpDigits.join('');
    if (!code || code.length < 6) {
      return setErrorMsg('Please enter the 6-digit code.');
    }

    try {
      const result = await otpLogin(email, code);
      if (result.message && result.message.toLowerCase().includes('otp login successful')) {
        localStorage.setItem('bacshotsUser', JSON.stringify(result.user));
        setIsAuthenticated(true);
        // navigate to change password page
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
      {step === 1 && (
        <>
          <h2>Forgot Password</h2>
          <p className="subheader">
            Enter your verified email to receive a one-time login code.
          </p>
          {errorMsg && <div className="error">{errorMsg}</div>}
          {successMsg && <div className="success">{successMsg}</div>}

          <form onSubmit={handleSendOTP}>
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
            <button type="submit">Send OTP Code</button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Enter Verification Code</h2>
          <p className="subheader">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
          </p>
          {errorMsg && <div className="error">{errorMsg}</div>}
          {successMsg && <div className="success">{successMsg}</div>}

          <form onSubmit={handleVerifyOTP}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOTPChange(e.target.value, i)}
                  ref={(ref) => (otpRefs.current[i] = ref)}
                  style={{
                    width: '3rem',
                    height: '3rem',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                  }}
                />
              ))}
            </div>
            <button type="submit" style={{ marginTop: '1rem' }}>
              Verify Code
            </button>
          </form>
        </>
      )}
    </div>
  );
}
