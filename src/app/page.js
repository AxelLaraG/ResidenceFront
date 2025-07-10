"use client";

import { useState,useEffect } from "react";
import styles from "../styles/login.css";
import ErrorCard from "../components/ui/ErrorMessage/Error";

export default function Login() {
  const [eMail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(()=> setError(null), 9000);
      return () => clearTimeout(timer);
    }
  },[error])

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setError(null);

    if (!eMail || !password) {
      setError("Campos incompletos");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="center-container">
      {error && (
        <div
          style={{
            position: "absolute",
            top: 30,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <ErrorCard
            message={error}
            subMessage="Por favor llene rodos los campos"
            onClose={() => setError(null)}
          />
        </div>
      )}
      <form className="form">
        <div className="icon-circle bg-green-800 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <div className="title_container">
          <p className="title">Portal de Datos CVU</p>
          <span className="subtitle">
            Use su cuenta de Rizoma SECIHTI para iniciar sesión
          </span>
        </div>
        <div className="flex-column">
          <label>Email</label>
          <div
            className={`inputForm${error && !eMail ? " inputForm-error" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              viewBox="0 0 32 32"
              height="20"
            >
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
              </g>
            </svg>
            <input
              placeholder="Ingresa tu correo"
              className="input"
              type="text"
              value={eMail}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex-column">
            <label>Contraseña</label>
            <div
              className={`inputForm${
                error && !password ? " inputForm-error" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                viewBox="-64 0 512 512"
                height="20"
              >
                <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
              </svg>
              <input
                placeholder="Ingresa tu contraseña"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-row">
            <button
              className="button-submit"
              type="submit"
              enabled={(!loading).toString()}
              onClick={handleSubmit}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
