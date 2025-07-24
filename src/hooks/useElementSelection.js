import { useState, useEffect } from "react";

export const useElementSelection = (
  dataXSD,
  baseData,
  selectedSection,
  userInstitute
) => {
  const [selectedElements, setSelectedElements] = useState({});
  const [globalChanges, setGlobalChanges] = useState({
    added: [],
    removed: [],
    automated: [],
    manual: [],
  });
  const [manualSelections, setManualSelections] = useState(new Set());

  const getElementUniqueId = (element, parentContext = null) => {
    if (parentContext) {
      return `${parentContext}_${element.name}`;
    }

    if (selectedSection && !selectedSection.parentInfo) {
      return `${selectedSection.groupName}_${element.name}`;
    }

    if (selectedSection && selectedSection.parentInfo) {
      return `${selectedSection.parentInfo.section.replace(/ → /g, "_")}_${
        selectedSection.parentInfo.element
      }_${element.name}`;
    }

    return element.name;
  };

  const isElementInBaseData = (element) => {
    if (!baseData) return false;
    return Object.values(baseData).some((section) =>
      section.some((baseElement) => {
        const elementUniqueId = getElementUniqueId(element);
        const baseUniqueId = baseElement.context.uniqueId;

        return (
          baseUniqueId === elementUniqueId &&
          baseElement.context?.institution?.includes(userInstitute)
        );
      })
    );
  };

  const isElementSelectedByUniqueId = (element) => {
    const uniqueId = getElementUniqueId(element);

    if (selectedElements[uniqueId] !== undefined) {
      return selectedElements[uniqueId] !== false;
    }

    return isElementInBaseData(element);
  };

  const countElementChildren = (element) => {
    if (!element.children || element.children.length === 0) {
      return 0;
    }

    let count = element.children.length;
    element.children.forEach((child) => {
      count += countElementChildren(child);
    });

    return count;
  };

  const countUnselectedChildren = (element) => {
    if (!element.children || element.children.length === 0) {
      return 0;
    }

    let unselectedCount = 0;

    element.children.forEach((child) => {
      let childIsSelected = false;

      Object.keys(dataXSD).forEach((sectionName) => {
        dataXSD[sectionName].forEach((sectionElement) => {
          if (sectionElement.name === child.name) {
            const childId = `${sectionName}_${child.name}`;
            if (selectedElements[childId] !== undefined) {
              childIsSelected = true;
            }
          }

          const findChildRecursively = (elem, targetName, path = []) => {
            if (elem.children) {
              elem.children.forEach((childElem) => {
                if (childElem.name === targetName && !childIsSelected) {
                  const childId = `${sectionName}_${elem.name}_${targetName}`;
                  if (selectedElements[childId] !== undefined) {
                    childIsSelected = true;
                  }
                } else {
                  findChildRecursively(childElem, targetName, [
                    ...path,
                    elem.name,
                  ]);
                }
              });
            }
          };

          findChildRecursively(sectionElement, child.name);
        });
      });

      if (!childIsSelected) {
        unselectedCount++;
        unselectedCount += countUnselectedChildren(child);
      }
    });

    return unselectedCount;
  };

  const updateGlobalChanges = () => {
    // Asegurarse de que los datos estén cargados antes de calcular
    if (!dataXSD || !baseData) {
      setGlobalChanges({ added: [], removed: [], manual: [], automated: [] });
      return;
    }

    const allAdded = [];
    const allRemoved = [];

    // Función auxiliar para buscar si un elemento está en la base de datos por su ID único
    const findInBaseData = (uniqueId) => {
      for (const section of Object.values(baseData)) {
        const found = section.find(
          (baseElement) =>
            baseElement.context.uniqueId === uniqueId &&
            baseElement.context?.institution?.includes(userInstitute)
        );
        if (found) return true;
      }
      return false;
    };

    // Función recursiva que atraviesa todos los elementos y construye su uniqueId
    const checkElement = (element, path) => {
      // El uniqueId se construye a partir de la ruta completa del elemento
      const uniqueId = [...path, element.name].join("_");

      const originallyInBase = findInBaseData(uniqueId);
      const selectionState = selectedElements[uniqueId];

      // Un elemento está seleccionado si está marcado explícitamente,
      // o si estaba en la base y no ha sido desmarcado explícitamente.
      const currentlySelected =
        selectionState === undefined ? originallyInBase : !!selectionState;

      // Se agrega si NO estaba en la base y AHORA está seleccionado
      if (!originallyInBase && currentlySelected) {
        allAdded.push({
          name: element.name,
          data: selectedElements[uniqueId] || element,
          uniqueId: uniqueId,
        });
      }
      // Se remueve si ESTABA en la base y AHORA está deseleccionado (false)
      else if (originallyInBase && selectionState === false) {
        allRemoved.push({
          name: element.name,
          data: element,
          uniqueId: uniqueId,
        });
      }

      // Llamada recursiva para los hijos
      if (element.children && element.children.length > 0) {
        element.children.forEach((child) => {
          checkElement(child, [...path, element.name]);
        });
      }
    };

    // Iniciar el recorrido desde las secciones principales
    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        checkElement(element, [sectionName]);
      });
    });

    // Clasificar los elementos agregados como manuales o automáticos
    const manualAdded = [];
    const automatedAdded = [];

    allAdded.forEach((item) => {
      if (manualSelections.has(item.uniqueId)) {
        manualAdded.push(item);
      } else {
        automatedAdded.push(item);
      }
    });

    setGlobalChanges({
      added: allAdded,
      removed: allRemoved,
      manual: manualAdded,
      automated: automatedAdded,
    });
  };

  const hasGlobalChanges = () => {
    return (
      globalChanges.manual.length > 0 ||
      globalChanges.automated.length > 0 ||
      globalChanges.removed.length > 0
    );
  };

  const hasChangesInBaseData = () => {
    if (!selectedSection) return false;

    return selectedSection.elements.some((element) => {
      const currentlySelected = isElementSelectedByUniqueId(element);
      const originallyInBase = isElementInBaseData(element);
      return currentlySelected !== originallyInBase;
    });
  };

  const getChangedElements = () => {
    if (!selectedSection) return { added: [], removed: [] };

    const added = [];
    const removed = [];

    selectedSection.elements.forEach((element) => {
      const currentlySelected = isElementSelectedByUniqueId(element);
      const originallyInBase = isElementInBaseData(element);

      if (!originallyInBase && currentlySelected) {
        const uniqueId = getElementUniqueId(element);
        let actualData = selectedElements[uniqueId];

        if (actualData) {
          added.push({
            name: element.name,
            data: actualData,
            uniqueId,
          });
        }
      } else if (originallyInBase && !currentlySelected) {
        // Solo marcar como removido si hay interacción del usuario
        const hasUserInteraction = Object.keys(selectedElements).length > 0;

        if (hasUserInteraction) {
          const uniqueId = getElementUniqueId(element);
          removed.push({ name: element.name, data: element, uniqueId });
        }
      }
    });

    return { added, removed };
  };

  const markAsManualSelection = (uniqueId) => {
    setManualSelections((prev) => new Set([...prev, uniqueId]));
  };

  const markAsAutomatedSelection = (uniqueIds) => {};

  useEffect(() => {
    updateGlobalChanges();
  }, [selectedElements, dataXSD, baseData, manualSelections]);

  return {
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
  };
};
