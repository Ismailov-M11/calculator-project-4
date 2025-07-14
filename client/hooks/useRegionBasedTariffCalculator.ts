import { useState, useEffect } from "react";
import {
  RegionBasedTariffCalculatorForm,
  TariffCalculationResponse,
  TariffType,
  RegionCity,
  City,
  CitiesResponse,
} from "@shared/api";
import { useI18n } from "./useI18n";
import { useWarehouseCheck } from "./useWarehouseCheck";

export function useRegionBasedTariffCalculator() {
  const { t, language, formatMessage } = useI18n();
  const [form, setForm] = useState<RegionBasedTariffCalculatorForm>({
    originCity: null,
    destinationCity: null,
    tariffType: null,
    weight: "",
  });
  const [result, setResult] = useState<TariffCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCities, setApiCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Load cities from API on mount
  useEffect(() => {
    const loadCities = async () => {
      setCitiesLoading(true);
      try {
        const response = await fetch("/api/cities");
        if (response.ok) {
          const data: CitiesResponse = await response.json();
          setApiCities(data.data || []);
        } else {
          console.error("Failed to fetch cities:", response.status);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCities();
  }, []);

  // Function to find API city by shipox_id from selected RegionCity
  const findApiCityByShipoxId = (regionCity: RegionCity): City | null => {
    return apiCities.find((city) => city.id === regionCity.shipox_id) || null;
  };

  // Convert RegionCity to corresponding API City for warehouse check
  const convertedOriginCity = form.originCity
    ? findApiCityByShipoxId(form.originCity)
    : null;
  const convertedDestinationCity = form.destinationCity
    ? findApiCityByShipoxId(form.destinationCity)
    : null;

const warehouseData = useWarehouseCheck();

  // Create warning based on warehouse check - only show when tariff type is selected and requires validation
  const createWarehouseWarning = () => {
    console.log("🚨 CREATE_WAREHOUSE_WARNING called");
    console.log("  Form state:", {
      originCity: form.originCity?.names,
      destinationCity: form.destinationCity?.names,
      tariffType: form.tariffType,
      warehouseDataLoaded: !!warehouseData,
    });

    // Only show warnings when all required fields are selected AND tariff type requires office/warehouse validation
    if (
      !form.originCity ||
      !form.destinationCity ||
      !form.tariffType ||
      !warehouseData
    ) {
      console.log("🚨 EARLY RETURN - missing data");
      return {
        show: false,
        type: "info" as const,
        message: "",
      };
    }

    // Only check for office-related tariff types that require warehouses
    const requiresWarehouseCheck =
      form.tariffType.includes("OFFICE") ||
      form.tariffType.includes("POSTAMAT");
    if (!requiresWarehouseCheck) {
      return {
        show: false,
        type: "info" as const,
        message: "",
      };
    }

    // CRITICAL: Only use API cities for warehouse checking - no fallbacks
    if (!convertedOriginCity || !convertedDestinationCity) {
      console.log(
        "🚨 EARLY RETURN - API cities not found, cannot check warehouses",
      );
      console.log("  convertedOriginCity:", convertedOriginCity);
      console.log("  convertedDestinationCity:", convertedDestinationCity);
      console.log("  Available API cities count:", apiCities.length);
      console.log("  Origin shipox_id:", form.originCity.shipox_id);
      console.log("  Destination shipox_id:", form.destinationCity.shipox_id);

      // If we can't find the API cities, we cannot proceed with warehouse checks
      // This means the selected RegionCity doesn't have a corresponding API city
      return {
        show: true,
        type: "warning" as const,
        message:
          "Невозможно проверить доступность услуг в выбранных городах. Попробуйте выбрать другие города.",
      };
    }

    // Use EXACT API city names for warehouse checking
    const originCityName = convertedOriginCity.name;
    const destinationCityName = convertedDestinationCity.name;

    console.log(
      "🔄 TARIFF CALCULATOR: Checking warehouses with API city names:",
    );
    console.log("  Origin RegionCity:", form.originCity.names);
    console.log("  Origin API City ID:", convertedOriginCity.id);
    console.log("  Origin API City Name:", originCityName);
    console.log("  Destination RegionCity:", form.destinationCity.names);
    console.log("  Destination API City ID:", convertedDestinationCity.id);
    console.log("  Destination API City Name:", destinationCityName);
    console.log("  Tariff Type:", form.tariffType);

    const hasOriginWarehouse = warehouseData.hasWarehouse(originCityName);
    const hasDestinationWarehouse =
      warehouseData.hasWarehouse(destinationCityName);
    const hasOriginLocker = warehouseData.hasLocker(originCityName);
    const hasDestinationLocker = warehouseData.hasLocker(destinationCityName);

    const hasOriginServices = hasOriginWarehouse || hasOriginLocker;
    const hasDestinationServices =
      hasDestinationWarehouse || hasDestinationLocker;

    console.log("🔄 TARIFF CALCULATOR: Results:");
    console.log("  Origin warehouse:", hasOriginWarehouse);
    console.log("  Origin locker:", hasOriginLocker);
    console.log("  Destination warehouse:", hasDestinationWarehouse);
    console.log("  Destination locker:", hasDestinationLocker);
    console.log("  Has origin services:", hasOriginServices);
    console.log("  Has destination services:", hasDestinationServices);

    // Use city names from selected RegionCity according to current language
    const getDisplayName = (regionCity: RegionCity) => {
      return regionCity.names[language] || regionCity.names.en;
    };

    // Check based on tariff type requirements
    const needsOriginOffice = form.tariffType.startsWith("OFFICE");
    const needsDestinationOffice = form.tariffType.endsWith("OFFICE");
    const needsDestinationPostamat = form.tariffType.endsWith("POSTAMAT");

    console.log("🔄 TARIFF CALCULATOR: Tariff requirements:");
    console.log("  Needs origin office:", needsOriginOffice);
    console.log("  Needs destination office:", needsDestinationOffice);
    console.log("  Needs destination postamat:", needsDestinationPostamat);

    // Check specific requirements based on tariff type
    if (form.tariffType === "OFFICE_OFFICE") {
      console.log("🚨 CHECKING OFFICE_OFFICE tariff");
      console.log("  hasOriginWarehouse:", hasOriginWarehouse);
      console.log("  hasDestinationWarehouse:", hasDestinationWarehouse);

      if (!hasOriginWarehouse && !hasDestinationWarehouse) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noWarehouses ||
              "В городах {origin} и {destination} нет офисов FARGO",
            {
              origin: getDisplayName(form.originCity),
              destination: getDisplayName(form.destinationCity),
            },
          ),
        };
      } else if (!hasOriginWarehouse) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noOriginWarehouse || "В городе {city} нет офиса FARGO",
            {
              city: getDisplayName(form.originCity),
            },
          ),
        };
      } else if (!hasDestinationWarehouse) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noDestinationWarehouse || "В городе {city} нет офиса FARGO",
            {
              city: getDisplayName(form.destinationCity),
            },
          ),
        };
      }
    } else if (form.tariffType === "OFFICE_DOOR") {
      if (!hasOriginWarehouse) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noOriginWarehouse || "В городе {city} нет офиса FARGO",
            {
              city: getDisplayName(form.originCity),
            },
          ),
        };
      }
    } else if (form.tariffType === "DOOR_OFFICE") {
      if (!hasDestinationWarehouse) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noDestinationWarehouse || "В городе {city} нет офиса FARGO",
            {
              city: getDisplayName(form.destinationCity),
            },
          ),
        };
      }
    } else if (form.tariffType === "OFFICE_POSTAMAT") {
      if (!hasOriginWarehouse && !hasDestinationLocker) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noOriginWarehouseAndDestinationLocker ||
              "В городе {originCity} нет офиса FARGO, а в городе {destinationCity} нет постамата",
            {
              originCity: getDisplayName(form.originCity),
              destinationCity: getDisplayName(form.destinationCity),
            },
          ),
        };
      } else if (!hasOriginWarehouse) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noOriginWarehouse || "В городе {city} нет офиса FARGO",
            {
              city: getDisplayName(form.originCity),
            },
          ),
        };
      } else if (!hasDestinationLocker) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noDestinationLocker || "В городе {city} нет постамата",
            {
              city: getDisplayName(form.destinationCity),
            },
          ),
        };
      }
    } else if (form.tariffType === "DOOR_POSTAMAT") {
      if (!hasDestinationLocker) {
        return {
          show: true,
          type: "warning" as const,
          message: formatMessage(
            t.noDestinationLocker || "В городе {city} нет постамата",
            {
              city: getDisplayName(form.destinationCity),
            },
          ),
        };
      }
    }

    const result = {
      show: false,
      type: "info" as const,
      message: "",
    };

    console.log("🚨 WAREHOUSE WARNING FINAL RESULT:", result);
    return result;
  };

  const warehouseWarning = createWarehouseWarning();
  console.log("🚨 WAREHOUSE WARNING OBJECT:", warehouseWarning);

  const updateForm = (updates: Partial<RegionBasedTariffCalculatorForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const resetForm = () => {
    setForm({
      originCity: null,
      destinationCity: null,
      tariffType: null,
      weight: "",
    });
    setResult(null);
    setError(null);
  };

  const isFormValid = () => {
    const weight = parseFloat(form.weight);
    return (
      form.originCity &&
      form.destinationCity &&
      form.tariffType &&
      form.weight &&
      !isNaN(weight) &&
      weight > 0
    );
  };

  // Check if we can actually calculate (cities found in API and have coordinates)
  const canCalculate = () => {
    return (
      isFormValid() &&
      convertedOriginCity &&
      convertedDestinationCity &&
      convertedOriginCity.center_latitude &&
      convertedOriginCity.center_longitude &&
      convertedDestinationCity.center_latitude &&
      convertedDestinationCity.center_longitude
    );
  };

  const isCalculationDisabled = () => {
    // Block calculation if tariff requires warehouses/lockers but they are not available
    if (
      !form.originCity ||
      !form.destinationCity ||
      !form.tariffType ||
      !warehouseData
    ) {
      return false; // Let other validation handle this
    }

    // Only proceed if we have API cities - strict requirement
    if (!convertedOriginCity || !convertedDestinationCity) {
      console.log("🚨 CALCULATION DISABLED - API cities not found");
      return true; // Disable calculation if we don't have proper API city data
    }

    // Use EXACT API city names for warehouse checking
    const originCityName = convertedOriginCity.name;
    const destinationCityName = convertedDestinationCity.name;

    // Use the proper warehouse checking logic
    const hasOriginWarehouse = warehouseData.hasWarehouse(originCityName);
    const hasDestinationWarehouse =
      warehouseData.hasWarehouse(destinationCityName);
    const hasOriginLocker = warehouseData.hasLocker(originCityName);
    const hasDestinationLocker = warehouseData.hasLocker(destinationCityName);

    // Check specific requirements based on tariff type
    switch (form.tariffType) {
      case "OFFICE_OFFICE":
        return !hasOriginWarehouse || !hasDestinationWarehouse;

      case "OFFICE_DOOR":
        return !hasOriginWarehouse;

      case "DOOR_OFFICE":
        return !hasDestinationWarehouse;

      case "OFFICE_POSTAMAT":
        return !hasOriginWarehouse || !hasDestinationLocker;

      case "DOOR_POSTAMAT":
        return !hasDestinationLocker;

      case "DOOR_DOOR":
        return false; // Door to door doesn't require warehouses

      default:
        return false;
    }
  };

  const calculateTariff = async () => {
    console.log("calculateTariff called");
    console.log("Form state:", form);
    console.log("isFormValid():", isFormValid());
    console.log("convertedOriginCity:", convertedOriginCity);
    console.log("convertedDestinationCity:", convertedDestinationCity);

    if (!isFormValid()) {
      console.log("Form is not valid");
      setError(t.fillAllFields);
      return;
    }

    // We already know these exist from canCalculate() check
    const originApiCity = convertedOriginCity!;
    const destinationApiCity = convertedDestinationCity!;

    const weight = parseFloat(form.weight);
    if (isNaN(weight) || weight <= 0) {
      setError(t.correctWeight);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Calculating tariff with coordinates:", {
        from_latitude: originApiCity.center_latitude,
        from_longitude: originApiCity.center_longitude,
        to_latitude: destinationApiCity.center_latitude,
        to_longitude: destinationApiCity.center_longitude,
        weight: weight,
        tariff_type: form.tariffType,
      });

      // Use the new API endpoint that expects coordinates
      const response = await fetch("/api/calculate-tariff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_latitude: originApiCity.center_latitude,
          from_longitude: originApiCity.center_longitude,
          to_latitude: destinationApiCity.center_latitude,
          to_longitude: destinationApiCity.center_longitude,
          weight: weight,
          tariff_type: form.tariffType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Tariff calculation result:", data);
      setResult(data);
    } catch (err) {
      console.error("Tariff calculation error:", err);
      setError(t.calculationError);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    result,
    loading,
    error,
    updateForm,
    resetForm,
    calculateTariff,
    isFormValid,
    canCalculate,
    isCalculationDisabled,
    warehouseWarning,
    citiesLoading,
    apiCities,
    // Helper functions for debugging
    convertedOriginCity,
    convertedDestinationCity,
  };
}
