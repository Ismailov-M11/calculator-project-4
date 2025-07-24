import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Region, RegionCity } from "@shared/api";
import { useI18n } from "@/hooks/useI18n";

interface RegionCityComboboxProps {
  value: RegionCity | null;
  onValueChange: (city: RegionCity | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RegionCityCombobox({
  value,
  onValueChange,
  placeholder,
  disabled = false,
}: RegionCityComboboxProps) {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [cities, setCities] = useState<RegionCity[]>([]);
  const [allCities, setAllCities] = useState<RegionCity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // Fetch regions and all cities on component mount
  useEffect(() => {
    const fetchData = async () => {
      setRegionsLoading(true);
      try {
        // Fetch regions
        const regionsResponse = await fetch("/api/regions");
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          setRegions(regionsData.data || []);

          // Fetch all cities from all regions for direct search
          const allRegions = regionsData.data || [];
          const allCitiesData: RegionCity[] = [];

          for (const region of allRegions) {
            try {
              const citiesResponse = await fetch(
                `/api/regions/${region.id}/cities`,
              );
              if (citiesResponse.ok) {
                const citiesData = await citiesResponse.json();
                allCitiesData.push(...(citiesData.data || []));
              }
            } catch (error) {
              console.error(
                `Error fetching cities for region ${region.id}:`,
                error,
              );
            }
          }

          setAllCities(allCitiesData);
        } else {
          console.error("Failed to fetch regions:", regionsResponse.status);
          setRegions([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRegions([]);
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch cities when region is selected
  useEffect(() => {
    if (!selectedRegion) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/regions/${selectedRegion.id}/cities`,
        );
        if (response.ok) {
          const data = await response.json();
          setCities(data.data || []);
        } else {
          console.error("Failed to fetch cities:", response.status);
          setCities([]);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [selectedRegion]);

  // Update selected region when value changes
  useEffect(() => {
    if (value && !selectedRegion) {
      const region = regions.find((r) => r.id === value.region_id);
      if (region) {
        setSelectedRegion(region);
      }
    }
  }, [value, regions, selectedRegion]);

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    // Clear current city selection when region changes
    if (value && value.region_id !== region.id) {
      onValueChange(null);
    }
  };

  const handleCitySelect = (city: RegionCity) => {
    onValueChange(city);
    setOpen(false);
  };

  const getRegionName = (region: Region): string => {
    return (
      region.names[language as keyof typeof region.names] || region.names.en
    );
  };

  const getCityName = (city: RegionCity): string => {
    return city.names[language as keyof typeof city.names] || city.names.en;
  };

  // Multi-language search function with text normalization
  const searchCities = (query: string): RegionCity[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();

    return allCities.filter((city) => {
      // Get all language variants and normalize them
      const uzName = (city.names.uz?.toLowerCase() || "").replace(
        /[^a-zA-Zа-яё\s]/g,
        "",
      );
      const ruName = (city.names.ru?.toLowerCase() || "").replace(
        /[^a-zA-Zа-яё\s]/g,
        "",
      );
      const enName = (city.names.en?.toLowerCase() || "").replace(
        /[^a-zA-Zа-яё\s]/g,
        "",
      );

      // Also create versions without common suffixes/prefixes
      const uzCore = uzName.replace(/(shahri|tumani|viloyati)/g, "").trim();
      const ruCore = ruName
        .replace(/(город|район|область|области)/g, "")
        .trim();
      const enCore = enName.replace(/(city|district|region)/g, "").trim();

      // Search in original names and core names
      return (
        uzName.includes(searchTerm) ||
        ruName.includes(searchTerm) ||
        enName.includes(searchTerm) ||
        uzCore.includes(searchTerm) ||
        ruCore.includes(searchTerm) ||
        enCore.includes(searchTerm) ||
        // Also search by words (for partial matches)
        uzName.split(" ").some((word) => word.startsWith(searchTerm)) ||
        ruName.split(" ").some((word) => word.startsWith(searchTerm)) ||
        enName.split(" ").some((word) => word.startsWith(searchTerm))
      );
    });
  };

  // Auto-select region when city is found
  const handleDirectCitySelect = (city: RegionCity) => {
    const region = regions.find((r) => r.id === city.region_id);
    if (region) {
      setSelectedRegion(region);
    }
    onValueChange(city);
    setOpen(false);
    setSearchQuery("");
  };

  // Clear selection
  const handleClear = () => {
    onValueChange(null);
    setSelectedRegion(null);
    setCities([]);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 text-left font-normal"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            {value ? (
              <span className="truncate">{getCityName(value)}</span>
            ) : (
              <span className="text-muted-foreground truncate">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] max-w-sm p-0"
        side="bottom"
        align="start"
        avoidCollisions={false}
        collisionPadding={0}
      >
        <Command>
          <CommandInput
            placeholder={t.citySearch}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {regionsLoading || loading ? t.loading : t.cityNotFound}
            </CommandEmpty>

            {/* Clear selection option */}
            {(value || selectedRegion) && (
              <CommandGroup>
                <CommandItem
                  key="clear-selection"
                  onSelect={handleClear}
                  className="text-muted-foreground"
                >
                  ✕ {t.clear || "Clear selection"}
                </CommandItem>
              </CommandGroup>
            )}

            {/* Direct city search results */}
            {searchQuery.trim() &&
              (() => {
                const foundCities = searchCities(searchQuery);
                if (foundCities.length > 0) {
                  return (
                    <CommandGroup heading={t.foundCities || "Found Cities"}>
                      {foundCities.slice(0, 10).map((city) => {
                        const region = regions.find(
                          (r) => r.id === city.region_id,
                        );
                        return (
                          <CommandItem
                            key={city.shipox_id}
                            value={`${getCityName(city)} ${getRegionName(region!)}`}
                            onSelect={() => handleDirectCitySelect(city)}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                              <span>{getCityName(city)}</span>
                              <span className="text-xs text-muted-foreground">
                                {region ? getRegionName(region) : ""}
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                value?.shipox_id === city.shipox_id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                }
                return null;
              })()}

            {/* Regions section */}
            {!selectedRegion && !searchQuery.trim() && (
              <CommandGroup heading={t.selectRegion || "Select Region"}>
                {regions.map((region) => (
                  <CommandItem
                    key={region.id}
                    value={getRegionName(region)}
                    onSelect={() => handleRegionSelect(region)}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {getRegionName(region)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Cities section */}
            {selectedRegion && !searchQuery.trim() && (
              <>
                <CommandGroup heading={getRegionName(selectedRegion)}>
                  <CommandItem
                    key="back-to-regions"
                    onSelect={() => {
                      setSelectedRegion(null);
                      setCities([]);
                      if (value) {
                        onValueChange(null);
                      }
                    }}
                    className="text-muted-foreground"
                  >
                    ← {t.backToRegions || "Back to regions"}
                  </CommandItem>
                </CommandGroup>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.shipox_id}
                      value={getCityName(city)}
                      onSelect={() => handleCitySelect(city)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {getCityName(city)}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value?.shipox_id === city.shipox_id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
