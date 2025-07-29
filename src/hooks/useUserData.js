import { useState, useEffect } from "react";
import {
  fetchUserXML,
  validateXML,
  xsdToJson,
  updateSharingAPI,
} from "@/services/Functions";

export const useUserData = (user) => {
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseConfig = await xsdToJson("base");
        const username = user.email.split("@")[0];
        const xmlText = await fetchUserXML(username);
        const formData = new FormData();
        const xmlBlob = new Blob([xmlText], { type: "text/xml" });
        formData.append("documento_xml", xmlBlob, `${username}.xml`);
        const validationResult = await validateXML(formData);

        const processedData = {};
        const allInstitutionsSet = new Set();
        const baseMap = new Map();

        Object.values(baseConfig).forEach((section) => {
          section.forEach((element) => {
            const institutions = element.context.institution || [];
            institutions.forEach((inst) => allInstitutionsSet.add(inst));
            baseMap.set(element.context.uniqueId, institutions);
          });
        });

        const allInstitutions = Array.from(allInstitutionsSet).sort();
        
        const processNode = (node, path) => {
          if (Array.isArray(node)) {
            node.forEach((item, index) => processNode(item, [...path, index]));
            return;
          }

          if (typeof node !== "object" || node === null) return;

          for (const key in node) {
            if (key === "@attributes") continue;

            const currentPath = [...path, key];
            const uniqueIdWithIndex = currentPath.join("_");
            const genericUniqueId = currentPath
              .filter((p) => isNaN(parseInt(p, 10)))
              .join("_");
            let value = node[key];

            let isLeafNode = false;

            if (typeof value === "object" && value !== null && value["#text"]) {
              const otherKeys = Object.keys(value).filter(
                (k) => k !== "#text" && k !== "@attributes"
              );
              if (otherKeys.length === 0) {
                value = value["#text"];
              }
            }

            if (typeof value !== "object" || value === null) {
              isLeafNode = true;
            }

            if (isLeafNode && baseMap.has(genericUniqueId)) {
              const sectionName = currentPath[1];
              if (!processedData[sectionName]) {
                processedData[sectionName] = [];
              }

              if (
                !processedData[sectionName].some(
                  (el) => el.uniqueId === uniqueIdWithIndex
                )
              ) {
                processedData[sectionName].push({
                  uniqueId: uniqueIdWithIndex,
                  label: key,
                  value: value,
                  sharedWith: baseMap.get(genericUniqueId),
                  allInstitutions,
                });
              }
            }

            if (typeof node[key] === "object" && node[key] !== null) {
              processNode(node[key], currentPath);
            }
          }
        };

        const rootKey = Object.keys(validationResult.data)[0];
        processNode(validationResult.data[rootKey], [rootKey]);
        setDisplayData(processedData);
      } catch (e) {
        setError("Error al cargar los datos: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user]);

  const updateSharing = async (uniqueId, newInstitutions) => {
    try {
      await updateSharingAPI(uniqueId, newInstitutions);

      setDisplayData((prevData) => {
        const newData = JSON.parse(JSON.stringify(prevData));
        for (const section in newData) {
          const item = newData[section].find((i) => i.uniqueId === uniqueId);
          if (item) {
            item.sharedWith = newInstitutions;
            break;
          }
        }
        return newData;
      });
    } catch (err) {
      console.error("Error al actualizar los permisos:", err);
      setError("No se pudieron guardar los cambios. Inténtalo de nuevo.");
    }
  };

  return { displayData, loading, error, updateSharing };
};
