import { useState, useEffect } from "react";
import { City, Warehouse, TariffType } from "@shared/api";
import { useI18n } from "./useI18n";

export function useWarehouseCheck() {
  const { t, formatMessage, language } = useI18n();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [lockers, setLockers] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch warehouses and lockers on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch warehouses
        const warehousesResponse = await fetch("/api/warehouses");
        if (warehousesResponse.ok) {
          const warehousesData = await warehousesResponse.json();
          const warehousesList =
            warehousesData.data?.list || warehousesData.data || [];
          console.log("🏭 WAREHOUSE DATA DEBUG:");
          console.log("Raw warehouse data:", warehousesData);
          console.log(
            "Warehouse cities:",
            warehousesList.map((w) => ({
              id: w.id,
              name: w.name,
              city: w.city,
            })),
          );
          console.log(
            "Looking for Andijan in:",
            warehousesList.map((w) => w.city),
          );
          setWarehouses(warehousesList);
        } else {
          console.error(
            "Failed to fetch warehouses:",
            warehousesResponse.status,
          );
        }

        // Fetch lockers
        const lockersResponse = await fetch("/api/lockers");
        if (lockersResponse.ok) {
          const lockersData = await lockersResponse.json();
          const lockersList = lockersData.data?.list || lockersData.data || [];
          console.log("🏪 LOCKER DATA DEBUG:");
          console.log("Raw locker data:", lockersData);
          console.log(
            "Locker cities:",
            lockersList.map((l) => ({ id: l.id, name: l.name, city: l.city })),
          );
          setLockers(lockersList);
        } else {
          console.error("Failed to fetch lockers:", lockersResponse.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load warehouse and locker data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Normalize city names for better matching
  const normalizeCityName = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Zа-яёўқғҳ\s]/g, "") // Remove special characters but keep letters and spaces
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(
        /(город|city|shahri|tumani|viloyati|oblast|region|район|district)/gi,
        "",
      ) // Remove common city suffixes including район/district
      .replace(/(ский|нский|ская|нская|ское|нское)/gi, "") // Remove Russian adjective endings
      .trim();
  };

  // Check if a city has a warehouse
  const hasWarehouse = (cityName: string | null): boolean => {
    if (!cityName || warehouses.length === 0) {
      console.log(
        `❌ No warehouse check possible for "${cityName}" - ${warehouses.length} warehouses available`,
      );
      return false;
    }

    console.log(`🔍 Checking warehouse for city: "${cityName}"`);

    // First, let's see all available warehouse cities for debugging
    const warehouseCities = warehouses.map((w) => w.city);
    console.log("📍 Available warehouse cities:", warehouseCities);

    // Step 1: Try exact match first (case-insensitive)
    const exactMatch = warehouses.find(
      (w) => w.city.toLowerCase() === cityName.toLowerCase(),
    );

    if (exactMatch) {
      console.log(
        `✅ EXACT MATCH FOUND: "${cityName}" === "${exactMatch.city}"`,
      );
      console.log(`   Warehouse: ${exactMatch.name}`);
      return true;
    }

    // Step 2: Try normalized matching for flexibility
    const normalizedSearchCity = normalizeCityName(cityName);
    console.log(`🔍 Normalized search: "${normalizedSearchCity}"`);

    let found = false;
    let matchedWarehouse = null;

    for (const warehouse of warehouses) {
      const normalizedWarehouseCity = normalizeCityName(warehouse.city);

      // Try exact match first
      if (normalizedWarehouseCity === normalizedSearchCity) {
        found = true;
        matchedWarehouse = warehouse;
        console.log(
          `✅ EXACT MATCH: "${normalizedSearchCity}" === "${normalizedWarehouseCity}"`,
        );
        break;
      }

      // Try if one contains the other
      if (normalizedWarehouseCity.includes(normalizedSearchCity)) {
        found = true;
        matchedWarehouse = warehouse;
        console.log(
          `✅ CONTAINS MATCH: "${normalizedWarehouseCity}" contains "${normalizedSearchCity}"`,
        );
        break;
      }

      if (normalizedSearchCity.includes(normalizedWarehouseCity)) {
        found = true;
        matchedWarehouse = warehouse;
        console.log(
          `✅ CONTAINED MATCH: "${normalizedSearchCity}" contains "${normalizedWarehouseCity}"`,
        );
        break;
      }

      // Try core word matching for compound names like "Андижан" vs "Andijon shahri"
      const searchWords = normalizedSearchCity
        .split(" ")
        .filter((w) => w.length > 2);
      const warehouseWords = normalizedWarehouseCity
        .split(" ")
        .filter((w) => w.length > 2);

      const wordMatch = searchWords.some((searchWord) =>
        warehouseWords.some((warehouseWord) => {
          if (searchWord === warehouseWord) return true;
          if (searchWord.length >= 4 && warehouseWord.length >= 4) {
            return (
              searchWord.includes(warehouseWord) ||
              warehouseWord.includes(searchWord)
            );
          }
          return false;
        }),
      );

      if (wordMatch) {
        found = true;
        matchedWarehouse = warehouse;
        console.log(
          `✅ WORD MATCH: Words from "${normalizedSearchCity}" match words in "${normalizedWarehouseCity}"`,
        );
        break;
      }
    }

    if (found && matchedWarehouse) {
      console.log(
        `✅ WAREHOUSE FOUND for "${cityName}":`,
        matchedWarehouse.name,
        "in",
        matchedWarehouse.city,
      );
    } else {
      console.log(`❌ NO WAREHOUSE found for "${cityName}"`);
      console.log(`❌ Searched for normalized: "${normalizedSearchCity}"`);
      console.log(
        `❌ Available normalized warehouse cities:`,
        warehouses.map((w) => `"${normalizeCityName(w.city)}"`),
      );

      // Extra debugging for the specific case
      if (
        cityName.toLowerCase().includes("иштыхан") ||
        cityName.toLowerCase().includes("ishtixon")
      ) {
        console.log(
          `🔍 SPECIAL DEBUG: Checking for "${cityName}" specifically`,
        );
        console.log(`🔍 Available warehouse cities (exact):`, warehouseCities);
        console.log(
          `🔍 Normalized warehouse cities:`,
          warehouses.map((w) => normalizeCityName(w.city)),
        );
      }
    }

    return found;
  };

  // Check if a city has a locker (postamat)
  const hasLocker = (cityName: string | null): boolean => {
    if (!cityName || lockers.length === 0) {
      console.log(
        `❌ No locker check possible for "${cityName}" - ${lockers.length} lockers available`,
      );
      return false;
    }

    console.log(`🔍 Checking locker for city: "${cityName}"`);

    // Step 1: Try exact match first (case-insensitive)
    const exactMatch = lockers.find(
      (l) => l.city.toLowerCase() === cityName.toLowerCase(),
    );

    if (exactMatch) {
      console.log(
        `✅ EXACT LOCKER MATCH FOUND: "${cityName}" === "${exactMatch.city}"`,
      );
      console.log(`   Locker: ${exactMatch.name}`);
      return true;
    }

    // Step 2: Try normalized matching for flexibility
    const normalizedSearchCity = normalizeCityName(cityName);
    let found = false;

    for (const locker of lockers) {
      const normalizedLockerCity = normalizeCityName(locker.city);

      if (
        normalizedLockerCity === normalizedSearchCity ||
        normalizedLockerCity.includes(normalizedSearchCity) ||
        normalizedSearchCity.includes(normalizedLockerCity)
      ) {
        found = true;
        console.log(
          `✅ LOCKER FOUND for "${cityName}":`,
          locker.name,
          "in",
          locker.city,
        );
        break;
      }
    }

    if (!found) {
      console.log(`❌ NO LOCKER found for "${cityName}"`);
    }

    return found;
  };

  // Check if warehouse warning should be shown for selected tariff type
  const shouldShowWarehouseWarning = (
    originCity: City | null,
    destinationCity: City | null,
    tariffType: TariffType | null,
  ): { show: boolean; message: string } => {
    if (!tariffType || loading) {
      return { show: false, message: "" };
    }

    // Check for tariffs that require warehouses or lockers
    const checkedTariffs = [
      "OFFICE_OFFICE",
      "OFFICE_DOOR",
      "DOOR_OFFICE",
      "OFFICE_POSTAMAT",
      "DOOR_POSTAMAT",
    ];

    if (!checkedTariffs.includes(tariffType)) {
      return { show: false, message: "" };
    }

    // Extract city names properly from RegionCity or City objects
    const getDisplayName = (city: any) => {
      if (!city) return null;
      // Check if it's a RegionCity with names object
      if (city.names) {
        return city.names.ru || city.names.en || city.names.uz;
      }
      // Fallback to name property for regular City objects
      return city.name || null;
    };

    const originCityName = getDisplayName(originCity);
    const destinationCityName = getDisplayName(destinationCity);

    const originHasWarehouse = hasWarehouse(originCityName);
    const destinationHasWarehouse = hasWarehouse(destinationCityName);
    const destinationHasLocker = hasLocker(destinationCityName);

    // For OFFICE_OFFICE, both cities need warehouses
    if (tariffType === "OFFICE_OFFICE") {
      if (!originHasWarehouse && !destinationHasWarehouse) {
        return {
          show: true,
          message: t.noWarehouses,
        };
      } else if (!originHasWarehouse) {
        return {
          show: true,
          message: formatMessage(t.noOriginWarehouse, {
            city: originCityName || "",
          }),
        };
      } else if (!destinationHasWarehouse) {
        return {
          show: true,
          message: formatMessage(t.noDestinationWarehouse, {
            city: destinationCityName || "",
          }),
        };
      }
    }

    // For OFFICE_DOOR, check origin city warehouse only
    if (tariffType === "OFFICE_DOOR" && !originHasWarehouse) {
      return {
        show: true,
        message: formatMessage(t.noOriginWarehouse, {
          city: originCity?.name || "",
        }),
      };
    }

    // For OFFICE_POSTAMAT, check origin warehouse and destination locker
    if (tariffType === "OFFICE_POSTAMAT") {
      if (!originHasWarehouse && !destinationHasLocker) {
        return {
          show: true,
          message: formatMessage(t.noOriginWarehouseAndDestinationLocker, {
            originCity: originCityName || "",
            destinationCity: destinationCityName || "",
          }),
        };
      } else if (!originHasWarehouse) {
        return {
          show: true,
          message: formatMessage(t.noOriginWarehouse, {
            city: originCityName || "",
          }),
        };
      } else if (!destinationHasLocker) {
        return {
          show: true,
          message: formatMessage(t.noDestinationLocker, {
            city: destinationCityName || "",
          }),
        };
      }
    }

    // For DOOR_OFFICE, check destination city warehouse only
    if (tariffType === "DOOR_OFFICE" && !destinationHasWarehouse) {
      return {
        show: true,
        message: formatMessage(t.noDestinationWarehouse, {
          city: destinationCity?.name || "",
        }),
      };
    }

    // For DOOR_POSTAMAT, check destination locker only
    if (tariffType === "DOOR_POSTAMAT" && !destinationHasLocker) {
      return {
        show: true,
        message: formatMessage(t.noDestinationLocker, {
          city: destinationCity?.name || "",
        }),
      };
    }

    return { show: false, message: "" };
  };

  // Check if calculation should be disabled due to missing warehouses/lockers
  const shouldDisableCalculation = (
    originCity: City | null,
    destinationCity: City | null,
    tariffType: TariffType | null,
  ): boolean => {
    if (!originCity || !destinationCity || !tariffType || loading) return true;

    // Extract city names properly from RegionCity or City objects
    const getDisplayName = (city: any) => {
      if (!city) return null;
      // Check if it's a RegionCity with names object
      if (city.names) {
        return city.names.ru || city.names.en || city.names.uz;
      }
      // Fallback to name property for regular City objects
      return city.name || null;
    };

    const originCityName = getDisplayName(originCity);
    const destinationCityName = getDisplayName(destinationCity);

    const originHasWarehouse = hasWarehouse(originCityName);
    const destinationHasWarehouse = hasWarehouse(destinationCityName);
    const destinationHasLocker = hasLocker(destinationCityName);

    switch (tariffType) {
      case "OFFICE_OFFICE":
        return !originHasWarehouse || !destinationHasWarehouse;

      case "OFFICE_DOOR":
        return !originHasWarehouse;

      case "DOOR_OFFICE":
        return !destinationHasWarehouse;

      case "OFFICE_POSTAMAT":
        return !originHasWarehouse || !destinationHasLocker;

      case "DOOR_POSTAMAT":
        return !destinationHasLocker;

      case "DOOR_DOOR":
        return false; // Door to door doesn't require warehouses

      default:
        return false;
    }
  };

  return {
    warehouses,
    lockers,
    loading,
    error,
    hasWarehouse,
    hasLocker,
    shouldShowWarehouseWarning,
    shouldDisableCalculation,
  };
}
