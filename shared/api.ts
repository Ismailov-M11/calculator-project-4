/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Tariff calculator types
 */

export interface City {
  id: number;
  name: string;
  center_latitude: number;
  center_longitude: number;
  country_id: number;
  status: string;
}

export interface CitiesResponse {
  data: City[];
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  size?: number;
  number?: number;
}

export type TariffType =
  | "OFFICE_OFFICE"
  | "OFFICE_DOOR"
  | "DOOR_OFFICE"
  | "DOOR_DOOR"
  | "OFFICE_POSTAMAT"
  | "DOOR_POSTAMAT";

export interface TariffCalculationRequest {
  from_latitude: number;
  from_longitude: number;
  to_latitude: number;
  to_longitude: number;
  courier_type: TariffType;
  "dimensions.weight": number;
  "dimensions.width": number;
  "dimensions.length": number;
  "dimensions.height": number;
  "dimensions.unit": string;
  to_country_id: number;
  from_country_id: number;
  customerId: number;
  logistic_type: string;
  size: number;
  page: number;
}

export interface TariffPrice {
  id: number;
  name: string;
  courier_type: {
    type: string;
    icon: string;
    sort_order: number;
  };
  rule_id: number;
  has_supplier: boolean;
  price: {
    id: number;
    distance: number;
    duration: number;
    total: number;
    currency?: string;
    delivery_time_min?: number;
    delivery_time_max?: number;
  };
}

export interface TariffCalculationResponse {
  data: {
    total: number;
    list: TariffPrice[];
  };
}

export interface AuthResponse {
  id_token: string;
  expires_in: number;
}

export interface Warehouse {
  id: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  status: string;
  type: string;
}

export interface WarehousesResponse {
  data: Warehouse[];
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  size?: number;
  number?: number;
}

export interface TariffCalculatorForm {
  originCity: City | null;
  destinationCity: City | null;
  tariffType: TariffType | null;
  weight: string;
}

export interface RegionBasedTariffCalculatorForm {
  originCity: RegionCity | null;
  destinationCity: RegionCity | null;
  tariffType: TariffType | null;
  weight: string;
}

/**
 * Region and city types for region-based selection
 */
export interface Region {
  id: string;
  names: {
    uz: string;
    ru: string;
    en: string;
  };
}

export interface RegionCity {
  shipox_id: number;
  region_id: string;
  names: {
    uz: string;
    ru: string;
    en: string;
  };
}

export interface RegionsResponse {
  data: Region[];
}

export interface RegionCitiesResponse {
  data: RegionCity[];
}
