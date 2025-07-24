"use client";

import {
  fetchUserXML,
  getCurrentUser,
  validateXML,
} from "@/services/Functions";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/ui/Header/Header";
import { useRouter } from "next/navigation";
import { logout } from "@/services/Functions";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";
import Checkbox from "@/components/ui/CheckBox/CheckBox";

export default function MainView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeadToken, setShowDeadToken] = useState(false);
  const [deadTokenReason, setDeadTokenReason] = useState("");
  const [textToken, setTextToken] = useState("");
  const [stayOnline, setStayOnline] = useState(false);

  const router = useRouter();
  const inactivityTimeout = useRef(null);
  const logoutTimeout = useRef(null);
  const sessionTimeout = useRef(null);

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
  }, []);

  useEffect(() => {
    setError(null);
    const fetchData = async () => {
      try {
        const usuario = await getCurrentUser();
        setUser(usuario);

        const username = usuario.email.split("@")[0];
        const xmlText = await fetchUserXML(username);

        const formData = new FormData();
        const xmlBlob = new Blob([xmlText], { type: "text/xml" });
        formData.append("documento_xml", xmlBlob, `${username}.xml`);

        const res = await validateXML(formData);
        setData(res);
      } catch (error) {
        setError("Error en la autenticación o carga de datos");
      }
    };

    fetchData();
  }, []);

  function resetInactivityTimer() {
    clearTimeout(inactivityTimeout.current);
    if (!showDeadToken) {
      inactivityTimeout.current = setTimeout(() => {
        setDeadTokenReason("¿Sigue ahí?");
        setTextToken(
          "Lleva 15 minutos inactivo; si no interactúa en 5 minutos, se cerrará la sesión automáticamente por seguridad"
        );
        setStayOnline(true);
        setShowDeadToken(true);
        // Timer de 5 minutos para logout automático si ignora el aviso
        logoutTimeout.current = setTimeout(() => {
          handleLogout();
        }, 5 * 60 * 1000); // 5 minutos
      }, 15 * 60 * 1000); // 15 minutos
    }
  }

  const handleDeadTokenCancel = () => {
    setShowDeadToken(false);
    setDeadTokenReason("");
    setTextToken("");
    clearTimeout(logoutTimeout.current);
    resetInactivityTimer();
  };

  const handleLogout = () => {
    setError(null);
    setLoading(true);
    const res = logout();
    router.push("/");
  };

  const handleOnChangeView = () =>{
    setError(null);
    setLoading(true);
    router.push("/EsquemasConf")
  };

  return (
    <div>
      {loading && (
        <div className="overlay-loader">
          <Loader />
        </div>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <ErrorCard
            message={error}
            subMessage={""}
            onClose={() => setError(null)}
          />
        </div>
      )}

      <Header
        username={data?.data?.cvu?.MiPerfil.Nombre}
        email={user?.email}
        vista="1"
        onLogout={handleLogout}
        role={user?.role}
        onChangeView = {handleOnChangeView}
      />

      {showDeadToken && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <DeadToken
            title={deadTokenReason}
            message={textToken}
            stayOnline={stayOnline}
            onLogout={handleLogout}
            onCancel={handleDeadTokenCancel}
          />
        </div>
      )}
    </div>
  );
}
