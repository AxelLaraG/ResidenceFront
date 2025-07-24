import { useState, useEffect } from "react";

export const useElementSelection = (dataXSD, baseData, selectedSection) => {
  const [selectedElements, setSelectedElements] = useState({});
  const [globalChanges, setGlobalChanges] = useState({
    added: [],
    removed: [],
    automated: [], // Nuevos elementos agregados automáticamente
    manual: [], // Elementos agregados manualmente
  });
  const [manualSelections, setManualSelections] = useState(new Set()); // Track de selecciones manuales

  // Función para generar ID único de elemento
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

        return baseUniqueId === elementUniqueId;
      })
    );
  };

  // Verificar si un elemento está seleccionado por ID único
  const isElementSelectedByUniqueId = (element) => {
    const uniqueId = getElementUniqueId(element);

    if (selectedElements[uniqueId] !== undefined) {
      return true;
    }

    return false;
  };

  // Contar elementos hijos totales
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

  // Contar elementos hijos no seleccionados
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

  // Actualizar cambios globales
  const updateGlobalChanges = () => {
    if (!dataXSD) return;

    const allAdded = [];
    const allRemoved = [];

    // Función para generar todos los posibles IDs de un elemento
    const getAllPossibleIds = (
      element,
      sectionName,
      parentElementName = null
    ) => {
      const possibleIds = [];

      // ID como elemento principal de sección
      possibleIds.push(`${sectionName}_${element.name}`);

      // ID como subcampo si tiene padre
      if (parentElementName) {
        possibleIds.push(`${sectionName}_${parentElementName}_${element.name}`);
      }

      return possibleIds;
    };

    // Función para verificar si un elemento está seleccionado con cualquier ID posible
    const isElementSelectedWithAnyId = (
      element,
      sectionName,
      parentElementName = null
    ) => {
      const possibleIds = getAllPossibleIds(
        element,
        sectionName,
        parentElementName
      );

      for (const id of possibleIds) {
        if (selectedElements[id] !== undefined) {
          return {
            isSelected: true,
            selectedId: id,
            data: selectedElements[id],
          };
        }
      }

      return { isSelected: false, selectedId: null, data: null };
    };

    // Función recursiva para revisar elementos
    const checkElement = (element, sectionName, parentElementName = null) => {
      const { isSelected, selectedId, data } = isElementSelectedWithAnyId(
        element,
        sectionName,
        parentElementName
      );
      const originallyInBase = isElementInBaseData(element);

      if (!originallyInBase && isSelected) {
        allAdded.push({
          name: element.name,
          data: data,
          uniqueId: selectedId,
        });
      } else if (originallyInBase && !isSelected) {
        // Para elementos removidos, usar el ID que tendría en su sección natural
        const naturalId = `${sectionName}_${element.name}`;
        allRemoved.push({
          name: element.name,
          data: element,
          uniqueId: naturalId,
        });
      }

      // Revisar también los children del elemento
      if (element.children && element.children.length > 0) {
        element.children.forEach((child) => {
          checkElement(child, sectionName, element.name);
        });
      }
    };

    // Recorrer todas las secciones y elementos
    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        checkElement(element, sectionName);
      });
    });

    // Separar entre manuales y automáticos
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

  // Verificar si hay cambios globales
  const hasGlobalChanges = () => {
    return (
      globalChanges.manual.length > 0 || globalChanges.automated.length > 0
    );
  };

  // Verificar si hay cambios en la sección actual
  const hasChangesInBaseData = () => {
    if (!selectedSection) return false;

    return selectedSection.elements.some((element) => {
      const currentlySelected = isElementSelectedByUniqueId(element);
      const originallyInBase = isElementInBaseData(element);
      return currentlySelected !== originallyInBase;
    });
  };

  // Obtener elementos que han cambiado en la sección actual
  const getChangedElements = () => {
    if (!selectedSection) return { added: [], removed: [] };

    const added = [];
    const removed = [];

    selectedSection.elements.forEach((element) => {
      const currentlySelected = isElementSelectedByUniqueId(element);
      const originallyInBase = isElementInBaseData(element);

      if (!originallyInBase && currentlySelected) {
        // Buscar el ID real con el que está seleccionado
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
        const uniqueId = getElementUniqueId(element);
        removed.push({ name: element.name, data: element, uniqueId });
      }
    });

    return { added, removed };
  };

  // Función para marcar una selección como manual
  const markAsManualSelection = (uniqueId) => {
    setManualSelections((prev) => new Set([...prev, uniqueId]));
  };

  // Función para marcar múltiples selecciones como automáticas (cuando se agregan hijos)
  const markAsAutomatedSelection = (uniqueIds) => {
    // Los IDs automáticos no se agregan a manualSelections
    // Se distinguen por exclusión
  };

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
