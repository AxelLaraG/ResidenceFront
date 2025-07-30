import React from "react";
import Checkbox from "@/components/ui/CheckBox/CheckBox";

const renderValue = (value) => {
  if (value && value["#text"]) return value["#text"];

  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
          {typeof item === "object"
            ? Object.entries(item).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <strong>{key}:</strong> {renderValue(val)}
                </div>
              ))
            : String(item)}
        </div>
      ));
    }

    return (
      <div className="space-y-1">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="text-xs">
            <strong className="text-gray-700">{key}:</strong>
            <span className="ml-1">{renderValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }

  return String(value);
};

const SyncIndicator = ({ status }) => {
  const styles = {
    synced: { backgroundColor: "#4CAF50", title: "Sincronizado" },
    out_of_sync: { backgroundColor: "#FFC107", title: "Desincronizado" },
    not_mapped: { backgroundColor: "#9E9E9E", title: "No mapeado" },
  };

  const currentStyle = styles[status] || styles.not_mapped;

  return (
    <div
      title={currentStyle.title}
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: currentStyle.backgroundColor,
        display: "inline-block",
        marginLeft: "10px",
        verticalAlign: "middle",
      }}
    />
  );
};

const UserDataTable = ({
  sectionData,
  onSharingChange,
  isSelected,
  onElementSelect,
  syncStatus,
}) => {
  if (!sectionData || sectionData.length === 0) {
    return (
      <p className="text-gray-500 p-4">
        No hay datos para mostrar en esta sección para la institución
        seleccionada.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="font-semibold p-3 text-center">Campo</th>
            <th className="font-semibold p-3 text-center">Valor</th>
            <th className="font-semibold p-3 text-center">Compartir</th>
            <th className="font-semibold p-3 text-center">Tipo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sectionData.map((item) => {
            const isComplex =
              typeof item.value === "object" && item.value !== null;
            const isAdditive =
              Array.isArray(item.value) ||
              (item.label && item.label.toLowerCase().includes("item"));

            return (
              <tr key={item.uniqueId} className="hover:bg-gray-50">
                <td className="p-3 align-middle font-medium text-gray-800 text-center">
                  {item.label}
                  <SyncIndicator status={syncStatus[item.uniqueId]} />
                </td>
                <td className="p-3 align-top text-gray-600 text-center max-w-md">
                  <div className="whitespace-pre-wrap font-sans overflow-auto max-h-32">
                    {renderValue(item.value)}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex justify-center">
                    <Checkbox
                      id={`checkbox-${item.uniqueId}`}
                      checked={isSelected}
                      onChange={(e) => {
                        if (onElementSelect) {
                          onElementSelect(item, e.target.checked);
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      isAdditive
                        ? "bg-blue-100 text-blue-800"
                        : isComplex
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isAdditive ? "Aditivo" : isComplex ? "Complejo" : "Simple"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserDataTable;
