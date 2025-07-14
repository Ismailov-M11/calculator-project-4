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

  // Check if a city has a warehouse - STRICT MATCHING ONLY
  const hasWarehouse = (cityName: string | null): boolean => {
    if (!cityName || warehouses.length === 0) {
      console.log(
        `❌ No warehouse check possible for "${cityName}" - ${warehouses.length} warehouses available`,
      );
      return false;
    }

    console.log(`🔍 STRICT warehouse check for city: "${cityName}"`);
    console.log(
      `🔍 City name length: ${cityName.length}, char codes: ${Array.from(cityName).map((c) => c.charCodeAt(0))}`,
    );

    // Trim the city name once at the beginning
    const trimmedCityName = cityName.trim();

    // Get all available warehouse cities for debugging
    const warehouseCities = warehouses.map((w) => w.city);
    console.log("📍 Available warehouse cities:", warehouseCities);

    // Enhanced debugging
    console.log("🏗️ DETAILED WAREHOUSE DEBUG:");
    console.log(`  Search city: "${cityName}" (length: ${cityName.length})`);
    console.log(
      `  Trimmed city: "${trimmedCityName}" (length: ${trimmedCityName.length})`,
    );

    // Check all warehouses for potential matches
    warehouses.forEach((w, i) => {
      const trimmedWarehouseCity = w.city.trim();
      const strictMatch = trimmedWarehouseCity === trimmedCityName;
      console.log(
        `  Warehouse ${i}: "${w.city}" (trimmed: "${trimmedWarehouseCity}") - Match: ${strictMatch}`,
      );

      // Highlight potential matches for debugging
      if (
        cityName.toLowerCase().includes("andij") ||
        cityName.toLowerCase().includes("анд")
      ) {
        if (
          w.city.toLowerCase().includes("andij") ||
          w.city.toLowerCase().includes("анд")
        ) {
          console.log(
            `    ⭐ POTENTIAL ANDIJAN MATCH: ${w.name} in "${w.city}"`,
          );
        }
      }
    });

    // STRICT MATCHING ONLY: exact string comparison (with whitespace trimming)
    const exactMatch = warehouses.find(
      (warehouse) => warehouse.city.trim() === trimmedCityName,
    );

    if (exactMatch) {
      console.log(
        `✅ STRICT MATCH FOUND: "${trimmedCityName}" === "${exactMatch.city.trim()}"`,
      );
      console.log(`   Original city name: "${cityName}"`);
      console.log(`   Warehouse: ${exactMatch.name}`);
      return true;
    }

    console.log(
      `❌ NO STRICT WAREHOUSE MATCH for "${trimmedCityName}" (original: "${cityName}")`,
    );
    console.log(`❌ Available warehouse cities:`, warehouseCities);

    return false;
  };

  // Check if a city has a locker (postamat) - STRICT MATCHING ONLY
  const hasLocker = (cityName: string | null): boolean => {
    if (!cityName || lockers.length === 0) {
      console.log(
        `❌ No locker check possible for "${cityName}" - ${lockers.length} lockers available`,
      );
      return false;
    }

    console.log(`🔍 STRICT locker check for city: "${cityName}"`);

    // Get all available locker cities for debugging
    const lockerCities = lockers.map((l) => l.city);
    console.log("📍 Available locker cities:", lockerCities);

    // STRICT MATCHING ONLY: exact string comparison (with whitespace trimming)
    const trimmedCityName = cityName.trim();
    const exactMatch = lockers.find(
      (locker) => locker.city.trim() === trimmedCityName,
    );

    if (exactMatch) {
      console.log(
        `✅ STRICT LOCKER MATCH FOUND: "${trimmedCityName}" === "${exactMatch.city.trim()}"`,
      );
      console.log(`   Original city name: "${cityName}"`);
      console.log(`   Locker: ${exactMatch.name}`);
      return true;
    }

    console.log(
      `❌ NO STRICT LOCKER MATCH for "${trimmedCityName}" (original: "${cityName}")`,
    );
    console.log(`❌ Available locker cities:`, lockerCities);

    return false;
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
