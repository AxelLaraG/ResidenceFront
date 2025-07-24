"use client";

import { useState } from "react";

// Componente TreeNode
const TreeNode = ({ element, level = 0, onNodeClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = element.children && element.children.length > 0;

  return (
    <div className="tree-node" style={{ marginLeft: `${level * 20}px` }}>
      <div 
        className="node-content flex items-center py-1 hover:bg-gray-100 cursor-pointer"
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
          onNodeClick(element);
        }}
      >
        {hasChildren && (
          <span className="mr-2 text-gray-500">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="mr-4"></span>}
        
        <div className="flex items-center">
          <span className="font-medium text-gray-800">{element.name}</span>
          
          {element.isSimpleContent && (
            <span className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
              SC
            </span>
          )}
          
          {element.hasComplexType && (
            <span className="ml-1 px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
              CT
            </span>
          )}
          
          {element.attributes && element.attributes.length > 0 && (
            <span className="ml-1 px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
              {element.attributes.length} attr
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="children">
          {element.children.map((child, index) => (
            <TreeNode 
              key={index} 
              element={child} 
              level={level + 1} 
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal del árbol
const TreeView = ({ data, selectedSection, isOpen, onClose }) => {
  const handleNodeClick = (element) => {
    
    // Aquí puedes manejar la selección del elemento
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Diagrama de Árbol - {selectedSection?.groupName || 'Sin selección'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!selectedSection ? (
            <div className="text-center py-8 text-gray-500">
              Selecciona una sección para ver el diagrama de árbol
            </div>
          ) : (
            <div className="tree-container">
              {selectedSection.elements.map((element, index) => (
                <TreeNode 
                  key={index} 
                  element={element} 
                  onNodeClick={handleNodeClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeView;