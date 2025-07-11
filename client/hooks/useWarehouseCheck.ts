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
          setWarehouses(warehousesData.data?.list || warehousesData.data || []);
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
          setLockers(lockersData.data?.list || lockersData.data || []);
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

  // Check if a city has a warehouse
  const hasWarehouse = (cityName: string | null): boolean => {
    if (!cityName || warehouses.length === 0) return false;

    // Clean city name for comparison (remove extra spaces, convert to lowercase)
    const cleanCityName = cityName.trim().toLowerCase();

    return warehouses.some(
      (warehouse) => warehouse.city.trim().toLowerCase() === cleanCityName,
    );
  };

  // Check if a city has a locker (postamat)
  const hasLocker = (cityName: string | null): boolean => {
    if (!cityName || lockers.length === 0) return false;

    // Clean city name for comparison (remove extra spaces, convert to lowercase)
    const cleanCityName = cityName.trim().toLowerCase();

    return lockers.some(
      (locker) => locker.city.trim().toLowerCase() === cleanCityName,
    );
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

    const originHasWarehouse = hasWarehouse(originCity?.name || null);
    const destinationHasWarehouse = hasWarehouse(destinationCity?.name || null);
    const destinationHasLocker = hasLocker(destinationCity?.name || null);

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
            city: originCity?.name || "",
          }),
        };
      } else if (!destinationHasWarehouse) {
        return {
          show: true,
          message: formatMessage(t.noDestinationWarehouse, {
            city: destinationCity?.name || "",
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
            originCity: originCity?.name || "",
            destinationCity: destinationCity?.name || "",
          }),
        };
      } else if (!originHasWarehouse) {
        return {
          show: true,
          message: formatMessage(t.noOriginWarehouse, {
            city: originCity?.name || "",
          }),
        };
      } else if (!destinationHasLocker) {
        return {
          show: true,
          message: formatMessage(t.noDestinationLocker, {
            city: destinationCity?.name || "",
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

    const originHasWarehouse = hasWarehouse(originCity.name);
    const destinationHasWarehouse = hasWarehouse(destinationCity.name);
    const destinationHasLocker = hasLocker(destinationCity.name);

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
