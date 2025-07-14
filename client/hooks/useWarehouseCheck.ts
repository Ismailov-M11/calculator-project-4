import { useEffect, useState } from "react";
import { City, Warehouse, TariffType } from "@shared/api";
import { useI18n } from "./useI18n";

// 💬 Новый хук
export function useWarehouseCheck(cities: City[]) {
  const { t, formatMessage } = useI18n();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [lockers, setLockers] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🚚 Загрузка складов и постаматов
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const warehousesResponse = await fetch("/api/warehouses");
        const lockersResponse = await fetch("/api/lockers");

        if (warehousesResponse.ok) {
          const data = await warehousesResponse.json();
          setWarehouses(data.data?.list || []);
        } else {
          console.error("Ошибка загрузки складов");
        }

        if (lockersResponse.ok) {
          const data = await lockersResponse.json();
          setLockers(data.data?.list || []);
        } else {
          console.error("Ошибка загрузки постаматов");
        }
      } catch (e) {
        console.error("Ошибка при запросе складов и постаматов:", e);
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 💡 Получение name города по ID
  const getCityNameById = (id: number | null): string | null => {
    if (!id) return null;
    const found = cities.find((c) => c.id === id);
    return found?.name || null;
  };

  const hasWarehouse = (cityName: string | null): boolean => {
    if (!cityName) return false;
    return warehouses.some((w) => w.city === cityName);
  };

  const hasLocker = (cityName: string | null): boolean => {
    if (!cityName) return false;
    return lockers.some((l) => l.city === cityName);
  };

  const shouldShowWarehouseWarning = (
    originCity: City | null,
    destinationCity: City | null,
    tariffType: TariffType | null
  ): { show: boolean; message: string } => {
    if (!tariffType || loading) return { show: false, message: "" };

    const originCityName = getCityNameById(originCity?.id || null);
    const destinationCityName = getCityNameById(destinationCity?.id || null);

    const originHasWarehouse = hasWarehouse(originCityName);
    const destinationHasWarehouse = hasWarehouse(destinationCityName);
    const destinationHasLocker = hasLocker(destinationCityName);

    if (tariffType === "OFFICE_OFFICE") {
      if (!originHasWarehouse && !destinationHasWarehouse) {
        return { show: true, message: t.noWarehouses };
      } else if (!originHasWarehouse) {
        return { show: true, message: formatMessage(t.noOriginWarehouse, { city: originCityName || "" }) };
      } else if (!destinationHasWarehouse) {
        return { show: true, message: formatMessage(t.noDestinationWarehouse, { city: destinationCityName || "" }) };
      }
    }

    if (tariffType === "OFFICE_DOOR" && !originHasWarehouse) {
      return { show: true, message: formatMessage(t.noOriginWarehouse, { city: originCityName || "" }) };
    }

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
        return { show: true, message: formatMessage(t.noOriginWarehouse, { city: originCityName || "" }) };
      } else if (!destinationHasLocker) {
        return { show: true, message: formatMessage(t.noDestinationLocker, { city: destinationCityName || "" }) };
      }
    }

    if (tariffType === "DOOR_OFFICE" && !destinationHasWarehouse) {
      return { show: true, message: formatMessage(t.noDestinationWarehouse, { city: destinationCityName || "" }) };
    }

    if (tariffType === "DOOR_POSTAMAT" && !destinationHasLocker) {
      return { show: true, message: formatMessage(t.noDestinationLocker, { city: destinationCityName || "" }) };
    }

    return { show: false, message: "" };
  };

  const shouldDisableCalculation = (
    originCity: City | null,
    destinationCity: City | null,
    tariffType: TariffType | null
  ): boolean => {
    if (!originCity || !destinationCity || !tariffType || loading) return true;

    const originCityName = getCityNameById(originCity.id);
    const destinationCityName = getCityNameById(destinationCity.id);

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
        return false;
      default:
        return true;
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
