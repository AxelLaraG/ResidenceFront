"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { xsdToJson, updateFieldMapping } from "@/services/Functions";

// Components
import Header from "@/components/ui/Header/Header";
import ErrorCard from "@/components/ui/ErrorMessage/Error";
import Loader from "@/components/ui/LoadPage/Load";
import DeadToken from "@/components/ui/DeadToken/DeadToken";
import Button from "@/components/ui/Button/Button";
import TreeView from "@/components/ui/TreeView/TreeView";
import Verification from "@/components/ui/Verification/Verification";
import SideMenu from "@/components/SideMenu/SideMenu";
import ElementsTable from "@/components/ElementsTable/ElementsTable";
import ChangesPanel from "@/components/ChangesPanel/ChangesPanel";
import MappingModal from "@/components/ui/MapingModal/MapingModal";

// Custom Hooks
import { useAuth } from "@/hooks/useAuth";
import { useElementSelection } from "@/hooks/useElementSelection";
import { useVerification } from "@/hooks/useVerification";

export default function EsquemasConf() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataXSD, setDataXSD] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showTreeView, setShowTreeView] = useState(false);
  const [baseData, setBaseData] = useState(null);

  const [institutionXSD, setInstitutionXSD] = useState(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [elementToMap, setElementToMap] = useState(null);

  const router = useRouter();

  const {
    user,
    showDeadToken,
    deadTokenReason,
    textToken,
    stayOnline,
    handleDeadTokenCancel,
    handleLogout,
    handleOnChangeView,
  } = useAuth(router);

  const {
    selectedElements,
    setSelectedElements,
    globalChanges,
    setGlobalChanges,
    getElementUniqueId,
    isElementInBaseData,
    isElementSelectedByUniqueId,
    countElementChildren,
    countUnselectedChildren,
    hasGlobalChanges,
    hasChangesInBaseData,
    getChangedElements,
    markAsManualSelection,
    markAsAutomatedSelection,
    manualSelections,
    getDescendantIds,
    selectParents,
  } = useElementSelection(
    dataXSD,
    baseData,
    selectedSection,
    user?.institution
  );

  const {
    showVerification,
    verificationData,
    handleCheckboxChange: originalHandleCheckboxChange,
    handleVerificationAccept,
    handleVerificationCancel,
    handleVerificationClose,
    // Añade los nuevos estados y manejadores
    showDeselectVerification,
    deselectVerificationData,
    handleDeselectAccept,
    handleDeselectCancel,
  } = useVerification(
    selectedElements,
    setSelectedElements,
    getElementUniqueId,
    countElementChildren,
    countUnselectedChildren,
    markAsManualSelection,
    markAsAutomatedSelection,
    getDescendantIds,
    selectParents
  );

  useEffect(() => {
    const loadAllXSDs = async () => {
      try {
        setLoading(true);
        const rizomaData = await xsdToJson("rizoma");
        setDataXSD(rizomaData);

        if (user && user.institution) {
          const institutionKey = user.institution.toLowerCase();
          const institutionData = await xsdToJson(institutionKey);
          setInstitutionXSD(institutionData);
        }

        const baseDataResult = await xsdToJson("base");
        setBaseData(baseDataResult);
      } catch (error) {
        setError("Error al cargar los esquemas XSD");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      // Espera a que el usuario esté cargado
      loadAllXSDs();
    }
  }, [user]);

  const handleCheckboxChange = (element, checked, elementData) => {
    if (checked) {
      // Si el usuario marca la casilla, abrimos el modal para mapear
      setElementToMap({ element, elementData });
      setShowMappingModal(true);
    } else {
      // Lógica para deseleccionar (puedes hacerla más compleja si es necesario)
      // Por ejemplo, preguntar si se quiere eliminar el mapeo.
      const uniqueId = getElementUniqueId(element);
      setSelectedElements((prev) => ({ ...prev, [uniqueId]: false }));
    }
  };

  const handleSaveMapping = async (sourceElement, targetFieldName) => {
    try {
      const sourceUniqueId = getElementUniqueId(sourceElement.element);
      await updateFieldMapping(
        user.institution,
        sourceUniqueId,
        targetFieldName
      );

      setSelectedElements((prev) => ({
        ...prev,
        [sourceUniqueId]: sourceElement.elementData,
      }));

      setShowMappingModal(false);
      setElementToMap(null);
      // Opcional: mostrar notificación de éxito
    } catch (error) {
      setError("Error al guardar el mapeo: " + error.message);
    }
  };

  const handleNodeSelect = (node, path) => {
    setSelectedSection({
      groupName: node.name,
      elements: node.children || [],
      fullPath: path,
    });
  };

  const handleRefreshAfterUpdate = async () => {
    try {
      setLoading(true);
      const baseDataResult = await xsdToJson("base");
      setBaseData(baseDataResult);
    } catch (error) {
      setError("Error al actualizar los datos base");
    } finally {
      setLoading(false);
    }
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

      {showVerification && verificationData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <Verification
            title="Elemento con hijos detectado"
            message={`El elemento "${verificationData.element.name}" tiene ${
              verificationData.totalChildren
            } elementos hijos no seleccionados${
              verificationData.allChildren > verificationData.totalChildren
                ? ` (${
                    verificationData.allChildren -
                    verificationData.totalChildren
                  } ya están seleccionados)`
                : ""
            }. ¿Desea agregar los elementos hijos faltantes también?`}
            accept="Agregar todos los faltantes"
            cancel="Cancelar"
            onAccept={handleVerificationAccept}
            onCancel={handleVerificationClose}
            onClose={handleVerificationClose}
          />
        </div>
      )}

      {showDeselectVerification && deselectVerificationData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <Verification
            title="Confirmar Deselección"
            message={`Si desmarca este elemento, se desmarcarán otros ${deselectVerificationData.count} elementos hijos. ¿Desea continuar?`}
            accept="Aceptar"
            cancel="Cancelar"
            onAccept={handleDeselectAccept}
            onCancel={handleDeselectCancel}
            onClose={handleDeselectCancel}
          />
        </div>
      )}

      {showMappingModal && (
        <MappingModal
          isOpen={showMappingModal}
          onClose={() => setShowMappingModal(false)}
          elementToMap={elementToMap}
          institutionXSD={institutionXSD}
          onSaveMapping={handleSaveMapping}
        />
      )}

      <div className="flex h-screen flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Menú lateral */}
          <SideMenu
            dataXSD={dataXSD}
            selectedSection={selectedSection}
            onNodeSelect={handleNodeSelect}
          />

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

                    <ElementsTable
                      elements={selectedSection.elements}
                      user={user}
                      isElementSelectedByUniqueId={isElementSelectedByUniqueId}
                      isElementInBaseData={isElementInBaseData}
                      getElementUniqueId={getElementUniqueId}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  </div>

                  {selectedSection.groupName === "cvu" && (
                    <Button text="Ver Diagrama" onClick={handleShowTreeView} />
                  )}

                  <ChangesPanel
                    hasChangesInBaseData={hasChangesInBaseData}
                    hasGlobalChanges={hasGlobalChanges}
                    getChangedElements={getChangedElements}
                    globalChanges={globalChanges}
                    selectedElements={selectedElements}
                    selectedSection={selectedSection}
                    getElementUniqueId={getElementUniqueId}
                    setSelectedElements={setSelectedElements}
                    setGlobalChanges={setGlobalChanges}
                    handleRefreshAfterUpdate={handleRefreshAfterUpdate}
                    user={user}
                  />
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
