import { City, RegionCity } from "@shared/api";
import { Language } from "@/hooks/useI18n";

/**
 * Converts a RegionCity to a City format for use with existing APIs
 */
export function regionCityToCity(
  regionCity: RegionCity,
  language: Language,
): City {
  const cityName =
    regionCity.names[language as keyof typeof regionCity.names] ||
    regionCity.names.en;

  return {
    id: regionCity.shipox_id,
    name: cityName,
    center_latitude: 0, // These would need to be fetched from the original API if needed
    center_longitude: 0,
    country_id: 234, // Uzbekistan country ID
    status: "active",
  };
}

/**
 * Gets the localized name for a RegionCity
 */
export function getLocalizedCityName(
  regionCity: RegionCity,
  language: Language,
): string {
  return (
    regionCity.names[language as keyof typeof regionCity.names] ||
    regionCity.names.en
  );
}
