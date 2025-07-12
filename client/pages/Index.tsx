import { useState, useRef, useEffect } from "react";
import {
  Calculator,
  Package,
  MapPin,
  Truck,
  Weight,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RegionCityCombobox } from "@/components/RegionCityCombobox";
import { TariffResultSkeleton } from "@/components/LoadingSkeleton";
import { TariffTables } from "@/components/TariffTables";
import { useRegionBasedTariffCalculator } from "@/hooks/useRegionBasedTariffCalculator";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Navigation } from "@/components/Navigation";
import { Logo } from "@/components/Logo";
import { TariffType } from "@shared/api";

export default function Index() {
  const { t, language } = useI18n();
  const resultsRef = useRef<HTMLDivElement>(null);

  const getCityDisplayName = (city: any) => {
    if (!city) return "";
    // Check if it's a RegionCity with names object
    if (city.names) {
      return city.names[language] || city.names.en;
    }
    // Fallback to name property for regular City objects
    return city.name || "";
  };

  // Function to swap origin and destination cities
  const swapCities = () => {
    updateForm({
      originCity: form.destinationCity,
      destinationCity: form.originCity,
    });
  };
  const {
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
  } = useRegionBasedTariffCalculator();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDeliveryTime = (duration: number) => {
    // Convert duration from seconds to days
    const days = Math.ceil(duration / (24 * 60 * 60));
    return `${days} ${t.days}`;
  };

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (
      result &&
      result.data &&
      result.data.list &&
      result.data.list.length > 0 &&
      !loading &&
      resultsRef.current
    ) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // Small delay to ensure the results are fully rendered
    }
  }, [result, loading]);

  // Get localized tariff type names
  const getTariffTypes = () => [
    { value: "OFFICE_OFFICE", label: t.officeOffice },
    { value: "OFFICE_DOOR", label: t.officeDoor },
    { value: "DOOR_OFFICE", label: t.doorOffice },
    { value: "DOOR_DOOR", label: t.doorDoor },
    { value: "OFFICE_POSTAMAT", label: t.officePostamat },
    { value: "DOOR_POSTAMAT", label: t.doorPostamat },
  ];

  // Get tariff name - use API name if available, otherwise fallback to localized name
  const getTariffName = (tariff: any) => {
    // For Russian language, prefer API name if available
    if (t.calculatorTitle.includes("Расчет") && tariff.name) {
      return tariff.name;
    }

    // For other languages or if no API name, use localized fallback
    const tariffTypes = getTariffTypes();
    const tariffType = tariffTypes.find(
      (type) => type.value === tariff.courier_type?.type,
    );
    return tariffType ? tariffType.label : tariff.name || "Доставка";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container">
          <div className="py-4 flex items-center gap-3">
            <Logo />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate hidden sm:block">
                {t.calculatorTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {t.calculatorDescription}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Navigation />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="py-4 sm:py-8 max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Form Card */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-center">
                {t.calculatorTitle}
              </CardTitle>
              <CardDescription className="text-center text-sm">
                {t.calculatorDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Cities Selection */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-16">
                  <div className="space-y-3 lg:max-w-sm">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-700" />
                      {t.originCity}
                    </Label>
                    <RegionCityCombobox
                      value={form.originCity}
                      onValueChange={(city) => updateForm({ originCity: city })}
                      placeholder={t.selectOriginCity}
                    />
                  </div>

                  {/* Swap Button - Desktop: between columns, Mobile: between rows */}
                  <div className="lg:hidden flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={swapCities}
                      disabled={!form.originCity && !form.destinationCity}
                      className="h-10 w-10 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
                      title={t.swapCities}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 lg:max-w-sm">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      {t.destinationCity}
                    </Label>
                    <RegionCityCombobox
                      value={form.destinationCity}
                      onValueChange={(city) =>
                        updateForm({ destinationCity: city })
                      }
                      placeholder={t.selectDestinationCity}
                    />
                  </div>
                </div>

                {/* Swap Button - Desktop: centered between columns */}
                <div className="hidden lg:flex justify-center relative">
                  <div className="absolute -top-16">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={swapCities}
                      disabled={!form.originCity && !form.destinationCity}
                      className="h-10 w-10 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 shadow-md bg-white"
                      title={t.swapCities}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Route Display */}
              {form.originCity && form.destinationCity && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  {/* Desktop/Tablet: Horizontal Layout */}
                  <div className="hidden sm:flex items-center justify-center gap-3 text-sm font-medium">
                    <Badge
                      variant="default"
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-center"
                    >
                      {getCityDisplayName(form.originCity)}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-red-600 shrink-0" />
                    <Badge
                      variant="default"
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-center"
                    >
                      {getCityDisplayName(form.destinationCity)}
                    </Badge>
                  </div>
                  {/* Mobile: Vertical Layout */}
                  <div className="flex sm:hidden flex-col items-center gap-2 text-sm font-medium">
                    <Badge
                      variant="default"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-center max-w-xs inline-block"
                    >
                      <span className="break-words">
                        {getCityDisplayName(form.originCity)}
                      </span>
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-red-600 shrink-0 rotate-90" />
                    <Badge
                      variant="default"
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-center max-w-xs inline-block"
                    >
                      <span className="break-words">
                        {getCityDisplayName(form.destinationCity)}
                      </span>
                    </Badge>
                  </div>
                </div>
              )}

              <Separator />

              {/* Tariff Type and Weight */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-slate-700" />
                    {t.tariffType}
                  </Label>
                  <Select
                    value={form.tariffType || ""}
                    onValueChange={(value) =>
                      updateForm({ tariffType: value as TariffType })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t.tariffType} />
                    </SelectTrigger>
                    <SelectContent>
                      {getTariffTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="font-medium">{type.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Weight className="h-4 w-4 text-red-600" />
                    {t.weight}
                  </Label>
                  <Input
                    type="number"
                    placeholder={t.weightPlaceholder}
                    value={form.weight}
                    onChange={(e) => updateForm({ weight: e.target.value })}
                    min="0.1"
                    step="0.1"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Warehouse Warning */}
              {warehouseWarning.show && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
                    <div>
                      <p className="text-amber-800 text-sm font-medium">
                        {t.warehouseWarning}
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        {warehouseWarning.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    calculateTariff();
                  }}
                  disabled={
                    !isFormValid() || loading || isCalculationDisabled()
                  }
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-slate-800 to-red-600 hover:from-slate-900 hover:to-red-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t.calculate}...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      {t.calculate}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="h-11 sm:h-12 px-6"
                  disabled={loading}
                >
                  {t.clear}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  {t.calculate}...
                </CardTitle>
                <CardDescription>{t.calculatorDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <TariffResultSkeleton />
              </CardContent>
            </Card>
          )}

          {/* Results Card */}
          {result &&
            result.data &&
            result.data.list &&
            result.data.list.length > 0 &&
            !loading && (
              <Card
                ref={resultsRef}
                className="border-0 shadow-xl bg-white/90 backdrop-blur-sm"
              >
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    {t.calculationResults}
                  </CardTitle>
                  <CardDescription>{t.calculatorDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {result.data.list.map((tariff, index) => (
                      <div
                        key={tariff.id || index}
                        className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                          <div className="space-y-1 min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg">
                              {getTariffName(tariff)}
                            </h3>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">
                              {formatPrice(tariff.price.total)}
                            </div>
                            <div className="text-xs text-gray-500">UZS</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* No Results */}
          {result &&
            result.data &&
            result.data.list &&
            result.data.list.length === 0 &&
            !loading && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t.noTariffsFound}
                  </h3>
                  <p className="text-gray-600">{t.tryChangeParams}</p>
                </CardContent>
              </Card>
            )}

          {/* Tariff Tables */}
          <TariffTables />
        </div>
      </div>
    </div>
  );
}
