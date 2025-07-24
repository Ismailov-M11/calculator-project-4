import { createContext, useContext } from "react";

export type Language = "ru" | "en" | "uz";

export interface Translations {
  // Calculator
  calculatorTitle: string;
  calculatorDescription: string;
  originCity: string;
  destinationCity: string;
  selectOriginCity: string;
  selectDestinationCity: string;
  tariffType: string;
  weight: string;
  weightPlaceholder: string;
  calculate: string;
  clear: string;

  // Validation
  fillAllFields: string;
  selectCitiesFirst: string;
  correctWeight: string;

  // Tariff types
  officeOffice: string;
  officeDoor: string;
  doorOffice: string;
  doorDoor: string;
  officePostamat: string;
  doorPostamat: string;

  // Warehouse warnings
  warehouseWarning: string;
  noOriginWarehouse: string;
  noDestinationWarehouse: string;
  noWarehouses: string;
  noOriginLocker: string;
  noDestinationLocker: string;
  noLockers: string;
  noOriginWarehouseAndDestinationLocker: string;

  // Results
  calculationResults: string;
  foundVariants: string;
  deliveryTime: string;
  days: string;
  noTariffsFound: string;
  tryChangeParams: string;
  calculationError: string;

  // Navigation
  calculator: string;
  warehouses: string;

  // City search
  citySearch: string;
  loading: string;
  cityNotFound: string;
  selectRegion: string;
  backToRegions: string;

  // Tables
  tableRates: string;
  tableZone: string;
  weightTable: string;
  toPointZone0: string;
  toPointZone1: string;
  toPointZone2: string;
  toPointZone3: string;
  pickupDeliveryCustomer: string;
  pickupDeliveryTashkent: string;
  toLocker: string;

  // Warehouse page
  warehousesAndLockers: string;
  searchPlaceholder: string;
  showAll: string;
  showWarehouses: string;
  showLockers: string;
  address: string;
  status: string;
  type: string;
  warehouse: string;
  locker: string;
  phone: string;
  coordinates: string;
  foundFrom: string;
  displayedCount: string;
  nothingFound: string;
  tryChangeFilters: string;
  mapTitle: string;
  displayed: string;
  objects: string;
  city: string;
  findNearest: string;
  foundCities: string;
  backToRegions: string;
  selectRegion: string;
  citySearch: string;
  swapCities: string;
}

const translations: Record<Language, Translations> = {
  ru: {
    calculatorTitle: "Расчет стоимости доставки",
    calculatorDescription:
      "Выберите города, тип тарифа и вес посылки для расчета",
    originCity: "Город отправления",
    destinationCity: "Город назначения",
    selectOriginCity: "Выберите город отправления",
    selectDestinationCity: "Выберите город назначения",
    tariffType: "Тип тарифа",
    weight: "Вес (кг)",
    weightPlaceholder: "Введите вес в килограммах",
    calculate: "Рассчитать стоимость",
    clear: "Очистить",

    fillAllFields: "Пожалуйста, заполните все поля",
    selectCitiesFirst: "Сначала выберите города отправления и назначения",
    correctWeight: "Пожалуйста, введите корректный вес",

    officeOffice: "Пункт  →  Пункт",
    officeDoor: "Пункт  →  Дверь",
    doorOffice: "Дверь  →  Пункт",
    doorDoor: "Дверь  →  Дверь",
    officePostamat: "Пункт  →  Постамат",
    doorPostamat: "Дверь  →  Постамат",

    warehouseWarning: "Предупреждение о пункте выдачи",
    noOriginWarehouse: 'В городе отправки "{city}" нет пункта выдачи Fargo',
    noDestinationWarehouse:
      'В городе доставки "{city}" нет пункта выдачи Fargo',
    noWarehouses: "В городах отправки и доставки нет пунктов выдачи Fargo",
    noOriginLocker: 'В городе отправки "{city}" нет постамата Fargo',
    noDestinationLocker: 'В городе доставки "{city}" нет постамата Fargo',
    noLockers: "В городах отправки и доставки нет постаматов Fargo",
    noOriginWarehouseAndDestinationLocker:
      'В городе отправки "{originCity}" нет пункта выдачи Fargo, а в городе доставки "{destinationCity}" нет постамата Fargo',

    calculationResults: "Результаты расчета",
    foundVariants: "Найдено {count} вариант(ов) доставки",
    deliveryTime: "Время доставки: {time} дн.",
    days: "дн.",
    noTariffsFound: "Тарифы не найдены",
    tryChangeParams: "Попробуйте изменить параметры поиска",
    calculationError: "Произошла ошибка при расчете тарифов",

    calculator: "Калькулятор",
    warehouses: "Пункты выдачи Fargo",

    citySearch: "Поиск города...",
    loading: "Загрузка...",
    cityNotFound: "Город не найден.",
    selectRegion: "Выберите область",
    backToRegions: "Назад к областям",

    tableRates: "Таблица - Тарифы",
    tableZone: "Таблица - Зоны",
    weightTable: "Вес",
    toPointZone0: "До пункта (Зона 0)",
    toPointZone1: "До пункта (Зона 1)",
    toPointZone2: "До пункта (Зона 2)",
    toPointZone3: "До пункта (Зона 3)",
    pickupDeliveryCustomer: "Забор/доставка от/до клиента",
    pickupDeliveryTashkent: "Забор/доставка по г. Ташкент",
    toLocker: "Постамат",

    warehousesAndLockers: "Пункты выдачи и постаматы",
    searchPlaceholder: "Поиск по городу или адресу...",
    showAll: "Все",
    showWarehouses: "Пункты выдачи",
    showLockers: "Постаматы",
    address: "Адрес",
    status: "Статус",
    type: "Тип",
    warehouse: "Пункт выдачи",
    locker: "Постамат",
    phone: "Телефон",
    coordinates: "Координаты",
    foundFrom: "Найдено: {count} из {total}",
    displayedCount: "Найдено: {count}",
    nothingFound: "Ничего не найдено",
    tryChangeFilters: "Попробуйте изменить фильтры или поисковый запрос",
    mapTitle: "Карта расположения",
    displayed: "Отображено",
    objects: "объектов",
    city: "Город",
    findNearest:
      "Найдите ближайший пункт выдачи или постамат FARGO в вашем городе",
    foundCities: "Найденные города",
    backToRegions: "Назад к областям",
    selectRegion: "Выберите область",
    citySearch: "Поиск города или области",
    swapCities: "Поменять местами",
  },

  en: {
    calculatorTitle: "Delivery Cost Calculator",
    calculatorDescription:
      "Select cities, tariff type and package weight for calculation",
    originCity: "Origin City",
    destinationCity: "Destination City",
    selectOriginCity: "Select origin city",
    selectDestinationCity: "Select destination city",
    tariffType: "Tariff Type",
    weight: "Weight (kg)",
    weightPlaceholder: "Enter weight in kilograms",
    calculate: "Calculate Cost",
    clear: "Clear",

    fillAllFields: "Please fill in all fields",
    selectCitiesFirst: "Please select origin and destination cities first",
    correctWeight: "Please enter a valid weight",

    officeOffice: "Office → Office",
    officeDoor: "Office → Door",
    doorOffice: "Door → Office",
    doorDoor: "Door → Door",
    officePostamat: "Office → Locker",
    doorPostamat: "Door → Locker",

    warehouseWarning: "Pickup Point Warning",
    noOriginWarehouse: 'No Fargo pickup point in origin city "{city}"',
    noDestinationWarehouse:
      'No Fargo pickup point in destination city "{city}"',
    noWarehouses: "No Fargo pickup points in origin and destination cities",
    noOriginLocker: 'No Fargo locker in origin city "{city}"',
    noDestinationLocker: 'No Fargo locker in destination city "{city}"',
    noLockers: "No Fargo lockers in origin and destination cities",
    noOriginWarehouseAndDestinationLocker:
      'No Fargo pickup point in origin city "{originCity}" and no locker in destination city "{destinationCity}"',

    calculationResults: "Calculation Results",
    foundVariants: "Found {count} delivery option(s)",
    deliveryTime: "Delivery time: {time} days",
    days: "days",
    noTariffsFound: "No tariffs found",
    tryChangeParams: "Try changing search parameters",
    calculationError: "An error occurred while calculating tariff",

    calculator: "Calculator",
    warehouses: "Fargo pickup points",

    citySearch: "Search city...",
    loading: "Loading...",
    cityNotFound: "City not found.",
    selectRegion: "Select region",
    backToRegions: "Back to regions",

    tableRates: "Table - Rates",
    tableZone: "Table - Zone",
    weightTable: "Weight",
    toPointZone0: "To point (Zone 0)",
    toPointZone1: "To point (Zone 1)",
    toPointZone2: "To point (Zone 2)",
    toPointZone3: "To point (Zone 3)",
    pickupDeliveryCustomer: "Pickup from customer / Delivery to customer",
    pickupDeliveryTashkent:
      "Pickup from customer / Delivery to customer Tashkent City",
    toLocker: "To locker",

    warehousesAndLockers: "Pickup points and Lockers",
    searchPlaceholder: "Search by city or address...",
    showAll: "All",
    showWarehouses: "Pickup points",
    showLockers: "Lockers",
    address: "Address",
    status: "Status",
    type: "Type",
    warehouse: "Pickup point",
    locker: "Locker",
    phone: "Phone",
    coordinates: "Coordinates",
    foundFrom: "Found: {count} of {total}",
    displayedCount: "Found: {count}",
    nothingFound: "Nothing found",
    tryChangeFilters: "Try changing filters or search query",
    mapTitle: "Location map",
    displayed: "Displayed",
    objects: "objects",
    city: "City",
    findNearest: "Find the nearest FARGO pickup point or locker in your city",
    foundCities: "Found Cities",
    backToRegions: "Back to Regions",
    selectRegion: "Select Region",
    citySearch: "Search city or region",
    swapCities: "Swap cities",
  },

  uz: {
    calculatorTitle: "Yetkazib berish narxini hisoblash",
    calculatorDescription:
      "Hisoblash uchun shaharlar, tarif turi va jo'natma og'irligini tanlang",
    originCity: "Jo'natish shahri",
    destinationCity: "Yetkazish shahri",
    selectOriginCity: "Jo'natish shahrini tanlang",
    selectDestinationCity: "Yetkazish shahrini tanlang",
    tariffType: "Tarif turi",
    weight: "Og'irligi (kg)",
    weightPlaceholder: "Og'irlikni kilogrammda kiriting",
    calculate: "Narxni hisoblash",
    clear: "Tozalash",

    fillAllFields: "Iltimos, barcha maydonlarni to'ldiring",
    selectCitiesFirst: "Avval jo'natish va yetkazish shaharlarini tanlang",
    correctWeight: "Iltimos, to'g'ri og'irlikni kiriting",

    officeOffice: "Punkt → Punkt",
    officeDoor: "Punkt → Eshik",
    doorOffice: "Eshik → Punkt",
    doorDoor: "Eshik → Eshik",
    officePostamat: "Punkt → Postamat",
    doorPostamat: "Eshik → Postamat",

    warehouseWarning: "Yetkazib berish punkti haqida ogohlantirish",
    noOriginWarehouse:
      "Jo'natish shahri \"{city}\"da Fargo yetkazib berish punkti yo'q",
    noDestinationWarehouse:
      'Yetkazish shahri "{city}"da Fargo yetkazib berish punkti yo\'q',
    noWarehouses:
      "Jo'natish va yetkazish shaharlarida Fargo yetkazib berish punktlari yo'q",
    noOriginLocker: "Jo'natish shahri \"{city}\"da Fargo postamati yo'q",
    noDestinationLocker: 'Yetkazish shahri "{city}"da Fargo postamati yo\'q',
    noLockers: "Jo'natish va yetkazish shaharlarida Fargo postamatlar yo'q",
    noOriginWarehouseAndDestinationLocker:
      'Jo\'natish shahri "{originCity}"da Fargo yetkazib berish punkti yo\'q va yetkazish shahri "{destinationCity}"da postamat yo\'q',

    calculationResults: "Hisoblash natijalari",
    foundVariants: "{count} ta yetkazib berish variantlari topildi",
    deliveryTime: "Yetkazib berish vaqti: {time} kun",
    days: "kun",
    noTariffsFound: "Tariflar topilmadi",
    tryChangeParams: "Qidiruv parametrlarini o'zgartirib ko'ring",
    calculationError: "Tarif hisoblashda xatolik yuz berdi",

    calculator: "Kalkulyator",
    warehouses: "Fargo yetkazib berish punktlari",

    citySearch: "Shahar qidirish...",
    loading: "Yuklanmoqda...",
    cityNotFound: "Shahar topilmadi.",
    selectRegion: "Viloyatni tanlang",
    backToRegions: "Viloyatlarga qaytish",

    tableRates: "Jadval - Tariflar",
    tableZone: "Jadval - Zonalar",
    weightTable: "Vazni",
    toPointZone0: "Punktgacha (Zone 0)",
    toPointZone1: "Punktgacha (Zone 1)",
    toPointZone2: "Punktgacha (Zone 2)",
    toPointZone3: "Punktgacha (Zone 3)",
    pickupDeliveryCustomer:
      "Klient qo'lidan olib ketish / klient qo'ligacha etkazish",
    pickupDeliveryTashkent: "Toshkent sh. ichida olib ketish / etkazish",
    toLocker: "Pochtamat",

    warehousesAndLockers: "Yetkazib berish punktlari va postamatlar",
    searchPlaceholder: "Shahar yoki manzil bo'yicha qidirish...",
    showAll: "Barchasi",
    showWarehouses: "Olish punktlari",
    showLockers: "Postamatlar",
    address: "Manzil",
    status: "Holati",
    type: "Turi",
    warehouse: "Olish punkti",
    locker: "Postamat",
    phone: "Telefon",
    coordinates: "Koordinatalar",
    foundFrom: "Topildi: {count} dan {total}",
    displayedCount: "Topildi: {count}",
    nothingFound: "Hech narsa topilmadi",
    tryChangeFilters: "Filtrlar yoki qidiruv so'rovini o'zgartirib ko'ring",
    mapTitle: "Joylashuv xaritasi",
    displayed: "Ko'rsatildi",
    objects: "obyektlar",
    city: "Shahar",
    findNearest:
      "Shahringizda eng yaqin FARGO olish punkti yoki postamatni toping",
    foundCities: "Topilgan shaharlar",
    backToRegions: "Viloyatlarga qaytish",
    selectRegion: "Viloyatni tanlang",
    citySearch: "Shahar yoki viloyat qidirish",
    swapCities: "Shaharlarni almashtirish",
  },
};

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatMessage: (
    template: string,
    variables: Record<string, string | number>,
  ) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(
  undefined,
);

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function formatMessage(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

export { translations };
