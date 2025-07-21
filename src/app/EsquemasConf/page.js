"use client";

import {
  fetchUserXML,
  getCurrentUser,
  validateXML,
} from "@/services/Functions";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/ui/Header/Header";
import { useRouter } from "next/navigation";
import { logout, getXSD, parseXsdToGroupedElements } from "@/services/Functions";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";

export default function EsquemasConf() {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeadToken, setShowDeadToken] = useState(false);
  const [deadTokenReason, setDeadTokenReason] = useState("");
  const [textToken, setTextToken] = useState("");
  const [stayOnline, setStayOnline] = useState(false);
  const [xsdRaw, setXsdRaw] = useState(null);
  const [groupedElements, setGroupedElements] = useState([]);

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
    const loadXSD = async () => {
      try {
        const usuario = await getCurrentUser();
        setUser(usuario);
        const data = await getXSD();
        setXsdRaw(data);
        const grouped = parseXsdToGroupedElements(data);
        setGroupedElements(grouped);
      } catch (error) {
        console.log(error)
        setError("Error al cargar el XSD");
      }
    };
    loadXSD();
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

  const handleOnChangeView = () => {
    setError(null);
    setLoading(true);
    router.push("/MainView");
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
        username=""
        email={user?.email}
        vista="2"
        onLogout={handleLogout}
        onChangeView={handleOnChangeView}
        role={user?.role}
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

      <div className="p-4">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Elementos por tipo complejo
          </h2>

          {groupedElements.length === 0 ? (
            <p>Cargando elementos...</p>
          ) : (
            groupedElements.map((group, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-bold mb-2 text-indigo-600">
                  {group.groupName}
                </h3>
                <table className="table-auto border-collapse w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-4 py-2">Nombre</th>
                      <th className="border px-4 py-2">Tipo</th>
                      <th className="border px-4 py-2">minOccurs</th>
                      <th className="border px-4 py-2">maxOccurs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.elements.map((el, i) => (
                      <tr key={i} className="hover:bg-gray-100">
                        <td className="border px-4 py-2">{el.name}</td>
                        <td className="border px-4 py-2">{el.type}</td>
                        <td className="border px-4 py-2">{el.minOccurs}</td>
                        <td className="border px-4 py-2">{el.maxOccurs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
