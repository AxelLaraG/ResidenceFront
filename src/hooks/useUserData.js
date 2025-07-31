import { useState, useEffect, useCallback } from "react";
import {
  fetchUserXML,
  validateXML,
  xsdToJson,
  updateSharingAPI,
  fetchInstitutionXML,
} from "@/services/Functions";
import xml2js from "xml2js";

export const useUserData = (user, selectedInstitution) => {
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});

  const loadAllData = useCallback(async () => {
    if (!user || !selectedInstitution) return;

    try {
      setLoading(true);
      setError(null);

      const [baseConfig, xmlText, mappings, institutionXmlText] =
        await Promise.all([
          xsdToJson("base"),
          fetchUserXML(user.name),
          xsdToJson("mapa"),
          fetchInstitutionXML(selectedInstitution, user.name),
        ]);

      const formData = new FormData();
      const xmlBlob = new Blob([xmlText], { type: "text/xml" });
      formData.append("documento_xml", xmlBlob, `${user.name}.xml`);
      const validationResult = await validateXML(formData);

      let institutionData = {};
      if (institutionXmlText) {
        const parser = new xml2js.Parser({
          explicitArray: false,
          trim: true,
          charkey: "#text",
          attrkey: "@attributes",
        });
        const result = await parser.parseStringPromise(institutionXmlText);
        const rootKey = Object.keys(result)[0];
        institutionData = result[rootKey];
      }

      const processedData = {};
      const newSyncStatus = {};
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

      const getNodeValue = (node) => {
        if (typeof node === "object" && node !== null && node["#text"]) {
          return node["#text"];
        }
        return node;
      };

      const findValueByUniqueId = (obj, targetUniqueId) => {
        const parts = targetUniqueId.split("_").slice(1);
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (
            current &&
            typeof current === "object" &&
            current[part] !== undefined
          ) {
            current = current[part];
          } else {
            return undefined;
          }
        }

        const lastPart = parts[parts.length - 1];
        if (Array.isArray(current)) {
          return current
            .map((item) => {
              if (lastPart.startsWith("@")) {
                const attributeName = lastPart.substring(1);
                return item["@attributes"]?.[attributeName];
              }
              return item[lastPart];
            })
            .filter((v) => v !== undefined);
        } else if (
          current &&
          typeof current === "object" &&
          current[lastPart] !== undefined
        ) {
          return current[lastPart];
        }

        return undefined;
      };

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

          let value = getNodeValue(node[key]);
          let isLeafNode = typeof value !== "object" || value === null;

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

              const targetUniqueId =
                mappings[selectedInstitution]?.[genericUniqueId];

              if (targetUniqueId) {
                const institutionValueOrValues = findValueByUniqueId(
                  institutionData,
                  targetUniqueId
                );

                if (institutionValueOrValues !== undefined) {
                  const userValue = String(value || "").trim();

                  if (Array.isArray(institutionValueOrValues)) {
                    const institutionValues = institutionValueOrValues.map(
                      (v) => String(getNodeValue(v) || "").trim()
                    );
                    newSyncStatus[uniqueIdWithIndex] =
                      institutionValues.includes(userValue)
                        ? "synced"
                        : "out_of_sync";
                  } else {
                    const institutionValue = String(
                      getNodeValue(institutionValueOrValues) || ""
                    ).trim();
                    newSyncStatus[uniqueIdWithIndex] =
                      userValue === institutionValue ? "synced" : "out_of_sync";
                  }
                } else {
                  newSyncStatus[uniqueIdWithIndex] = "not_mapped";
                }
              } else {
                newSyncStatus[uniqueIdWithIndex] = "not_mapped";
              }
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
      setSyncStatus(newSyncStatus);
    } catch (e) {
      console.error("Error detallado en useUserData:", e);
      setError("Error al cargar los datos: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [user, selectedInstitution]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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

  return {
    displayData,
    loading,
    error,
    updateSharing,
    syncStatus,
    refreshData: loadAllData,
  };
};
