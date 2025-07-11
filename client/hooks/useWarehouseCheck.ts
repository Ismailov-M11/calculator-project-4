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
      .replace(/(город|city|shahri|tumani|viloyati|oblast|region)/gi, "") // Remove common city suffixes
      .trim();
  };

  // Check if a city has a warehouse
  const hasWarehouse = (cityName: string | null): boolean => {
    if (!cityName || warehouses.length === 0) return false;

    console.log("Checking warehouse for city:", cityName);
    console.log(
      "Available warehouse cities:",
      warehouses.map((w) => w.city),
    );

    const normalizedSearchCity = normalizeCityName(cityName);
    console.log("Normalized search city:", normalizedSearchCity);

    const found = warehouses.some((warehouse) => {
      const normalizedWarehouseCity = normalizeCityName(warehouse.city);
      console.log(
        `Comparing "${normalizedSearchCity}" with "${normalizedWarehouseCity}"`,
      );

      // Try exact match
      if (normalizedWarehouseCity === normalizedSearchCity) {
        return true;
      }

      // Try partial match (warehouse city contains search city or vice versa)
      if (
        normalizedWarehouseCity.includes(normalizedSearchCity) ||
        normalizedSearchCity.includes(normalizedWarehouseCity)
      ) {
        return true;
      }

      // Try word-by-word comparison for compound names
      const searchWords = normalizedSearchCity
        .split(" ")
        .filter((w) => w.length > 2);
      const warehouseWords = normalizedWarehouseCity
        .split(" ")
        .filter((w) => w.length > 2);

      return searchWords.some((searchWord) =>
        warehouseWords.some(
          (warehouseWord) =>
            warehouseWord.includes(searchWord) ||
            searchWord.includes(warehouseWord),
        ),
      );
    });

    console.log(`Warehouse found for ${cityName}:`, found);
    return found;
  };

  // Check if a city has a locker (postamat)
  const hasLocker = (cityName: string | null): boolean => {
    if (!cityName || lockers.length === 0) return false;

    console.log("Checking locker for city:", cityName);
    console.log(
      "Available locker cities:",
      lockers.map((l) => l.city),
    );

    const normalizedSearchCity = normalizeCityName(cityName);
    console.log("Normalized search city for locker:", normalizedSearchCity);

    const found = lockers.some((locker) => {
      const normalizedLockerCity = normalizeCityName(locker.city);
      console.log(
        `Comparing locker "${normalizedSearchCity}" with "${normalizedLockerCity}"`,
      );

      // Try exact match
      if (normalizedLockerCity === normalizedSearchCity) {
        return true;
      }

      // Try partial match (locker city contains search city or vice versa)
      if (
        normalizedLockerCity.includes(normalizedSearchCity) ||
        normalizedSearchCity.includes(normalizedLockerCity)
      ) {
        return true;
      }

      // Try word-by-word comparison for compound names
      const searchWords = normalizedSearchCity
        .split(" ")
        .filter((w) => w.length > 2);
      const lockerWords = normalizedLockerCity
        .split(" ")
        .filter((w) => w.length > 2);

      return searchWords.some((searchWord) =>
        lockerWords.some(
          (lockerWord) =>
            lockerWord.includes(searchWord) || searchWord.includes(lockerWord),
        ),
      );
    });

    console.log(`Locker found for ${cityName}:`, found);
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
