import { useState, useEffect } from "react";
import {
  City,
  TariffType,
  TariffCalculatorForm,
  TariffCalculationResponse,
} from "@shared/api";
import { useWarehouseCheck } from "./useWarehouseCheck";
import { useI18n } from "./useI18n";

export function useTariffCalculator() {
  const { t, language } = useI18n();
  const [form, setForm] = useState<TariffCalculatorForm>({
    originCity: null,
    destinationCity: null,
    tariffType: null,
    weight: "",
  });

  const [result, setResult] = useState<TariffCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  // Warehouse checking
  const { shouldShowWarehouseWarning, shouldDisableCalculation } =
    useWarehouseCheck();

  // Clear validation errors when language changes
  useEffect(() => {
    if (errorType) {
      switch (errorType) {
        case "selectCitiesFirst":
          setError(t.selectCitiesFirst);
          break;
        case "fillAllFields":
          setError(t.fillAllFields);
          break;
        case "correctWeight":
          setError(t.correctWeight);
          break;
        default:
          setError(null);
          setErrorType(null);
      }
    }
  }, [language, t, errorType]);

  const updateForm = (updates: Partial<TariffCalculatorForm>) => {
    // If trying to set tariff type without cities selected, show error
    if (updates.tariffType && (!form.originCity || !form.destinationCity)) {
      setError(t.selectCitiesFirst);
      setErrorType("selectCitiesFirst");
      return;
    }

    setForm((prev) => ({ ...prev, ...updates }));
    setError(null);
    setErrorType(null);
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
    setErrorType(null);
  };

  const calculateTariff = async () => {
    if (
      !form.originCity ||
      !form.destinationCity ||
      !form.tariffType ||
      !form.weight
    ) {
      setError(t.fillAllFields);
      setErrorType("fillAllFields");
      return;
    }

    const weight = parseFloat(form.weight);
    if (isNaN(weight) || weight <= 0) {
      setError(t.correctWeight);
      setErrorType("correctWeight");
      return;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const response = await fetch("/api/calculate-tariff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_latitude: form.originCity.center_latitude,
          from_longitude: form.originCity.center_longitude,
          to_latitude: form.destinationCity.center_latitude,
          to_longitude: form.destinationCity.center_longitude,
          courier_type: form.tariffType,
          weight: weight,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка расчета: ${response.status}`);
      }

      const data: TariffCalculationResponse = await response.json();
      console.log("Tariff calculation response:", data);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.calculationError);
      setErrorType(null); // Network errors are not translatable
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.originCity &&
    form.destinationCity &&
    form.tariffType &&
    form.weight.trim() !== "";

  // Check if calculation should be disabled due to warehouse requirements
  const isCalculationDisabled = shouldDisableCalculation(
    form.originCity,
    form.destinationCity,
    form.tariffType,
  );

  // Get warehouse warning
  const warehouseWarning = shouldShowWarehouseWarning(
    form.originCity,
    form.destinationCity,
    form.tariffType,
  );

  return {
    form,
    result,
    loading,
    error,
    updateForm,
    resetForm,
    calculateTariff,
    isFormValid,
    isCalculationDisabled,
    warehouseWarning,
  };
}
