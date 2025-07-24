import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, logout } from '@/services/Functions';

export const useAuth = (router) => {
  const [user, setUser] = useState(null);
  const [showDeadToken, setShowDeadToken] = useState(false);
  const [deadTokenReason, setDeadTokenReason] = useState("");
  const [textToken, setTextToken] = useState("");
  const [stayOnline, setStayOnline] = useState(false);
  
  const inactivityTimeout = useRef(null);
  const logoutTimeout = useRef(null);
  const sessionTimeout = useRef(null);

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeout.current);
    if (!showDeadToken) {
      inactivityTimeout.current = setTimeout(() => {
        setDeadTokenReason("¿Sigue ahí?");
        setTextToken(
          "Lleva 15 minutos inactivo; si no interactúa en 5 minutos, se cerrará la sesión automáticamente por seguridad"
        );
        setStayOnline(true);
        setShowDeadToken(true);
        logoutTimeout.current = setTimeout(() => {
          handleLogout();
        }, 5 * 60 * 1000);
      }, 15 * 60 * 1000);
    }
  };

  const handleDeadTokenCancel = () => {
    setShowDeadToken(false);
    setDeadTokenReason("");
    setTextToken("");
    clearTimeout(logoutTimeout.current);
    resetInactivityTimer();
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleOnChangeView = () => {
    router.push("/MainView");
  };

  useEffect(() => {
    sessionTimeout.current = setTimeout(() => {
      setDeadTokenReason("Sesión Expirada");
      setTextToken("Su sesión ha expirado, por favor inicie sesión de nuevo");
      setStayOnline(false);
      setShowDeadToken(true);
    }, 2 * 60 * 60 * 1000);

    resetInactivityTimer();

    const events = ["mousemove", "mousedown", "keydown", "touchstart"];
    events.forEach((e) => {
      window.addEventListener(e, resetInactivityTimer);
    });

    const loadUser = async () => {
      try {
        const usuario = await getCurrentUser();
        setUser(usuario);
      } catch (error) {
        throw new Error("Error al cargar el usuario:", error);
      }
    };
    loadUser();

    return () => {
      events.forEach((e) => {
        window.removeEventListener(e, resetInactivityTimer);
      });
      clearTimeout(sessionTimeout.current);
      clearTimeout(inactivityTimeout.current);
      clearTimeout(logoutTimeout.current);
    };
  }, []);

  return {
    user,
    showDeadToken,
    deadTokenReason,
    textToken,
    stayOnline,
    handleDeadTokenCancel,
    handleLogout,
    handleOnChangeView,
  };
};
