import Button from "@/components/ui/Button/Button";
import { updateBaseData } from "@/services/Functions";

const ChangesPanel = ({ 
  hasChangesInBaseData,
  hasGlobalChanges,
  getChangedElements,
  globalChanges,
  setSelectedElements,
  setGlobalChanges,
  handleRefreshAfterUpdate
}) => {
  const handleUpdateBase = async () => {
    try {
      // Preparar los datos para enviar al backend
      const changesData = {
        manual: globalChanges.manual,
        automated: globalChanges.automated
      };

      const result = await updateBaseData(changesData);
      
      setSelectedElements({});
      setGlobalChanges({ manual: [], automated: [] });
 

      if (handleRefreshAfterUpdate) {
        handleRefreshAfterUpdate();
      }
      
    } catch (error) {
      throw new Error("Error al guardar cambios:", error);
    }
  };

  const handleDiscardChanges = () => {
    setSelectedElements({});
    setGlobalChanges({ manual: [], automated: [] });
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

      {/* Panel de elementos agregados automáticamente */}
      {globalChanges.automated.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Elementos agregados automáticamente ({globalChanges.automated.length})
          </h4>
          <div className="text-xs text-green-700">
            <p>
              🤖 Elementos hijos agregados automáticamente:{" "}
              {globalChanges.automated.map((item) => item.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Panel de cambios globales */}
      {hasGlobalChanges() && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Todos los cambios pendientes
          </h4>
          <div className="text-xs text-yellow-700 mb-3">
            {globalChanges.manual.length > 0 && (
              <p>
                ✅ Elementos manuales ({globalChanges.manual.length}):{" "}
                {globalChanges.manual.map((item) => item.name).join(", ")}
              </p>
            )}
            <div className="mt-1 pt-1 border-t border-yellow-300">
              <strong>
                Total de elementos: {globalChanges.manual.length + globalChanges.automated.length}
              </strong>
            </div>
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
