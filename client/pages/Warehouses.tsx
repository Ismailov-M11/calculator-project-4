import React, { useState, useEffect } from "react";
import { MapPin, Search, Filter, Building, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Warehouse } from "@shared/api";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Navigation } from "@/components/Navigation";
import { Logo } from "@/components/Logo";

type FilterType = "all" | "warehouse" | "locker";

function YandexMap({
  warehouses,
  selectedItems,
}: {
  warehouses: Warehouse[];
  selectedItems: Warehouse[];
}) {
  const { t } = useI18n();

  useEffect(() => {
    // Load Yandex Maps API
    const script = document.createElement("script");
    script.src =
      "https://api-maps.yandex.ru/2.1/?apikey=e0d28efd-ef86-451e-a276-c38260877cbb&lang=ru_RU";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      ymaps.ready(() => {
        // @ts-ignore
        const myMap = new ymaps.Map("yandex-map", {
          center: [41.311081, 69.240562], // Tashkent coordinates
          zoom: 7,
        });

        // Clear existing points
        myMap.geoObjects.removeAll();

        // Add warehouses (red markers)
        selectedItems
          .filter((item) => item.type === "POST_OFFICE")
          .forEach((point) => {
            if (point.lat && point.lon) {
              // @ts-ignore
              const placemark = new ymaps.Placemark(
                [point.lat, point.lon],
                {
                  balloonContent: `<b>${point.name}</b><br>${point.address || ""}<br>Город: ${point.city}`,
                },
                {
                  preset: "islands#icon",
                  iconColor: "#ff0000", // Red for warehouses
                },
              );
              myMap.geoObjects.add(placemark);
            }
          });

        // Add lockers (blue markers)
        selectedItems
          .filter((item) => item.type === "LOCKER")
          .forEach((point) => {
            if (point.lat && point.lon) {
              // @ts-ignore
              const placemark = new ymaps.Placemark(
                [point.lat, point.lon],
                {
                  balloonContent: `<b>${point.name}</b><br>${point.address || ""}<br>Город: ${point.city}`,
                },
                {
                  preset: "islands#icon",
                  iconColor: "#0095b6", // Blue for lockers
                },
              );
              myMap.geoObjects.add(placemark);
            }
          });

        // Auto-fit map bounds if there are points
        if (selectedItems.length > 0) {
          const coords = selectedItems
            .filter((item) => item.lat && item.lon)
            .map((item) => [item.lat, item.lon]);

          if (coords.length > 0) {
            myMap.setBounds(myMap.geoObjects.getBounds(), {
              checkZoomRange: true,
            });
          }
        }
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [selectedItems]);

  return (
    <div className="w-full h-full min-h-[400px] lg:h-[500px] rounded-lg overflow-hidden border">
      <div id="yandex-map" className="w-full h-full" />
    </div>
  );
}

export default function Warehouses() {
  const { t, formatMessage } = useI18n();
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting fetch data...");
      setLoading(true);
      setError(null);

      try {
        const allItems: Warehouse[] = [];

        // Fetch warehouses
        console.log("Fetching warehouses...");
        const warehousesResponse = await fetch("/api/warehouses");
        if (warehousesResponse.ok) {
          const warehousesData = await warehousesResponse.json();
          console.log("Warehouses response:", warehousesData);
          const warehouses = warehousesData.data || [];
          allItems.push(...warehouses);
          console.log("Added warehouses:", warehouses.length);
        } else {
          console.error(
            "Failed to fetch warehouses:",
            warehousesResponse.status,
          );
        }

        // Fetch lockers
        console.log("Fetching lockers...");
        const lockersResponse = await fetch("/api/lockers");
        if (lockersResponse.ok) {
          const lockersData = await lockersResponse.json();
          console.log("Lockers response:", lockersData);
          const lockers = lockersData.data || [];
          allItems.push(...lockers);
          console.log("Added lockers:", lockers.length);
        } else {
          console.error("Failed to fetch lockers:", lockersResponse.status);
        }

        console.log("Total items:", allItems.length);
        setAllWarehouses(allItems);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = () => {
    let items = allWarehouses;

    // Filter by type
    if (filterType === "warehouse") {
      items = items.filter((item) => item.type === "POST_OFFICE");
    } else if (filterType === "locker") {
      items = items.filter((item) => item.type === "LOCKER");
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.city.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower) ||
          item.address?.toLowerCase().includes(searchLower),
      );
    }

    return items;
  };

  const selectedItems = filteredItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container">
            <div className="py-4 flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fb7fed7c8ef1d42a2b3043b6730b6b9cb%2F7c8299f51f074291865f9830b9ae00ec?format=webp&width=800"
                  alt="FARGO"
                  className="h-8 w-auto sm:h-10"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate hidden sm:block">
                  {t.warehousesAndLockers}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Navigation />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Ошибка</div>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container">
          <div className="py-4 flex items-center gap-3">
            <Logo />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate hidden sm:block">
                {t.warehousesAndLockers}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {t.findNearest}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Navigation />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {t.warehousesAndLockers}
          </h2>
          <p className="text-slate-600">{t.findNearest}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Filters and List */}
          <div className="flex flex-col space-y-4 h-[70vh] lg:h-[600px]">
            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(value: FilterType) => setFilterType(value)}
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.showAll}</SelectItem>
                  <SelectItem value="warehouse">{t.showWarehouses}</SelectItem>
                  <SelectItem value="locker">{t.showLockers}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600">
              {formatMessage(t.displayedCount, {
                count: selectedItems.length,
              })}
            </div>

            {/* Items List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[50vh] lg:max-h-[480px]">
              {selectedItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === "POST_OFFICE" ? (
                          <Building className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Package className="h-5 w-5 text-red-600" />
                        )}
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                      </div>
                      <Badge
                        variant={
                          item.type === "POST_OFFICE" ? "default" : "secondary"
                        }
                        className="text-center"
                      >
                        {item.type === "POST_OFFICE" ? t.warehouse : t.locker}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{item.city}</span>
                      </div>
                      {item.address && (
                        <p className="text-sm text-slate-700">{item.address}</p>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      {item.lat && item.lon && (
                        <div className="text-xs text-slate-500">
                          {t.coordinates}: {item.lat.toFixed(4)},{" "}
                          {item.lon.toFixed(4)}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {t.status}:
                        </span>
                        <Badge
                          variant={
                            item.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t.nothingFound}</p>
                  <p className="text-sm text-gray-500">{t.tryChangeFilters}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Map */}
          <div className="lg:sticky lg:top-4">
            <Card className="lg:h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t.mapTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-full">
                  <YandexMap
                    warehouses={allWarehouses}
                    selectedItems={selectedItems}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
