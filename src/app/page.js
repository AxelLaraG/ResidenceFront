"use client";

import { useState } from "react";

export default function XmlUploader() {
  const [xmlData, setXmlData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownload = async () => {
    const response = await fetch("http://127.0.0.1:8000/xml_gen/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedItems), // Enviar solo los datos seleccionados
    });

    const xmlData = await response.text();
    const blob = new Blob([xmlData], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "datos.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("documento_xml", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.valido) {
        setError(null);
        setXmlData(result.data); // El JSON retornado es asignado aquí
      } else {
        setError(`Error en validación: ${result.detail}`);
        setXmlData(null);
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
      setXmlData(null);
    }
  };

  // Filtra los atributos como @attributes y retorna las claves del objeto
  const filterAttributes = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    return Object.keys(obj)
      .filter((key) => !key.startsWith("@")) // Filtra claves que comienzan con '@' (atributos XML)
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
  };

  // Función para manejar la selección de una etiqueta principal (sección)
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  // Función que extrae las etiquetas dentro de la clave "cvu"
  const getMainTags = (data) => {
    if (!data || !data.cvu) return []; // Asegura que haya un objeto "cvu"
    return Object.keys(data.cvu).filter((key) => key !== "xmlns:xsi"); // Filtra atributos no deseados
  };

  const handleSelected = (event) => {
    const checkbox = event.target;
    const row = checkbox.closest("tr");
    const cells = row.querySelectorAll("td");
    const selectedData = Array.from(cells).map((cell) => cell.innerText);
    const clave = selectedData[0];
    const valor = selectedData[1];

    setSelectedItems((prev) => {
      const updatedItems = { ...prev };

      if (clave in updatedItems) {
        delete updatedItems[clave];
      } else {
        updatedItems[clave] = valor;
      }

      return updatedItems;
    });
  };

  return (
    <div className="flex">
      {/* Barra lateral */}
      <div className="w-1/4 p-4 border-r border-gray-300">
        <h2 className="font-semibold text-xl mb-4">Secciones del CVU</h2>
        <div className="space-y-2">
          {xmlData && getMainTags(xmlData).length > 0 ? (
            getMainTags(xmlData).map((key) => (
              <button
                key={key}
                className="w-full text-left p-2 bg-gray-200 rounded"
                onClick={() => handleTagClick(key)}
              >
                <span>{key}</span>
              </button>
            ))
          ) : (
            <p>No se encontraron secciones.</p>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
        >
          Validar XML
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {selectedTag && xmlData && (
          <div>
            <h3 className="text-xl font-semibold mb-4">{selectedTag}</h3>
            {xmlData.cvu[selectedTag] ? (
              <table className="custom-table" id="data-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                    <th>Selección</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    filterAttributes(xmlData.cvu[selectedTag])
                  ).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                      <td>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            className="checkbox"
                            onClick={handleSelected}
                            checked={
                              selectedItems && selectedItems[key] !== undefined
                            }
                            readOnly
                          />
                          <div className="svg-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="1em"
                              viewBox="0 0 448 512"
                            >
                              <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                            </svg>
                          </div>
                          <span className="container"></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay datos disponibles para esta sección.</p>
            )}
          </div>
        )}

        {selectedItems && Object.keys(selectedItems).length > 0 && (
          <button onClick={handleDownload} className="button-save">
            <div className="svg-wrapper-1">
              <div className="svg-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  className="icon"
                >
                  <path d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"></path>
                </svg>
              </div>
            </div>
            <span>Save</span>
          </button>
        )}
      </div>
    </div>
  );
}
