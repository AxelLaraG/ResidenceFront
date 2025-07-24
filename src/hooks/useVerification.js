import { useState } from 'react';

export const useVerification = (
  dataXSD,
  selectedElements,
  setSelectedElements,
  getElementUniqueId,
  countElementChildren,
  countUnselectedChildren,
  setLastActionMessage,
  selectedSection,
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
      
      console.log(`Elemento con hijos detectado: ${element.name}`);
      console.log(`  Total de hijos: ${totalChildren}`);
      console.log(`  Hijos no seleccionados: ${unselectedChildren}`);
      
      if (unselectedChildren > 0) {
        setVerificationData({
          element,
          elementData,
          totalChildren: unselectedChildren,
          allChildren: totalChildren
        });
        setShowVerification(true);
        return;
      } else {
        console.log(`Todos los hijos de ${element.name} ya están seleccionados. Agregando solo el elemento padre.`);
        setLastActionMessage(`✅ Elemento agregado: ${element.name} (todos sus hijos ya estaban seleccionados)`);
        setTimeout(() => setLastActionMessage(null), 5000);
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

    const { element, elementData } = verificationData;
    const newSelectedElements = { ...selectedElements };
    console.log(`Agregando elemento ${element.name} con los hijos faltantes`);

    const mainElementId = getElementUniqueId(element);
    newSelectedElements[mainElementId] = element;
    console.log(`  Agregado (principal): ${mainElementId}`);
    let elementsAdded = 1;
    
    // Marcar el elemento principal como manual
    markAsManualSelection(mainElementId);
    
    // Recopilar IDs de elementos automáticos
    const automatedIds = [];

    const addUnselectedChildren = (parentElement, childrenArray = null) => {
      const children = childrenArray || parentElement.children;
      
      if (children && children.length > 0) {
        children.forEach(child => {
          let childIsAlreadySelected = false;
          let childId;
          
          let foundInSection = null;
          let foundAsChild = null;
          
          Object.keys(dataXSD).forEach(sectionName => {
            dataXSD[sectionName].forEach(sectionElement => {
              if (sectionElement.name === child.name) {
                foundInSection = sectionName;
                childId = `${foundInSection}_${child.name}`;
                if (selectedElements[childId] !== undefined) {
                  childIsAlreadySelected = true;
                }
              }
              
              const findChildRecursively = (elem, targetName, path = []) => {
                if (elem.children) {
                  elem.children.forEach(childElem => {
                    if (childElem.name === targetName && !foundAsChild) {
                      foundAsChild = {
                        section: sectionName,
                        parentElement: elem.name,
                        path: [...path, elem.name]
                      };
                      const tempChildId = `${foundAsChild.section}_${foundAsChild.parentElement}_${child.name}`;
                      if (selectedElements[tempChildId] !== undefined) {
                        childIsAlreadySelected = true;
                        childId = tempChildId;
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
          
          if (!childIsAlreadySelected) {
            if (foundInSection) {
              childId = `${foundInSection}_${child.name}`;
            } else if (foundAsChild) {
              childId = `${foundAsChild.section}_${foundAsChild.parentElement}_${child.name}`;
            } else {
              // Fallback: usar la estructura actual
              let baseContext = "";
              if (selectedSection && !selectedSection.parentInfo) {
                baseContext = selectedSection.groupName;
              } else if (selectedSection && selectedSection.parentInfo) {
                baseContext = `${selectedSection.parentInfo.section}_${selectedSection.parentInfo.element}`;
              }
              childId = `${baseContext}_${element.name}_${child.name}`;
            }
            
            newSelectedElements[childId] = child;
            console.log(`  Agregado (hijo): ${childId}`);
            elementsAdded++;
            
            // Agregar a la lista de elementos automáticos
            automatedIds.push(childId);
          } else {
            console.log(`  Omitido (ya seleccionado): ${child.name} con ID ${childId}`);
          }
          
          if (!childIsAlreadySelected) {
            addUnselectedChildren(child);
          }
        });
      }
    };

    addUnselectedChildren(element);
    
    // Marcar las selecciones automáticas
    if (automatedIds.length > 0 && markAsAutomatedSelection) {
      markAsAutomatedSelection(automatedIds);
    }
    
    setLastActionMessage(`✅ Se agregaron ${elementsAdded} elementos (${element.name} + ${elementsAdded - 1} hijos faltantes)`);
    setTimeout(() => setLastActionMessage(null), 5000);
    
    setSelectedElements(newSelectedElements);
    setShowVerification(false);
    setVerificationData(null);
  };

  // Manejar cancelación de verificación
  const handleVerificationCancel = () => {
    if (!verificationData) return;

    const { element, elementData } = verificationData;
    const uniqueId = getElementUniqueId(element);
    console.log(`Agregando solo el elemento: ${element.name} (${uniqueId})`);
    setSelectedElements((prev) => ({
      ...prev,
      [uniqueId]: elementData,
    }));
    
    // Marcar como selección manual
    if (markAsManualSelection) {
      markAsManualSelection([uniqueId]);
    }
    
    setLastActionMessage(`✅ Se agregó solo el elemento: ${element.name}`);
    setTimeout(() => setLastActionMessage(null), 5000);
    
    setShowVerification(false);
    setVerificationData(null);
  };

  // Manejar cierre de verificación
  const handleVerificationClose = () => {
    console.log('Verificación cancelada - no se agregó ningún elemento');
    setLastActionMessage(`❌ Operación cancelada - no se agregó ningún elemento`);
    setTimeout(() => setLastActionMessage(null), 3000);
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
