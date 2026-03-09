
"use client";
import { useState } from "react";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      console.log(data);
      setSuccess(true);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .page::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,80,40,0.12) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          pointer-events: none;
        }

        .page::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255,180,40,0.07) 0%, transparent 70%);
          bottom: -80px;
          left: -80px;
          pointer-events: none;
        }

        .card {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          padding: 48px 44px 52px;
          width: 420px;
          position: relative;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: #ff5028;
          border-style: solid;
        }
        .card-corner.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .card-corner.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .card-corner.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .card-corner.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 36px;
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .field input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .field input::placeholder { color: rgba(255,255,255,0.2); }

        .field input:focus {
          border-color: rgba(255,80,40,0.6);
          background: rgba(255,80,40,0.04);
        }

        .btn {
          margin-top: 12px;
          width: 100%;
          padding: 15px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          background: #ff5028;
          color: #fff;
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,80,40,0.4);
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-msg {
          margin-top: 20px;
          padding: 12px 16px;
          border: 1px solid rgba(80,220,120,0.3);
          background: rgba(80,220,120,0.06);
          color: #50dc78;
          font-size: 13px;
          text-align: center;
          letter-spacing: 0.02em;
          animation: fadeUp 0.3s ease both;
        }

        .divider {
          margin: 28px 0 20px;
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          position: relative;
        }

        .login-section {
          margin-top: 24px;
          text-align: center;
        }

        .login-text {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
        }

        .btn-outline {
          width: 100%;
          padding: 13px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }

        .btn-outline:hover {
          border-color: rgba(255,80,40,0.5);
          color: #fff;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h1 className="title">Create account</h1>
          <p className="subtitle">Join the game. Fill in your details below.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input
                placeholder="your_nickname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn" type="submit" disabled={loading}>
              <span className="btn-inner">
                {loading && <span className="spinner" />}
                {loading ? "Creating..." : "Sign up"}
              </span>
            </button>

            {success && (
              <div className="success-msg">
                ✓ Account created successfully!
              </div>
            )}
          </form>

          <div className="login-section">
            <p className="login-text">Already have an account?</p>
            <button className="btn-outline" onClick={() => window.location.href = "/login"}>
              Log in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}