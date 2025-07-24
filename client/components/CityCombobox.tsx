import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
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
import { City } from "@shared/api";
import { useI18n } from "@/hooks/useI18n";

interface CityComboboxProps {
  value: City | null;
  onValueChange: (city: City | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CityCombobox({
  value,
  onValueChange,
  placeholder,
  disabled = false,
}: CityComboboxProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const url = search
          ? `/api/cities?search=${encodeURIComponent(search)}`
          : "/api/cities";
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          // Handle nested structure: data.data.list
          setCities(data.data?.list || data.data || []);
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

    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

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
              <span className="truncate">{value.name}</span>
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
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{loading ? t.loading : t.cityNotFound}</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={() => {
                    onValueChange(city);
                    setOpen(false);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {city.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value?.id === city.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
