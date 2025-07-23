import { useState, useEffect } from 'react';

export const useElementSelection = (dataXSD, baseData, selectedSection) => {
  const [selectedElements, setSelectedElements] = useState({});
  const [globalChanges, setGlobalChanges] = useState({
    added: [],
    removed: [],
  });

  // Función para generar ID único de elemento
  const getElementUniqueId = (element, parentContext = null) => {
    if (parentContext) {
      return `${parentContext}_${element.name}`;
    }

    if (selectedSection && !selectedSection.parentInfo) {
      return `${selectedSection.groupName}_${element.name}`;
    }

    if (selectedSection && selectedSection.parentInfo) {
      return `${selectedSection.parentInfo.section}_${selectedSection.parentInfo.element}_${element.name}`;
    }

    return element.name;
  };

  // Verificar si un elemento está en la base de datos
  const isElementInBaseData = (elementName) => {
    if (!baseData) return false;
    return Object.values(baseData).some((section) =>
      section.some((element) => element.name === elementName)
    );
  };

  // Verificar si un elemento está seleccionado por ID único
  const isElementSelectedByUniqueId = (element) => {
    const uniqueId = getElementUniqueId(element);
    
    if (selectedElements[uniqueId] !== undefined) {
      return true;
    }
    
    // Fallback: buscar en todas las claves
    const elementName = element.name;
    const foundKeys = Object.keys(selectedElements).filter(key => 
      key.endsWith(`_${elementName}`) && selectedElements[key]
    );
    
    if (foundKeys.length > 0) {
      console.log(`Elemento ${elementName} encontrado con ID alternativo: ${foundKeys[0]} (buscado como: ${uniqueId})`);
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
    element.children.forEach(child => {
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
    
    element.children.forEach(child => {
      let childIsSelected = false;
      
      Object.keys(dataXSD).forEach(sectionName => {
        dataXSD[sectionName].forEach(sectionElement => {
          if (sectionElement.name === child.name) {
            const childId = `${sectionName}_${child.name}`;
            if (selectedElements[childId] !== undefined) {
              childIsSelected = true;
            }
          }
          
          const findChildRecursively = (elem, targetName, path = []) => {
            if (elem.children) {
              elem.children.forEach(childElem => {
                if (childElem.name === targetName && !childIsSelected) {
                  const childId = `${sectionName}_${elem.name}_${targetName}`;
                  if (selectedElements[childId] !== undefined) {
                    childIsSelected = true;
                  }
                } else {
                  findChildRecursively(childElem, targetName, [...path, elem.name]);
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

    const checkElement = (element, parentContext = null) => {
      const uniqueId = getElementUniqueId(element, parentContext);
      const currentlySelected = selectedElements[uniqueId] !== undefined;
      const originallyInBase = isElementInBaseData(element.name);

      if (!originallyInBase && currentlySelected) {
        allAdded.push({
          name: element.name,
          data: selectedElements[uniqueId],
          uniqueId,
        });
      } else if (originallyInBase && !currentlySelected) {
        allRemoved.push({ name: element.name, data: element, uniqueId });
      }

      if (element.children && element.children.length > 0) {
        element.children.forEach((child) => {
          const childContext = parentContext
            ? `${parentContext}_${element.name}`
            : element.name;
          checkElement(child, childContext);
        });
      }
    };

    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        checkElement(element, sectionName);
      });
    });

    setGlobalChanges({ added: allAdded, removed: allRemoved });
  };

  // Verificar si hay cambios globales
  const hasGlobalChanges = () => {
    return globalChanges.added.length > 0 || globalChanges.removed.length > 0;
  };

  // Verificar si hay cambios en la sección actual
  const hasChangesInBaseData = () => {
    if (!selectedSection) return false;

    return selectedSection.elements.some((element) => {
      const currentlySelected = isElementSelectedByUniqueId(element);
      const originallyInBase = isElementInBaseData(element.name);
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
      const originallyInBase = isElementInBaseData(element.name);
      const uniqueId = getElementUniqueId(element);

      if (!originallyInBase && currentlySelected) {
        added.push({
          name: element.name,
          data: selectedElements[uniqueId],
          uniqueId,
        });
      } else if (originallyInBase && !currentlySelected) {
        removed.push({ name: element.name, data: element, uniqueId });
      }
    });

    return { added, removed };
  };

  useEffect(() => {
    updateGlobalChanges();
  }, [selectedElements, dataXSD, baseData]);

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
  };
};
