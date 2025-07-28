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

    if (selectedSection?.fullPath) {
      const basePath = selectedSection.fullPath.join("_");
      return `${basePath}_${element.name}`;
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
    if (!dataXSD || !baseData) {
      setGlobalChanges({ added: [], removed: [], manual: [], automated: [] });
      return;
    }

    const allAdded = [];
    const allRemoved = [];

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

    const checkElement = (element, path) => {
      const uniqueId = [...path, element.name].join("_");

      const originallyInBase = findInBaseData(uniqueId);
      const selectionState = selectedElements[uniqueId];

      const currentlySelected =
        selectionState === undefined ? originallyInBase : !!selectionState;

      if (!originallyInBase && currentlySelected) {
        allAdded.push({
          name: element.name,
          data: selectedElements[uniqueId] || element,
          uniqueId: uniqueId,
        });
      } else if (originallyInBase && selectionState === false) {
        allRemoved.push({
          name: element.name,
          data: element,
          uniqueId: uniqueId,
        });
      }

      if (element.children && element.children.length > 0) {
        element.children.forEach((child) => {
          checkElement(child, [...path, element.name]);
        });
      }
    };

    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        checkElement(element, [sectionName]);
      });
    });

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

  const getDescendantIds = (element, parentPath) => {
    let ids = [];
    if (!element.children || element.children.length === 0) {
      return [];
    }

    element.children.forEach((child) => {
      const childId = [...parentPath, element.name, child.name].join("_");
      ids.push(childId);

      const childParentPath = [...parentPath, element.name];
      ids = ids.concat(getDescendantIds(child, childParentPath));
    });

    return ids;
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
    getDescendantIds,
  };
};
