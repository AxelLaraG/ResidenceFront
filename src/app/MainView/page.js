"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header/Header";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";
import SideMenu from "@/components/SideMenu/SideMenu";
import UserDataTable from "@/components/ui/UserDataTable/UserDataTable";
import Button from "@/components/ui/Button/Button";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";

export default function MainView() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedElements, setSelectedElements] = useState({}); // Cambiado para selección múltiple
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

  const handleSectionSelection = (sectionName) => {
    if (displayData && displayData[sectionName]) {
      setSelectedSection({
        groupName: sectionName,
        elements: displayData[sectionName],
      });
      setSelectedElements({}); // Resetea la selección al cambiar de sección
    }
  };

  const handleNodeSelect = (node, path) => {
    handleSectionSelection(node.name);
  };

  const handleElementSelect = (element, isSelected) => {
    setSelectedElements((prev) => {
      const newSelected = { ...prev };
      if (isSelected) {
        newSelected[element.uniqueId] = element;
      } else {
        delete newSelected[element.uniqueId];
      }
      return newSelected;
    });
  };

  const getSelectedInstitutions = () => {
    const institutions = new Set();
    Object.values(selectedElements).forEach((element) => {
      if (element.sharedWith) {
        element.sharedWith.forEach((inst) => institutions.add(inst));
      }
    });
    return Array.from(institutions);
  };

  const selectedInstitutions = getSelectedInstitutions();

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
            dataXSD={displayData}
            selectedSection={selectedSection}
            onNodeSelect={handleNodeSelect}
          />
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSection ? (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedSection.groupName}
                </h1>
                <UserDataTable
                  sectionData={selectedSection.elements}
                  onSharingChange={updateSharing}
                  onElementSelect={handleElementSelect}
                  selectedElements={selectedElements}
                />
                {selectedInstitutions.length > 0 && (
                  <div className="mt-4 flex gap-4">
                    {selectedInstitutions.map((institution) => (
                      <Button
                        key={institution}
                        text={`Enviar a ${institution}`}
                        onClick={() =>
                          console.log(
                            `Enviando ${Object.values(selectedElements)
                              .map((el) => el.label)
                              .join(", ")} a ${institution}`
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
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
                  Bienvenido a tu Gestor de Información
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona una sección del menú lateral para ver y administrar
                  con quién compartes tus datos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
