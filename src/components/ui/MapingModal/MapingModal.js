import React, { useState, useMemo } from "react";
import Button from "../Button/Button";

const MappingModal = ({
  isOpen,
  onClose,
  elementToMap,
  institutionXSD,
  onSaveMapping,
}) => {
  const [selectedTargetField, setSelectedTargetField] = useState("");

  const institutionalFields = useMemo(() => {
    if (!institutionXSD) return [];
    const fields = [];
    const extractFields = (elements) => {
      elements.forEach((el) => {
        fields.push(el.name);
        if (el.children && el.children.length > 0) {
          extractFields(el.children);
        }
      });
    };
    Object.values(institutionXSD).forEach((section) => extractFields(section));
    return [...new Set(fields)]; // Eliminar duplicados
  }, [institutionXSD]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedTargetField) {
      onSaveMapping(elementToMap, selectedTargetField);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Mapear Elemento
        </h2>
        <p className="mb-2 text-gray-700">
          Estás compartiendo el elemento:{" "}
          <strong className="font-mono bg-gray-100 p-1 rounded">
            {elementToMap?.element.name}
          </strong>
        </p>
        <p className="mb-4 text-gray-700">
          Selecciona con qué campo de tu institución se corresponde:
        </p>

        <select
          value={selectedTargetField}
          onChange={(e) => setSelectedTargetField(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-6"
        >
          <option value="" disabled>
            Selecciona un campo...
          </option>
          {institutionalFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4">
          <Button text="Cancelar" onClick={onClose} />
          <Button text="Guardar Mapeo" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default MappingModal;
