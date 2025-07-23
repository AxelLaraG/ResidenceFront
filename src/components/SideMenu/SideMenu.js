import Button from "@/components/ui/Button/Button";

const SideMenu = ({ 
  dataXSD, 
  selectedSection, 
  hasGlobalChanges, 
  globalChanges,
  onSectionSelection, 
  onChildrenSelection 
}) => {
  const getElementsWithChildren = () => {
    if (!dataXSD) return [];

    const elementsWithChildren = [];
    const addedElementNames = new Set();

    const exploreElement = (element, parentPath = []) => {
      if (
        element.children &&
        element.children.length > 0 &&
        !addedElementNames.has(element.name)
      ) {
        elementsWithChildren.push({
          parentSection:
            parentPath.length > 0 ? parentPath.join(" → ") : "Raíz",
          elementName: element.name,
          children: element.children,
          element: element,
          depth: parentPath.length,
          fullPath: [...parentPath, element.name],
        });

        addedElementNames.add(element.name);

        element.children.forEach((child) => {
          exploreElement(child, [...parentPath, element.name]);
        });
      }
    };

    Object.keys(dataXSD).forEach((sectionName) => {
      dataXSD[sectionName].forEach((element) => {
        exploreElement(element, [sectionName]);
      });
    });
    return elementsWithChildren;
  };

  return (
    <div className="w-95 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Estructura del XSD
          </h2>
          {hasGlobalChanges() && (
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {globalChanges.added.length + globalChanges.removed.length}{" "}
              cambios
            </div>
          )}
        </div>

        {!dataXSD ? (
          <p className="text-gray-500">Cargando elementos...</p>
        ) : (
          <div className="space-y-4">
            {/* Secciones principales */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Secciones Principales
              </h3>
              <div className="space-y-2">
                {Object.keys(dataXSD).map((sectionName, index) => (
                  <div key={`section-${index}`} className="relative">
                    <div
                      className={`${
                        selectedSection?.groupName === sectionName
                          ? "bg-indigo-50 border-l-4 border-indigo-500 pl-2 rounded-r-lg"
                          : ""
                      }`}
                    >
                      <Button
                        text={sectionName}
                        onClick={() => onSectionSelection(sectionName)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elementos con subcampos */}
            {getElementsWithChildren().length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Elementos con Subcampos
                </h3>
                <div className="space-y-2">
                  {getElementsWithChildren().map(
                    (elementWithChildren, index) => (
                      <div key={`element-${index}`} className="relative">
                        <div
                          className={`${
                            selectedSection?.parentInfo?.element ===
                            elementWithChildren.elementName
                              ? "bg-green-50 border-l-4 border-green-500 pl-2 rounded-r-lg"
                              : ""
                          }`}
                        >
                          <Button
                            text={`${elementWithChildren.elementName}`}
                            onClick={() => onChildrenSelection(elementWithChildren)}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu;
