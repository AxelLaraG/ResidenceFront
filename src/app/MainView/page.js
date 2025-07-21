"use client";

import {
  fetchUserXML,
  getCurrentUser,
  validateXML,
} from "@/services/Functions";
import { useEffect, useState } from "react";
import Header from "@/components/ui/Header/Header";

export default function MainView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setError(null);
    const fetchData = async () => {
      try {
        const usuario = await getCurrentUser(); // ya no recibe token
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

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Header username={data?.data?.cvu?.MiPerfil.Nombre} email={user?.email}/>

      
    </div>
  );
}
