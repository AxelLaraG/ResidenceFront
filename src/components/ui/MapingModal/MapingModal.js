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

  const institutionalFieldsList = useMemo(() => {
    if (!institutionXSD) return [];

    const fields = [];
    const seenFields = new Set();

    const findLeafNodesAndAttributes = (elements, path, uniqueIdPath) => {
      elements.forEach((el) => {
        const currentPath = [...path, el.name];
        const currentUniqueIdPath = [...uniqueIdPath, el.name];
        const uniqueId = currentUniqueIdPath.join("_");

        if (!el.children || el.children.length === 0) {
          if (!seenFields.has(uniqueId)) {
            fields.push({
              label: currentPath.join(" > "),
              value: uniqueId,
              isAttribute: false,
              elementName: el.name,
            });
            seenFields.add(uniqueId);
          }
        } else {
          findLeafNodesAndAttributes(
            el.children,
            currentPath,
            currentUniqueIdPath
          );
        }

        if (el.attributes && el.attributes.length > 0) {
          el.attributes.forEach((attr) => {
            if (attr.use === "required") {
              const attrUniqueId = `${uniqueId}_@${attr.name}`;
              if (!seenFields.has(attrUniqueId)) {
                fields.push({
                  label: `${currentPath.join(" > ")} > (atributo) ${attr.name}`,
                  value: attrUniqueId,
                  isAttribute: true,
                  elementName: el.name,
                });
                seenFields.add(attrUniqueId);
              }
            }
          });
        }
      });
    };

    Object.entries(institutionXSD).forEach(([sectionName, section]) =>
      findLeafNodesAndAttributes(section, [sectionName], [sectionName])
    );

    return fields.sort((a, b) => a.label.localeCompare(b.label));
  }, [institutionXSD]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedTargetField) {
      onSaveMapping(elementToMap, selectedTargetField);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Mapear Elemento
        </h2>
        <p className="mb-2 text-gray-700">
          Estás compartiendo:{" "}
          <strong className="font-mono bg-gray-100 p-1 rounded">
            {elementToMap?.element.name}
          </strong>
        </p>
        <p className="mb-4 text-gray-700 font-semibold">
          Selecciona el campo correspondiente en la estructura de tu
          institución:
        </p>

        <select
          value={selectedTargetField}
          onChange={(e) => setSelectedTargetField(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-6 font-mono text-sm"
        >
          <option value="" disabled>
            Selecciona un campo...
          </option>
          {institutionalFieldsList.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
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
