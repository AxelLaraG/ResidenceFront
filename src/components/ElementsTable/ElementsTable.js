import Checkbox from "@/components/ui/CheckBox/CheckBox";

const ElementsTable = ({
  elements,
  user,
  isElementSelectedByUniqueId,
  isElementInBaseData,
  getElementUniqueId,
  handleCheckboxChange,
  onParentRowClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Min Occurs
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Max Occurs
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Especial
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Atributos
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Compartido con {user?.institution}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {elements.map((element, i) => {
            const hasChildren = element.children && element.children.length > 0;
            const currentlySelected = isElementSelectedByUniqueId(element);
            const originallyInBase = isElementInBaseData(element);
            const hasChanged = currentlySelected !== originallyInBase;
            const elementUniqueId = getElementUniqueId(element);

            return (
              <tr
                key={i}
                onClick={
                  hasChildren ? () => onParentRowClick(element) : undefined
                }
                className={`
                  ${
                    hasChildren
                      ? "cursor-pointer bg-gray-50 hover:bg-indigo-50"
                      : "hover:bg-gray-50"
                  }
                  ${
                    hasChanged && !hasChildren
                      ? "bg-yellow-50 border-l-4 border-yellow-400"
                      : ""
                  }
                `}
              >
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {hasChildren ? "📁" : ""}
                    <div>
                      <div>{element.name}</div>
                    </div>
                    {hasChanged && !hasChildren && (
                      <span className="text-yellow-600 text-xs">
                        {currentlySelected ? "(+)" : "(-)"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      (element.type || element.baseType)?.endsWith("Type")
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {element.type || element.baseType || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      element.minOccurs === "0"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {element.minOccurs}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      element.maxOccurs === "unbounded"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {element.maxOccurs}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <div className="flex gap-1">
                    {element.isSimpleContent && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        SimpleContent
                      </span>
                    )}
                    {element.hasComplexType && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        ComplexType
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm">
                  {element.attributes && element.attributes.length > 0 ? (
                    <div className="space-y-1">
                      {element.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="text-xs">
                          <span className="font-medium text-blue-600">
                            {attr.name}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({attr.type})
                          </span>
                          <span
                            className={`ml-1 px-1 py-0.5 rounded ${
                              attr.use === "required"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {attr.use}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm ">
                  <div className="flex justify-center">
                    {!hasChildren ? (
                      <Checkbox
                        id={`checkbox-${elementUniqueId}-${i}`}
                        checked={currentlySelected}
                        onChange={(e) => {
                          handleCheckboxChange(
                            element,
                            e.target.checked,
                            element
                          );
                        }}
                      />
                    ) : (
                      <span className="text-indigo-600 text-xs font-semibold">
                        Navegar...
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ElementsTable;
