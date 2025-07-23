import Button from "@/components/ui/Button/Button";

const ChangesPanel = ({ 
  hasChangesInBaseData,
  hasGlobalChanges,
  getChangedElements,
  globalChanges,
  selectedElements,
  selectedSection,
  getElementUniqueId,
  setSelectedElements,
  setGlobalChanges
}) => {
  const handleUpdateBase = () => {
    console.log("=== DEBUG: Estado actual ===");
    console.log("Cambios globales a aplicar:", globalChanges);
    console.log("Elementos seleccionados por ID único:", selectedElements);
    console.log("=== Mapeo de IDs únicos ===");
    Object.keys(selectedElements).forEach((uniqueId) => {
      if (selectedElements[uniqueId]) {
        console.log(`  ${uniqueId} -> ${selectedElements[uniqueId].name}`);
      }
    });
    console.log(`Total de elementos seleccionados: ${Object.keys(selectedElements).length}`);
    
    if (selectedSection) {
      console.log("=== DEBUG: Sección actual ===");
      console.log("Sección:", selectedSection.groupName);
      console.log("Elementos en la sección:");
      selectedSection.elements.forEach((element, index) => {
        const elementId = getElementUniqueId(element);
        const isSelected = selectedElements[elementId] !== undefined;
        console.log(`  ${index + 1}. ${element.name} (ID: ${elementId}) - Seleccionado: ${isSelected}`);
      });
    }
  };

  const handleDiscardChanges = () => {
    setSelectedElements({});
    setGlobalChanges({ added: [], removed: [] });
  };

  return (
    <>
      {/* Panel de cambios en la sección actual */}
      {hasChangesInBaseData() && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Cambios en esta sección
          </h4>
          {(() => {
            const changes = getChangedElements();
            return (
              <div className="text-xs text-blue-700">
                {changes.added.length > 0 && (
                  <p>
                    ✅ Elementos a agregar:{" "}
                    {changes.added.map((item) => item.name).join(", ")}
                  </p>
                )}
                {changes.removed.length > 0 && (
                  <p>
                    ❌ Elementos a remover:{" "}
                    {changes.removed.map((item) => item.name).join(", ")}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Panel de cambios globales */}
      {hasGlobalChanges() && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Todos los cambios pendientes
          </h4>
          <div className="text-xs text-yellow-700 mb-3">
            {globalChanges.added.length > 0 && (
              <p>
                ✅ Elementos a agregar ({globalChanges.added.length}):{" "}
                {globalChanges.added.map((item) => item.name).join(", ")}
              </p>
            )}
            {globalChanges.removed.length > 0 && (
              <p>
                ❌ Elementos a remover ({globalChanges.removed.length}):{" "}
                {globalChanges.removed.map((item) => item.name).join(", ")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button text="Actualizar Base" onClick={handleUpdateBase} />
            <Button text="Descartar Cambios" onClick={handleDiscardChanges} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChangesPanel;
