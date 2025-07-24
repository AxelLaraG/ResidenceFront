"use client";

import { fetchUserXML, validateXML } from "@/services/Functions";
import { useEffect, useState } from "react";
import Header from "@/components/ui/Header/Header";
import { useRouter } from "next/navigation";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";
import Checkbox from "@/components/ui/CheckBox/CheckBox";
import { useAuth } from "@/hooks/useAuth";

export default function MainView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    user,
    showDeadToken,
    deadTokenReason,
    textToken,
    stayOnline,
    handleDeadTokenCancel,
    handleLogout,
  } = useAuth(router);

  useEffect(() => {
    if (!user) return;

    setError(null);
    const fetchData = async () => {
      try {
        const username = user.email.split("@")[0];
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
  }, [user]);

  const handleCustomChangeView = () => {
    setError(null);
    setLoading(true);
    router.push("/EsquemasConf");
  };

  const handleCustomLogout = () => {
    setError(null);
    setLoading(true);
    handleLogout();
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
        onLogout={handleCustomLogout}
        role={user?.role}
        onChangeView={handleCustomChangeView}
      />

      {showDeadToken && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <DeadToken
            title={deadTokenReason}
            message={textToken}
            stayOnline={stayOnline}
            onLogout={handleCustomLogout}
            onCancel={handleDeadTokenCancel}
          />
        </div>
      )}
    </div>
  );
}
