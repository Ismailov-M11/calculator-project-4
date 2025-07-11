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
    // Only show warnings when all required fields are selected AND tariff type requires office/warehouse validation
    if (
      !form.originCity ||
      !form.destinationCity ||
      !form.tariffType ||
      !convertedOriginCity ||
      !convertedDestinationCity ||
      !warehouseData
    ) {
      return {
        show: false,
        type: "info" as const,
        message: "",
      };
    }

    // Only check for office-related tariff types that require warehouses
    const requiresWarehouseCheck = form.tariffType.includes("OFFICE");
    if (!requiresWarehouseCheck) {
      return {
        show: false,
        type: "info" as const,
        message: "",
      };
    }

    // Use the proper warehouse checking logic instead of simple filtering
    console.log("🔄 TARIFF CALCULATOR: Checking warehouses for:");
    console.log("  Origin:", convertedOriginCity.name);
    console.log("  Destination:", convertedDestinationCity.name);

    const hasOriginWarehouse = warehouseData.hasWarehouse(
      convertedOriginCity.name,
    );
    const hasDestinationWarehouse = warehouseData.hasWarehouse(
      convertedDestinationCity.name,
    );
    const hasOriginLocker = warehouseData.hasLocker(convertedOriginCity.name);
    const hasDestinationLocker = warehouseData.hasLocker(
      convertedDestinationCity.name,
    );

    const hasOriginServices = hasOriginWarehouse || hasOriginLocker;
    const hasDestinationServices =
      hasDestinationWarehouse || hasDestinationLocker;

    console.log("🔄 TARIFF CALCULATOR: Results:");
    console.log("  Origin warehouse:", hasOriginWarehouse);
    console.log("  Origin locker:", hasOriginLocker);
    console.log("  Destination warehouse:", hasDestinationWarehouse);
    console.log("  Destination locker:", hasDestinationLocker);

    // Use city names from selected RegionCity according to current language
    const getDisplayName = (regionCity: RegionCity) => {
      return regionCity.names[language] || regionCity.names.en;
    };

    // Check based on tariff type requirements
    const needsOriginOffice = form.tariffType.startsWith("OFFICE");
    const needsDestinationOffice = form.tariffType.endsWith("OFFICE");

    if (
      needsOriginOffice &&
      needsDestinationOffice &&
      !hasOriginServices &&
      !hasDestinationServices
    ) {
      return {
        show: true,
        type: "warning" as const,
        message: formatMessage(t.noWarehouses, {
          origin: getDisplayName(form.originCity),
          destination: getDisplayName(form.destinationCity),
        }),
      };
    } else if (needsOriginOffice && !hasOriginServices) {
      return {
        show: true,
        type: "warning" as const,
        message: formatMessage(t.noOriginWarehouse, {
          city: getDisplayName(form.originCity),
        }),
      };
    } else if (needsDestinationOffice && !hasDestinationServices) {
      return {
        show: true,
        type: "warning" as const,
        message: formatMessage(t.noDestinationWarehouse, {
          city: getDisplayName(form.destinationCity),
        }),
      };
    }

    return {
      show: false,
      type: "info" as const,
      message: "",
    };
  };

  const warehouseWarning = createWarehouseWarning();

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
      !convertedOriginCity ||
      !convertedDestinationCity ||
      !warehouseData
    ) {
      return false; // Let other validation handle this
    }

    // Check if tariff type requires office/warehouse services
    const needsOriginOffice = form.tariffType.startsWith("OFFICE");
    const needsDestinationOffice =
      form.tariffType.endsWith("OFFICE") ||
      form.tariffType.endsWith("POSTAMAT");

    if (!needsOriginOffice && !needsDestinationOffice) {
      return false; // No warehouse requirements for this tariff
    }

    // Use the proper warehouse checking logic
    const hasOriginWarehouse = warehouseData.hasWarehouse(
      convertedOriginCity.name,
    );
    const hasDestinationWarehouse = warehouseData.hasWarehouse(
      convertedDestinationCity.name,
    );
    const hasOriginLocker = warehouseData.hasLocker(convertedOriginCity.name);
    const hasDestinationLocker = warehouseData.hasLocker(
      convertedDestinationCity.name,
    );

    const hasOriginServices = hasOriginWarehouse || hasOriginLocker;
    const hasDestinationServices =
      hasDestinationWarehouse || hasDestinationLocker;

    // Block if required services are not available
    if (needsOriginOffice && !hasOriginServices) {
      return true;
    }
    if (needsDestinationOffice && !hasDestinationServices) {
      return true;
    }

    return false;
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
