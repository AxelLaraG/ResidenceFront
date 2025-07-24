import { useState } from "react";

export const useVerification = (
  dataXSD,
  selectedElements,
  setSelectedElements,
  getElementUniqueId,
  countElementChildren,
  countUnselectedChildren,
  markAsManualSelection,
  markAsAutomatedSelection
) => {
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  // Manejar cambio de checkbox
  const handleCheckboxChange = (element, checked, elementData) => {
    if (checked && element.children && element.children.length > 0) {
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

    // Si no tiene hijos, está desmarcando, o todos los hijos ya están seleccionados, proceder normalmente
    const uniqueId = getElementUniqueId(element);
    setSelectedElements((prev) => ({
      ...prev,
      [uniqueId]: checked ? elementData : undefined,
    }));

    // Marcar como selección manual solo si está marcando
    if (checked) {
      markAsManualSelection(uniqueId);
    }
  };

  // Manejar aceptación de verificación
  const handleVerificationAccept = () => {
    if (!verificationData) return;

    const { element } = verificationData;
    const newSelectedElements = { ...selectedElements };
    const mainElementId = getElementUniqueId(element);

    newSelectedElements[mainElementId] = element;

    let elementsAdded = 1;

    // Marcar el elemento principal como manual
    markAsManualSelection(mainElementId);

    // Recopilar IDs de elementos automáticos
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

  // Manejar cancelación de verificación
  const handleVerificationCancel = () => {
    if (!verificationData) return;

    const { element, elementData } = verificationData;
    const uniqueId = getElementUniqueId(element);

    setSelectedElements((prev) => ({
      ...prev,
      [uniqueId]: elementData,
    }));

    // Marcar como selección manual
    if (markAsManualSelection) {
      markAsManualSelection([uniqueId]);
    }

    setShowVerification(false);
    setVerificationData(null);
  };

  // Manejar cierre de verificación
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
  };
};
