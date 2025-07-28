import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button/Button";

const TreeNode = ({ node, path, onNodeSelect, selectedPath, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  // Filtrar solo los hijos que tienen más hijos
  const childrenWithChildren = hasChildren 
    ? node.children.filter(child => child.children && child.children.length > 0)
    : [];

  const currentPathStr = path.join("_");
  const isSelected = selectedPath === currentPathStr;

  const handleClick = () => {
    onNodeSelect(node, path);
    if (childrenWithChildren.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  // Solo renderizar si el nodo tiene hijos
  if (!hasChildren) {
    return null;
  }

  return (
    <div className="py-1">
      <div
        className={`relative ${
          isSelected
            ? "bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg"
            : ""
        }`}
      >
        <Button text={node.name} onClick={handleClick} />
      </div>

      {isExpanded && childrenWithChildren.length > 0 && (
        <div className="mt-1">
          {childrenWithChildren.map((childNode) => (
            <TreeNode
              key={childNode.name}
              node={childNode}
              path={[...path, childNode.name]}
              onNodeSelect={onNodeSelect}
              selectedPath={selectedPath}
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SideMenu = ({ dataXSD, onNodeSelect, selectedSection }) => {
  if (!dataXSD) {
    return <p className="p-4 text-gray-500">Cargando elementos...</p>;
  }

  const selectedPath = selectedSection?.fullPath?.join("_") || "";

  // Filtrar solo las secciones que tienen hijos
  const sectionsWithChildren = Object.keys(dataXSD).filter(sectionName => {
    const section = dataXSD[sectionName];
    return section && section.length > 0;
  });

  return (
    <div className="w-95 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Estructura del XSD
        </h2>
        <div className="space-y-2">
          {sectionsWithChildren.map((sectionName) => (
            <TreeNode
              key={sectionName}
              node={{ name: sectionName, children: dataXSD[sectionName], hasComplexType: true }}
              path={[sectionName]}
              onNodeSelect={onNodeSelect}
              selectedPath={selectedPath}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;