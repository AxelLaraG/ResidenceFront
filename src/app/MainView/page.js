"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header/Header";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";
import SideMenu from "@/components/SideMenu/SideMenu";
import UserDataTable from "@/components/ui/UserDataTable/UserDataTable";
import SaveButton from "@/components/ui/SaveButton/SaveButton"; // Importa SaveButton
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { updateXML } from "@/services/Functions";

export default function MainView() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [isRowSelected, setIsRowSelected] = useState(false); // Nuevo estado para la selección de filas
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

  const { displayData, loading, error, updateSharing } = useUserData(user);

  useEffect(() => {
    if (user && user.institution && !selectedInstitution) {
      setSelectedInstitution(user.institution);
    }
  }, [user, selectedInstitution]);

  const handleSectionSelection = (sectionName) => {
    if (displayData && displayData[sectionName]) {
      setSelectedSection({
        groupName: sectionName,
      });
      setIsRowSelected(false);
    }
  };

  const handleNodeSelect = (node, path) => {
    handleSectionSelection(node.name);
  };

  const handleInstitutionChange = (institution) => {
    setSelectedInstitution(institution);
    setSelectedSection(null);
    setIsRowSelected(false);
  };

  const filteredData = useMemo(() => {
    if (!displayData || !selectedInstitution) return null;

    const filtered = {};
    for (const sectionName in displayData) {
      const sectionElements = displayData[sectionName].filter(
        (element) =>
          element.sharedWith && element.sharedWith.includes(selectedInstitution)
      );
      if (sectionElements.length > 0) {
        filtered[sectionName] = sectionElements;
      }
    }
    return filtered;
  }, [displayData, selectedInstitution]);

  const allInstitutions = useMemo(() => {
    if (!displayData) return [];
    const institutions = new Set();
    Object.values(displayData).forEach((section) => {
      section.forEach((el) => {
        el.allInstitutions.forEach((inst) => institutions.add(inst));
      });
    });
    return Array.from(institutions);
  }, [displayData]);

  const elementsForSelectedSection =
    filteredData && selectedSection
      ? filteredData[selectedSection.groupName]
      : [];

  const handleElementSelect = (item, checked) => {
    const anySelected = elementsForSelectedSection.some(
      (el) => document.getElementById(`checkbox-${el.uniqueId}`)?.checked
    );
    setIsRowSelected(anySelected || checked);
  };

  const handleSave = async () => {
    try {
      if (!selectedInstitution || !elementsForSelectedSection) {
        console.error("No hay institución seleccionada o datos para guardar.");
        return;
      }

      const selectedData = elementsForSelectedSection.reduce((acc, element) => {
        const checkbox = document.getElementById(
          `checkbox-${element.uniqueId}`
        );
        if (checkbox?.checked) {
          acc[element.label] = element.value;
        }
        return acc;
      }, {});

      await updateXML(selectedInstitution, selectedData);

      console.log("Datos guardados exitosamente.");
      // Aquí podrías añadir una notificación para el usuario
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      // Y aquí manejar el error, mostrando un mensaje al usuario
    }
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
          <ErrorCard message={error} onClose={() => {}} />
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white shadow-md">
        <Header
          username={user?.name}
          email={user?.email}
          vista="1"
          onLogout={handleLogout}
          role={user?.role}
          onChangeView={() => router.push("/EsquemasConf")}
          institutions={allInstitutions}
          selectedInstitution={selectedInstitution}
          onInstitutionChange={handleInstitutionChange}
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
        <div className="flex flex-1 overflow-hidden">
          <SideMenu
            dataXSD={filteredData}
            selectedSection={selectedSection}
            onNodeSelect={handleNodeSelect}
          />
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSection ? (
              <div>
                <div className="flex items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedSection.groupName}
                  </h1>
                </div>
                <UserDataTable
                  sectionData={elementsForSelectedSection}
                  onSharingChange={updateSharing}
                  onElementSelect={handleElementSelect}
                />
                {isRowSelected && (
                  <div className="ml-4">
                    <SaveButton handleSubmit={handleSave} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24"
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
                  Bienvenido a tu Gestor de Información
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona una sección del menú para ver tus datos que puedes
                  compartir con la institución:{" "}
                  <span className="font-semibold text-indigo-600">
                    {selectedInstitution}
                  </span>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
