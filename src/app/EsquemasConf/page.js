"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/ui/Header/Header";
import { useRouter } from "next/navigation";
import { logout, getCurrentUser, xsdToJson } from "@/services/Functions";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";
import Button from "@/components/ui/Button/Button";
import TreeView from "@/components/ui/TreeView/TreeView";

export default function EsquemasConf() {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeadToken, setShowDeadToken] = useState(false);
  const [deadTokenReason, setDeadTokenReason] = useState("");
  const [textToken, setTextToken] = useState("");
  const [stayOnline, setStayOnline] = useState(false);
  const [dataXSD, setDataXSD] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showTreeView, setShowTreeView] = useState(false);
  const [baseData, setBaseData] = useState(null);

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

        const data = await xsdToJson("rizoma");
        setDataXSD(data);

        const baseData = await xsdToJson("base");
        setBaseData(baseData);
        console.log("Base Data:", baseData);
      } catch (error) {
        console.log(error);
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

  const getElementsWithChildren = () => {
    if (!dataXSD) return [];

    const elementsWithChildren = [];
    const addedElementNames = new Set();

    const exploreElement = (element, parentPath = []) => {
      if (
        element.children &&
        element.children.length > 0 &&
        !addedElementNames.has(element.name)
      ) {
        elementsWithChildren.push({
          parentSection:
            parentPath.length > 0 ? parentPath.join(" → ") : "Raíz",
          elementName: element.name,
          children: element.children,
          element: element,
          depth: parentPath.length,
          fullPath: [...parentPath, element.name],
        });

        addedElementNames.add(element.name);

        element.children.forEach((child) => {
          exploreElement(child, [...parentPath, element.name]);
        });
      }
    };

    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        exploreElement(element, [sectionName]);
      });
    });
    return elementsWithChildren;
  };

  const handleChildrenSelection = (elementWithChildren) => {
    setSelectedSection({
      groupName: `${elementWithChildren.elementName} (de ${elementWithChildren.parentSection})`,
      elements: elementWithChildren.children,
      parentInfo: {
        section: elementWithChildren.parentSection,
        element: elementWithChildren.elementName,
      },
    });
  };

  const handleGroupSelection = (group) => {
    setSelectedSection(group);
  };

  const handleSectionSelection = (sectionName) => {
    setSelectedSection({
      groupName: sectionName,
      elements: dataXSD[sectionName],
    });
  };

  const handleShowTreeView = () => {
    setShowTreeView(true);
  };

  const handleCloseTreeView = () => {
    setShowTreeView(false);
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

      <div className="sticky top-0 z-40 bg-white shadow-md">
        <Header
          username=""
          email={user?.email}
          vista="2"
          onLogout={handleLogout}
          onChangeView={handleOnChangeView}
          role={user?.role}
        />
      </div>

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

      <div className="flex h-screen flex-col">
        {/* Header ya está arriba */}

        <div className="flex flex-1 overflow-hidden">
          {/* Menú lateral */}
          <div className="w-95 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Estructura del XSD
              </h2>

              {!dataXSD ? (
                <p className="text-gray-500">Cargando elementos...</p>
              ) : (
                <div className="space-y-4">
                  {/* Secciones principales */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Secciones Principales
                    </h3>
                    <div className="space-y-2">
                      {Object.keys(dataXSD).map((sectionName, index) => (
                        <div key={`section-${index}`} className="relative">
                          <div
                            className={`${
                              selectedSection?.groupName === sectionName
                                ? "bg-indigo-50 border-l-4 border-indigo-500 pl-2 rounded-r-lg"
                                : ""
                            }`}
                          >
                            <Button
                              text={sectionName}
                              onClick={() =>
                                handleSectionSelection(sectionName)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Elementos con subcampos */}
                  {getElementsWithChildren().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Elementos con Subcampos
                      </h3>
                      <div className="space-y-2">
                        {getElementsWithChildren().map(
                          (elementWithChildren, index) => (
                            <div key={`element-${index}`} className="relative">
                              <div
                                className={`${
                                  selectedSection?.parentInfo?.element ===
                                  elementWithChildren.elementName
                                    ? "bg-green-50 border-l-4 border-green-500 pl-2 rounded-r-lg"
                                    : ""
                                }`}
                              >
                                <Button
                                  text={`${elementWithChildren.elementName}`}
                                  onClick={() =>
                                    handleChildrenSelection(elementWithChildren)
                                  }
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {selectedSection ? (
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedSection.groupName}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Elementos: {selectedSection.elements.length}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Elementos ({selectedSection.elements.length})
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table-auto w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Min Occurs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Max Occurs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo Especial
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Atributos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Compartido con {user?.institution}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedSection.elements.map((element, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {element.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    (
                                      element.type || element.baseType
                                    )?.endsWith("Type")
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {element.type || element.baseType || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    element.minOccurs === "0"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {element.minOccurs}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    element.maxOccurs === "unbounded"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {element.maxOccurs}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex gap-1">
                                  {element.isSimpleContent && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                      SimpleContent
                                    </span>
                                  )}
                                  {element.hasComplexType && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                      ComplexType
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {element.attributes &&
                                element.attributes.length > 0 ? (
                                  <div className="space-y-1">
                                    {element.attributes.map(
                                      (attr, attrIndex) => (
                                        <div
                                          key={attrIndex}
                                          className="text-xs"
                                        >
                                          <span className="font-medium text-blue-600">
                                            {attr.name}
                                          </span>
                                          <span className="text-gray-500 ml-1">
                                            ({attr.type})
                                          </span>
                                          <span
                                            className={`ml-1 px-1 py-0.5 rounded ${
                                              attr.use === "required"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                          >
                                            {attr.use}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {selectedSection.groupName === "cvu" && (
                    <Button text="Ver Diagrama" onClick={handleShowTreeView} />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Selecciona un elemento
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Elige un elemento del menú lateral para ver su estructura
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <TreeView
        data={dataXSD}
        selectedSection={selectedSection}
        isOpen={showTreeView}
        onClose={handleCloseTreeView}
      />
    </div>
  );
}
