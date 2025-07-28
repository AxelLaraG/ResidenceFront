import React from "react";
import Checkbox from "@/components/ui/CheckBox/CheckBox";

const renderValue = (value) => {
  if (value && value["#text"]) return value["#text"];
  if (typeof value === "object" && value !== null)
    return JSON.stringify(value, null, 2);
  return String(value);
};

const UserDataTable = ({
  sectionData,
  onSharingChange,
  onElementSelect,
  selectedElements,
}) => {
  if (!sectionData || sectionData.length === 0) {
    return (
      <p className="text-gray-500 p-4">
        No hay datos para mostrar en esta sección.
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sectionData.map((item) => {
            const isSelected = !!selectedElements[item.uniqueId];
            return (
              <tr
                key={item.uniqueId}
                className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
              >
                <td className="p-3 align-top font-medium text-gray-800">
                  <div className="flex justify-center">{item.label}</div>
                </td>
                <td className="p-3 align-top text-gray-600">
                  <div className="flex justify-center">
                    <pre className="whitespace-pre-wrap font-sans">
                      {renderValue(item.value)}
                    </pre>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm ">
                  <div className="flex justify-center">
                    <Checkbox
                      id={`checkbox-${item.uniqueId}`}
                      checked={isSelected}
                      onChange={(e) => {
                        onElementSelect(item, e.target.checked);
                      }}
                    />
                  </div>
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
