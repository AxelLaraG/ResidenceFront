import { useState } from "react";

export const useVerification = (
  selectedElements,
  setSelectedElements,
  getElementUniqueId,
  countElementChildren,
  countUnselectedChildren,
  markAsManualSelection,
  markAsAutomatedSelection,
  getDescendantIds
) => {
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [showDeselectVerification, setShowDeselectVerification] =
    useState(false);
  const [deselectVerificationData, setDeselectVerificationData] =
    useState(null);

  const handleCheckboxChange = (element, checked, elementData) => {
    const uniqueId = getElementUniqueId(element);

    if (checked) {
      if (element.children && element.children.length > 0) {
        const totalChildren = countElementChildren(element);
        const unselectedChildren = countUnselectedChildren(element);
        if (unselectedChildren > 0) {
          setVerificationData({
            element,
            elementData,
            totalChildren: unselectedChildren,
            allChildren: totalChildren,
          });
          setShowVerification(true);
          return;
        }
      }
      setSelectedElements((prev) => ({ ...prev, [uniqueId]: elementData }));
      markAsManualSelection(uniqueId);
      return;
    }

    if (!checked) {
      const uniqueId = getElementUniqueId(element);
      const parentPath = uniqueId.split("_").slice(0, -1);
      const descendantIds = getDescendantIds(element, parentPath);
      const selectedDescendants = descendantIds.filter(
        (id) => selectedElements[id]
      );

      if (selectedDescendants.length > 0) {
        setDeselectVerificationData({
          element,
          descendantIds: [uniqueId, ...selectedDescendants],
          count: selectedDescendants.length,
        });
        setShowDeselectVerification(true);
      } else {
        setSelectedElements((prev) => ({ ...prev, [uniqueId]: false }));
      }
    }
  };

  const handleDeselectAccept = () => {
    if (!deselectVerificationData) return;
    const { descendantIds } = deselectVerificationData;

    const updates = {};
    descendantIds.forEach((id) => {
      updates[id] = false;
    });

    setSelectedElements((prev) => ({ ...prev, ...updates }));
    setShowDeselectVerification(false);
    setDeselectVerificationData(null);
  };

  const handleDeselectCancel = () => {
    setShowDeselectVerification(false);
    setDeselectVerificationData(null);
  };

  const handleVerificationAccept = () => {
    if (!verificationData) return;

    const { element } = verificationData;
    const newSelectedElements = { ...selectedElements };
    const mainElementId = getElementUniqueId(element);

    newSelectedElements[mainElementId] = element;

    let elementsAdded = 1;

    markAsManualSelection(mainElementId);

    const automatedIds = [];

    const addUnselectedChildren = (
      parentElement,
      childrenArray = null,
      currentParentContext = null
    ) => {
      const children = childrenArray || parentElement.children;

      if (children && children.length > 0) {
        children.forEach((child) => {
          let parentContext = currentParentContext;
          if (!parentContext) {
            const mainElementId = getElementUniqueId(parentElement);
            parentContext = mainElementId.replace(`_${parentElement.name}`, "");
          }
          const childId = getElementUniqueId(
            child,
            `${parentContext}_${parentElement.name}`
          );

          if (!selectedElements[childId]) {
            newSelectedElements[childId] = child;
            elementsAdded++;
            automatedIds.push(childId);

            addUnselectedChildren(
              child,
              child.children,
              `${parentContext}_${parentElement.name}`
            );
          }
        });
      }
    };

    addUnselectedChildren(element);

    if (automatedIds.length > 0 && markAsAutomatedSelection) {
      markAsAutomatedSelection(automatedIds);
    }

    setSelectedElements(newSelectedElements);
    setShowVerification(false);
    setVerificationData(null);
  };

  const handleVerificationCancel = () => {
    if (!verificationData) return;

    const { element, elementData } = verificationData;
    const uniqueId = getElementUniqueId(element);

    const { children, ...elementWithoutChildren } = elementData;

    setSelectedElements((prev) => ({
      ...prev,
      [uniqueId]: elementWithoutChildren,
    }));

    if (markAsManualSelection) {
      markAsManualSelection(uniqueId);
    }

    setShowVerification(false);
    setVerificationData(null);
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    setVerificationData(null);
  };

  return {
    showVerification,
    verificationData,
    handleCheckboxChange,
    handleVerificationAccept,
    handleVerificationCancel,
    handleVerificationClose,
    showDeselectVerification,
    deselectVerificationData,
    handleDeselectAccept,
    handleDeselectCancel,
  };
};
