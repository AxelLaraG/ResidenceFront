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
        institutionData = result; 
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
        if (typeof node === "object" && node !== null) {
          if (Array.isArray(node)) {
            return node.map(getNodeValue).flat();
          }
          if (node["#text"]) {
            return node["#text"];
          }
        }
        return node;
      };

      const findValueByUniqueId = (obj, targetUniqueId) => {
        const parts = targetUniqueId.split("_"); 
        let current = obj;

        for (const part of parts) {
          if (current === undefined || current === null) return undefined;

          const isAttribute = part.startsWith("@");
          const attributeName = isAttribute ? part.substring(1) : null;

          if (Array.isArray(current)) {
            if (isAttribute) {
              current = current
                .map((item) => item["@attributes"]?.[attributeName])
                .filter((v) => v !== undefined);
            } else {
              current = current
                .map((item) => item[part])
                .filter((v) => v !== undefined);
            }
            if (current.length === 0) current = undefined;
          } else {
            if (isAttribute) {
              current = current["@attributes"]?.[attributeName];
            } else {
              current = current[part];
            }
          }
        }
        return getNodeValue(current);
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

                const userValue = String(value || "").trim();

                if (institutionValueOrValues !== undefined) {
                  const institutionValues = Array.isArray(
                    institutionValueOrValues
                  )
                    ? institutionValueOrValues.map((v) =>
                        String(v || "").trim()
                      )
                    : [String(institutionValueOrValues || "").trim()];

                  newSyncStatus[uniqueIdWithIndex] = institutionValues.includes(
                    userValue
                  )
                    ? "synced"
                    : "out_of_sync";
                } else {
                  newSyncStatus[uniqueIdWithIndex] =
                    userValue === "" ? "synced" : "out_of_sync";
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
