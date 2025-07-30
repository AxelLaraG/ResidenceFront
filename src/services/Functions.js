import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const login = async (email, password) => {
  try {
    const response = await apiClient.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Error de autenticación");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la petición");
    }
  }
};

export const logout = async () => {
  try {
    const res = await apiClient.post("/logout");
    return res.data;
  } catch (error) {
    throw new Error("Error al cerrar sesión");
  }
};

export const getCurrentUser = async (token) => {
  try {
    const res = await apiClient.get("/usuario_actual", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.usuario;
  } catch (error) {
    throw new Error("Error al obtener el usuario actual");
  }
};

export const fetchUserXML = async (username) => {
  try {
    const res = await fetch(
      `http://localhost:8080/SECIHTIServ/files/${username}.xml`
    );
    if (!res.ok) throw new Error("No se pudo obtener el XML del usuario");
    const xmlText = await res.text();
    return xmlText;
  } catch (error) {
    throw new Error("Error al obtener el XML");
  }
};

export const validateXML = async (formData) => {
  try {
    const res = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Error al validar el XML");
    } else {
      throw new Error("Error al validar el XML");
    }
  }
};

export const xsdToJson = async (opt) => {
  try {
    const res = await apiClient.get("/api/xsd", {
      params: { opt },
    });
    return res.data;
  } catch (error) {
    throw new Error("Error al convertir XSD a JSON");
  }
};

export const updateBaseData = async (changesData, institute) => {
  try {
    console.log(
      `Recibiendo cambios para actualizar la base de datos: ${JSON.stringify(
        changesData
      )}`
    );
    const res = await apiClient.post("/api/update-base", changesData, {
      params: { institute },
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Error al actualizar la base de datos"
      );
    } else {
      throw new Error("Error al actualizar la base de datos");
    }
  }
};

export const updateSharingAPI = async (uniqueId, institutions) => {
  try {
    const res = await apiClient.post("/api/update-sharing", {
      uniqueId,
      institutions,
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Error al actualizar los permisos"
      );
    } else {
      throw new Error("Error al actualizar los permisos");
    }
  }
};

export const updateXML = async (institution, data) => {
  try {
    const res = await apiClient.post("/api/update-xml", {
      institution,
      data,
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Error al actualizar el XML"
      );
    } else {
      throw new Error("Error al actualizar el XML");
    }
  }
};

export const updateFieldMapping = async (
  institution,
  sourceUniqueId,
  targetUniqueId 
) => {
  try {
    const res = await apiClient.post("/api/update-mapping", {
      institution,
      sourceUniqueId,
      targetUniqueId, 
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Error al guardar el mapeo"
      );
    }
    throw new Error("Error al guardar el mapeo");
  }
};

export const getXmlUrls = async () => {
  try {
    const res = await apiClient.get("/api/xml-urls");
    return res.data;
  } catch (error) {
    throw new Error("Error al obtener las URLs de los XML");
  }
};

export const fetchInstitutionXML = async (institution, username) => {
  try {
    const urls = await getXmlUrls();
    const baseUrl = urls[institution.toLowerCase()];
    if (!baseUrl) {
      throw new Error(`No se encontró URL para la institución: ${institution}`);
    }
    const res = await fetch(`${baseUrl}${username}.xml`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`No se pudo obtener el XML para ${institution}`);
    }
    const xmlText = await res.text();
    return xmlText;
  } catch (error) {
    console.error(error);
    if (error.message.includes("404")) return null;
    throw new Error("Error al obtener el XML de la institución");
  }
};
