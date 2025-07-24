import { useState, useEffect } from "react";

export const useElementSelection = (dataXSD, baseData, selectedSection, userInstitute) => {
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

        return baseUniqueId === elementUniqueId && baseElement.context?.institution?.includes(userInstitute);
      })
    );
  };

  const isElementSelectedByUniqueId = (element) => {
    const uniqueId = getElementUniqueId(element);

    if (selectedElements[uniqueId] !== undefined) {
      return true;
    }

    return false;
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
    if (!dataXSD) return;

    const allAdded = [];
    const allRemoved = [];

    const getAllPossibleIds = (
      element,
      sectionName,
      parentElementName = null
    ) => {
      const possibleIds = [];

      possibleIds.push(`${sectionName}_${element.name}`);

      if (parentElementName) {
        possibleIds.push(`${sectionName}_${parentElementName}_${element.name}`);
      }

      return possibleIds;
    };

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
        const naturalId = `${sectionName}_${element.name}`;
        allRemoved.push({
          name: element.name,
          data: element,
          uniqueId: naturalId,
        });
      }

      if (element.children && element.children.length > 0) {
        element.children.forEach((child) => {
          checkElement(child, sectionName, element.name);
        });
      }
    };

    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        checkElement(element, sectionName);
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
      globalChanges.manual.length > 0 || globalChanges.automated.length > 0
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
        const uniqueId = getElementUniqueId(element);
        removed.push({ name: element.name, data: element, uniqueId });
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
