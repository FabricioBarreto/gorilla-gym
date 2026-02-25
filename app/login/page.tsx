"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          font-family: 'Barlow', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Diagonal background split */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0a0a0a 50%, #111 50%);
        }

        /* Texture grain */
        .login-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        /* Accent bar top */
        .accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
        }

        /* Left decorative panel */
        .deco-panel {
          display: none;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 1024px) {
          .deco-panel {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: center;
            padding: 60px;
            border-right: 1px solid #1a1a1a;
          }
        }

        .deco-inner {
          max-width: 400px;
        }

        .deco-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #22c55e;
          border: 1px solid #22c55e33;
          padding: 4px 10px;
          margin-bottom: 32px;
        }

        .deco-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 8vw, 96px);
          line-height: 0.9;
          color: #fff;
          letter-spacing: 0.02em;
          margin-bottom: 24px;
        }

        .deco-headline span {
          color: #22c55e;
          display: block;
        }

        .deco-sub {
          font-size: 15px;
          color: #555;
          line-height: 1.6;
          font-weight: 300;
          border-left: 2px solid #22c55e;
          padding-left: 16px;
        }

        .deco-stats {
          display: flex;
          gap: 40px;
          margin-top: 48px;
          padding-top: 48px;
          border-top: 1px solid #1a1a1a;
        }

        .stat-item {}
        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          color: #22c55e;
          letter-spacing: 0.05em;
        }
        .stat-label {
          font-size: 11px;
          color: #444;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Right form panel */
        .form-panel {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .form-panel {
            width: 480px;
            flex-shrink: 0;
          }
        }

        .form-card {
          width: 100%;
          max-width: 400px;
        }

        /* Mobile logo */
        .mobile-logo {
          text-align: center;
          margin-bottom: 40px;
        }

        @media (min-width: 1024px) {
          .mobile-logo { display: none; }
        }

        .logo-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 8px;
        }

        .logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          color: #fff;
          letter-spacing: 0.1em;
        }

        .logo-text span { color: #22c55e; }

        /* Form heading */
        .form-heading {
          margin-bottom: 36px;
        }

        .form-label-tag {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #22c55e;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px;
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
        }

        /* Error */
        .error-box {
          background: #ff000011;
          border: 1px solid #ff000044;
          border-left: 3px solid #ef4444;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #fca5a5;
          letter-spacing: 0.01em;
        }

        /* Field */
        .field {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #555;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .field-input {
          width: 100%;
          background: #111;
          border: 1px solid #222;
          border-bottom: 2px solid #333;
          color: #fff;
          font-family: 'Barlow', sans-serif;
          font-size: 16px;
          font-weight: 300;
          padding: 14px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .field-input::placeholder { color: #333; }

        .field-input:focus {
          border-color: #22c55e;
          border-bottom-color: #22c55e;
          background: #0d0d0d;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 16px;
          margin-top: 8px;
          background: #22c55e;
          color: #000;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 0.15em;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.1s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #16a34a;
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .submit-btn:disabled {
          background: #1a3a1a;
          color: #2a5a2a;
          cursor: not-allowed;
        }

        /* Loading bar */
        .submit-btn.loading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: #fff;
          animation: loadbar 1s infinite;
        }

        @keyframes loadbar {
          to { left: 100%; }
        }

        /* Footer note */
        .form-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 12px;
          color: #333;
          letter-spacing: 0.05em;
        }

        /* Animate in */
        .form-card {
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">
        <div className="accent-bar" />

        {/* Left deco panel */}
        <div className="deco-panel">
          <div className="deco-inner">
            <div className="deco-tag">Sistema de Gestión</div>
            <h1 className="deco-headline">
              GORILLA
              <span>GYM</span>
            </h1>
            <p className="deco-sub">
              Accedé a tu perfil, rutinas y membresía desde cualquier
              dispositivo.
            </p>
            <div className="deco-stats">
              <div className="stat-item">
                <div className="stat-num">100+</div>
                <div className="stat-label">Ejercicios</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">24/7</div>
                <div className="stat-label">Acceso</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">PWA</div>
                <div className="stat-label">Offline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="form-panel">
          <div className="form-card">
            {/* Mobile logo */}
            <div className="mobile-logo">
              <span className="logo-icon">🦍</span>
              <div className="logo-text">
                GORILLA <span>GYM</span>
              </div>
            </div>

            <div className="form-heading">
              <div className="form-label-tag">Bienvenido</div>
              <div className="form-title">INGRESAR</div>
            </div>

            <form onSubmit={handleLogin}>
              {error && <div className="error-box">{error}</div>}

              <div className="field">
                <label htmlFor="dni" className="field-label">
                  DNI
                </label>
                <input
                  id="dni"
                  type="text"
                  required
                  pattern="\d{7,8}"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  className="field-input"
                  placeholder="Sin puntos ni espacios"
                />
              </div>

              <div className="field">
                <label htmlFor="password" className="field-label">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`submit-btn${loading ? " loading" : ""}`}
              >
                {loading ? "VERIFICANDO..." : "INGRESAR"}
              </button>
            </form>

            <div className="form-footer">
              ¿Olvidaste tu contraseña? Contactá con el gimnasio
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
