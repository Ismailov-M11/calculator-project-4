import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

// Rates table data
const ratesData = [
  {
    weight: 1,
    zone0: 20000,
    zone1: 25000,
    zone2: 30000,
    zone3: 35000,
    customer: 35000,
    tashkent: 15000,
    locker: 20000,
  },
  {
    weight: 2,
    zone0: 25000,
    zone1: 30000,
    zone2: 35000,
    zone3: 40000,
    customer: 40000,
    tashkent: 20000,
    locker: null,
  },
  {
    weight: 3,
    zone0: 30000,
    zone1: 35000,
    zone2: 40000,
    zone3: 45000,
    customer: 45000,
    tashkent: 25000,
    locker: null,
  },
  {
    weight: 4,
    zone0: 35000,
    zone1: 40000,
    zone2: 45000,
    zone3: 50000,
    customer: 50000,
    tashkent: 30000,
    locker: null,
  },
  {
    weight: 5,
    zone0: 40000,
    zone1: 45000,
    zone2: 50000,
    zone3: 55000,
    customer: 55000,
    tashkent: 35000,
    locker: null,
  },
  {
    weight: 6,
    zone0: 45000,
    zone1: 50000,
    zone2: 55000,
    zone3: 60000,
    customer: 60000,
    tashkent: 40000,
    locker: null,
  },
  {
    weight: 7,
    zone0: 50000,
    zone1: 55000,
    zone2: 60000,
    zone3: 65000,
    customer: 65000,
    tashkent: 45000,
    locker: null,
  },
  {
    weight: 8,
    zone0: 55000,
    zone1: 60000,
    zone2: 65000,
    zone3: 70000,
    customer: 70000,
    tashkent: 50000,
    locker: null,
  },
  {
    weight: 9,
    zone0: 60000,
    zone1: 65000,
    zone2: 70000,
    zone3: 75000,
    customer: 75000,
    tashkent: 55000,
    locker: null,
  },
  {
    weight: 10,
    zone0: 65000,
    zone1: 70000,
    zone2: 75000,
    zone3: 80000,
    customer: 80000,
    tashkent: 60000,
    locker: null,
  },
  {
    weight: 11,
    zone0: 70000,
    zone1: 75000,
    zone2: 80000,
    zone3: 85000,
    customer: 85000,
    tashkent: 65000,
    locker: null,
  },
  {
    weight: 12,
    zone0: 75000,
    zone1: 80000,
    zone2: 85000,
    zone3: 90000,
    customer: 90000,
    tashkent: 70000,
    locker: null,
  },
  {
    weight: 13,
    zone0: 80000,
    zone1: 85000,
    zone2: 90000,
    zone3: 95000,
    customer: 95000,
    tashkent: 75000,
    locker: null,
  },
  {
    weight: 14,
    zone0: 85000,
    zone1: 90000,
    zone2: 95000,
    zone3: 100000,
    customer: 100000,
    tashkent: 80000,
    locker: null,
  },
  {
    weight: 15,
    zone0: 90000,
    zone1: 95000,
    zone2: 100000,
    zone3: 105000,
    customer: 105000,
    tashkent: 85000,
    locker: null,
  },
  {
    weight: 16,
    zone0: 95000,
    zone1: 100000,
    zone2: 105000,
    zone3: 110000,
    customer: 110000,
    tashkent: 90000,
    locker: null,
  },
  {
    weight: 17,
    zone0: 100000,
    zone1: 105000,
    zone2: 110000,
    zone3: 115000,
    customer: 115000,
    tashkent: 95000,
    locker: null,
  },
  {
    weight: 18,
    zone0: 105000,
    zone1: 110000,
    zone2: 115000,
    zone3: 120000,
    customer: 120000,
    tashkent: 100000,
    locker: null,
  },
  {
    weight: 19,
    zone0: 110000,
    zone1: 115000,
    zone2: 120000,
    zone3: 125000,
    customer: 125000,
    tashkent: 105000,
    locker: null,
  },
  {
    weight: 20,
    zone0: 115000,
    zone1: 120000,
    zone2: 125000,
    zone3: 130000,
    customer: 130000,
    tashkent: 110000,
    locker: null,
  },
];

// Cities for zone table
const cities = [
  "Ташкент",
  "Чирчик",
  "Ангрен",
  "Гулистан",
  "Джизак",
  "Самарканд",
  "Каттакурган",
  "Фергана",
  "Коканд",
  "Наманган",
  "Андижан",
  "Карши",
  "Шахрисабз",
  "Термез",
  "Денау",
  "Бухара",
  "Гиждуван",
  "Навои",
  "Зарафшан",
  "Ургенч",
  "Нукус",
];

const citiesUz = [
  "Toshkent",
  "Chirchiq",
  "Angren",
  "Guliston",
  "Jizzax",
  "Samarqand",
  "Kattaqo'rg'on",
  "Farg'ona",
  "Qo'qon",
  "Namangan",
  "Andijon",
  "Qarshi",
  "Shahrisabz",
  "Termiz",
  "Denov",
  "Buxoro",
  "G'ijduvon",
  "Navoiy",
  "Zarafshon",
  "Urganch",
  "Nukus",
];

const citiesEn = [
  "Tashkent",
  "Chirchiq",
  "Angren",
  "Gulistan",
  "Jizzak",
  "Samarkand",
  "Kattakurgan",
  "Fergana",
  "Kokand",
  "Namangan",
  "Andijan",
  "Karshi",
  "Shahrisabz",
  "Termez",
  "Denau",
  "Bukhara",
  "Gijduvan",
  "Navoi",
  "Zarafshan",
  "Urgench",
  "Nukus",
];

// Zone matrix data
const zoneMatrix = [
  [0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 3, 3, 3],
  [1, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [1, 2, 0, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 2, 3, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3],
  [2, 2, 3, 2, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3],
  [2, 3, 3, 2, 2, 0, 1, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 3, 3, 3],
  [2, 3, 3, 2, 2, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3],
  [2, 3, 2, 3, 3, 3, 3, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 3, 2, 3, 3, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 3, 2, 3, 3, 3, 3, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 3, 2, 3, 3, 3, 3, 1, 1, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 0, 2, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 3, 3, 3, 3, 3, 3],
  [2, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1, 2, 3, 3, 3],
  [2, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 2, 3, 3, 3],
  [2, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 0, 2, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
];

function formatPrice(price: number | null): string {
  if (price === null) return "-";
  return price.toLocaleString();
}

function getZoneColor(zone: number): string {
  const colors = [
    "rgb(255, 255, 255)", // 0 - белый
    "rgb(255, 200, 200)", // 1 - светло-красный
    "rgb(255, 150, 150)", // 2 - средне-красный
    "rgb(255, 50, 50)", // 3 - темно-красный
  ];
  return colors[zone] || "rgb(255, 255, 255)";
}

export function TariffTables() {
  const { t, language } = useI18n();

  const getCityNames = () => {
    switch (language) {
      case "uz":
        return citiesUz;
      case "en":
        return citiesEn;
      default:
        return cities;
    }
  };

  const getMainTitle = () => {
    switch (language) {
      case "ru":
        return "Тарифы";
      case "uz":
        return "Tariflar";
      case "en":
        return "Rates";
      default:
        return "Тарифы";
    }
  };

  const getMainSubtitle = () => {
    switch (language) {
      case "ru":
        return "Стоимость услуг курьерской службы в Республике Узбекистан (без учёта НДС)";
      case "uz":
        return "O'zbekiston Respublikasida kuryer xizmatlari qiymati (QQSsiz)";
      case "en":
        return "The cost of courier services in the Republic of Uzbekistan (Excluding VAT)";
      default:
        return "Стоимость услуг курьерской службы в Республике Узбекистан (без учёта НДС)";
    }
  };

  const getDeliveryZonesTitle = () => {
    switch (language) {
      case "ru":
        return "Зоны доставки";
      case "uz":
        return "Yetkazib berish zonalari";
      case "en":
        return "Delivery Zones";
      default:
        return "Зоны доставки";
    }
  };

  const getAdditionalServicesTitle = () => {
    switch (language) {
      case "ru":
        return "Стоимость дополнительных услуг";
      case "uz":
        return "Qo'shimcha xizmatlar narxi";
      case "en":
        return "Additional Services Cost";
      default:
        return "Стоимость дополнительных услуг";
    }
  };

  const getCodServiceText = () => {
    switch (language) {
      case "ru":
        return {
          title: "Приём наложенного платежа",
          cost: "Стоимость: 3% (с учетом НДС 12%)",
          description: "От общей суммы принятых наложенных платежей.",
        };
      case "uz":
        return {
          title: "Naqd pul orqali to'lov qabul qilish (COD)",
          cost: "Narxi: 3% (QQS 12% bilan)",
          description:
            "Qabul qilingan naqd to'lovlar umumiy summasidan olinadi.",
        };
      case "en":
        return {
          title: "Cash on Delivery (COD) Collection",
          cost: "Cost: 3% (incl. 12% VAT)",
          description: "From the total amount of collected COD payments.",
        };
      default:
        return {
          title: "Приём наложенного платежа",
          cost: "Стоимость: 3% (с учетом НДС 12%)",
          description: "От общей суммы принятых наложенных платежей.",
        };
    }
  };

  const getDeclaredValueText = () => {
    switch (language) {
      case "ru":
        return {
          title: "Надбавка за стоимость",
          cost: "Стоимость: 1% (без учета НДС 12%)",
          description:
            "Дополнительный платеж, уплачиваемый Заказчиком Исполнителю при оглашении стоимости почтового отправления. Расчет размера дополнительного платежа производится по формуле - дополнительный платеж от стоимости (суммы) = 1% x объявленная стоимость (сумма).",
        };
      case "uz":
        return {
          title: "Qiymat uchun qo'shimcha to'lov",
          cost: "Narxi: 1% (QQS 12% holda)",
          description:
            "Buyurtmachi tomonidan yuborilgan posilkaga qiymat e'lon qilinganda to'lanadigan qo'shimcha to'lov. Hisoblash formulasi: qo'shimcha to'lov = 1% × e'lon qilingan qiymat.",
        };
      case "en":
        return {
          title: "Declared Value Surcharge",
          cost: "Cost: 1% (excluding 12% VAT)",
          description:
            "An additional charge payable by the Customer to the Contractor when declaring the value of the shipment. The surcharge amount is calculated using the formula: surcharge = 1% × declared value.",
        };
      default:
        return {
          title: "Надбавка за стоимость",
          cost: "Стоимость: 1% (без учета НДС 12%)",
          description:
            "Дополнительный платеж, уплачиваемый Заказчиком Исполнителю при оглашении стоимости почтового отправления. Расчет размера дополнительного платежа производится по формуле - дополнительный платеж от стоимости (суммы) = 1% x объявленная стоимость (сумма).",
        };
    }
  };

  const getVolumetricWeightText = () => {
    switch (language) {
      case "ru":
        return {
          title: "Объемный вес",
          description:
            "Некоторые предметы имеют небольшой вес, но отличаются большим объемом. Если объемный вес превышает физический, то тариф на доставку определяется в соответствии с объемным весом, который рассчитывается по следующей формуле:",
          formula:
            "Объемный вес (кг) = (длина (см) х ширина (см) х высота (см)) / 6000",
        };
      case "uz":
        return {
          title: "Hajmiy og'irlik",
          description:
            "Ba'zi mahsulotlar kichik og'irlikka ega, lekin hajmi katta bo'lishi mumkin. Agar hajmiy og'irlik haqiqiy og'irlikdan oshsa, tarif hajmiy og'irlik asosida hisoblanadi. Formulasi:",
          formula:
            "Hajmiy og'irlik (kg) = (uzunlik (sm) × kenglik (sm) × balandlik (sm)) / 6000",
        };
      case "en":
        return {
          title: "Volumetric Weight",
          description:
            "Some items have a small actual weight but large dimensions. If the volumetric weight exceeds the actual weight, the delivery rate is calculated based on the volumetric weight using the formula:",
          formula:
            "Volumetric weight (kg) = (length (cm) × width (cm) × height (cm)) / 6000",
        };
      default:
        return {
          title: "Объемный вес",
          description:
            "Некоторые предметы имеют небольшой вес, но отличаются большим объемом. Если объемный вес превышает физический, то тариф на доставку определяется в соответствии с объёмным весом, который рассчитывается по следующей формуле:",
          formula:
            "Объемный вес (кг) = (длина (см) х ширина (см) х высота (см)) / 6000",
        };
    }
  };

  const getDeliveryRatesText = () => {
    switch (language) {
      case "ru":
        return {
          title:
            "Во всех действующих тарифах используется следующая логика подсчета стоимости доставки за каждый килограмм:",
          rates: [
            "от 1 кг до 99 кг – каждый килограмм по 5000 сум",
            "от 100 кг до 499 кг – каждый килограмм по 4000 сум",
            "от 500 кг до 1500 кг – каждый килограмм по 3000 сум",
          ],
        };
      case "uz":
        return {
          title: "Har kilogramm uchun yetkazib berish narxlari:",
          rates: [
            "1 kg dan 99 kg gacha — har kg uchun 5 000 so'm",
            "100 kg dan 499 kg gacha — har kg uchun 4 000 so'm",
            "500 kg dan 1500 kg gacha — har kg uchun 3 000 so'm",
          ],
        };
      case "en":
        return {
          title: "Delivery Rates Per Kilogram:",
          rates: [
            "from 1 kg to 99 kg — 5,000 UZS per kg",
            "from 100 kg to 499 kg — 4,000 UZS per kg",
            "from 500 kg to 1500 kg — 3,000 UZS per kg",
          ],
        };
      default:
        return {
          title:
            "Во всех действующих тарифах используется следующая логика подсчёта стоимости доставки за каждый килограмм:",
          rates: [
            "от 1 кг до 99 кг – каждый килограмм по 5000 сум",
            "от 100 кг до 499 кг – каждый килограмм по 4000 сум",
            "от 500 кг до 1500 кг – каждый килограмм по 3000 сум",
          ],
        };
    }
  };

  const getNotesText = () => {
    switch (language) {
      case "ru":
        return {
          title: "ПРИМЕЧАНИЕ:",
          notes: [
            "Каждое Отправление тарифицируется по отдельности. В стоимость включена одна попытка доставки Отправления;",
            "Если получатель отсутствует по адресу доставки или не может принять Отправление по другим, не зависящим от курьера причинам, то каждый последующий приезд курьера тарифицируется как новая отдельная заявка на доставку;",
            "Если Получатель изменил адрес доставки и просит доставить по другому адресу, то перенаправление посылки по новому адресу, будет тарифицироваться как отдельная заявка на доставку;",
            "Вес одного места Отправления не должен превышать - 30 кг;",
            "Если при вызове курьера Отправитель откажется передавать Отправление к доставке, Заказчик должен оплатить за ложный вызов курьера 25 000 сум без НДС (28 000 с НДС)",
          ],
          effectiveDate: "Тарифы вступают в силу с 1 июля 2025 г.",
        };
      case "uz":
        return {
          title: "IZOH:",
          notes: [
            "Har bir jo'natma alohida tariflanadi. Narxga faqatgina bir marta yetkazib berish urinishlari kiradi.",
            "Agar qabul qiluvchi manzilda bo'lmasa yoki boshqa sabablarga ko'ra jo'natmani qabul qila olmasa, har bir keyingi yetkazib berish yangi buyurtma sifatida hisoblanadi.",
            "Agar qabul qiluvchi boshqa manzilga yetkazishni so'rasa, yangi manzilga yetkazish yangi buyurtma sifatida hisoblanadi.",
            "Bitta jo'natmaning maksimal og'irligi — 30 kg.",
            "Agar jo'natuvchi kuryerni chaqirib, keyin jo'natishni bekor qilsa, yolg'on chaqiriq uchun Buyurtmachi 25 000 so'm (QQS bilan 28 000 so'm) to'laydi.",
          ],
          effectiveDate: "Tariflar 2025-yil 1-iyuldan kuchga kiradi.",
        };
      case "en":
        return {
          title: "NOTE:",
          notes: [
            "Each shipment is charged separately. The price includes one delivery attempt.",
            "If the recipient is absent or unable to accept the shipment for reasons beyond the courier's control, each subsequent delivery attempt is charged as a new delivery order.",
            "If the recipient requests redelivery to a new address, this is charged as a separate delivery order.",
            "The weight of a single shipment must not exceed 30 kg.",
            "If the sender cancels the pickup after requesting a courier, the Customer must pay 25,000 UZS excluding VAT (28,000 UZS incl. VAT) for a false courier call.",
          ],
          effectiveDate: "Tariffs effective from July 1, 2025.",
        };
      default:
        return {
          title: "ПРИМЕЧАНИЕ:",
          notes: [
            "Каждое Отправление тарифицируется по отдельности. В стоимость включена одна попытка доставки Отправления;",
            "Если получатель отсутствует по адресу доставки или не может принять Отправление по другим, не зависящим от курьера причинам, то каждый последующий приезд курьера тарифицируется как новая отдельная заявка на доставку;",
            "Если Получатель изменил адрес доставки и просит доставить по другому адресу, то перенаправление посылки по новому адресу, будет тарифицироваться как отдельная заявка на доставку;",
            "Вес одного места Отправления не должен превышать - 30 кг;",
            "Если при вызове курьера Отправитель откажется передавать Отправление к доставке, Заказчик должен оплатить за ложный вызов курьера 25 000 сум без НДС (28 000 с НДС)",
          ],
          effectiveDate: "Тарифы вступают в силу с 1 июля 2025 г.",
        };
    }
  };

  const getCustomerPickupHeader = () => {
    switch (language) {
      case "ru":
        return "Забор/доставка от/до клиента";
      case "uz":
        return "Klient qo'lidan olib ketish / klient qo'ligacha etkazish";
      case "en":
        return "Pickup from customer / Delivery to customer";
      default:
        return "Забор/доставка от/до клиента";
    }
  };

  const getTashkentHeader = () => {
    switch (language) {
      case "ru":
        return "Забор/доставка по г. Ташкент";
      case "uz":
        return "Toshkent sh. ichida olib ketish / etkazish";
      case "en":
        return "Pickup from customer / Delivery to customer Tashkent City";
      default:
        return "Забор/доставка по г. Ташкент";
    }
  };

  const getWeightHeader = () => {
    switch (language) {
      case "ru":
        return "Вес";
      case "uz":
        return "Vazni";
      case "en":
        return "Weight";
      default:
        return "Вес";
    }
  };

  const getLockerHeader = () => {
    switch (language) {
      case "ru":
        return "Постамат";
      case "uz":
        return "Pochtamat";
      case "en":
        return "To locker";
      default:
        return "Постамат";
    }
  };

  const getZoneHeaders = () => {
    switch (language) {
      case "ru":
        return {
          zone0: "До пункта\n(Зона 0)",
          zone1: "До пункта\n(Зона 1)",
          zone2: "До пункта\n(Зона 2)",
          zone3: "До пункта\n(Зона 3)",
        };
      case "uz":
        return {
          zone0: "Punktgacha (Zone 0)",
          zone1: "Punktgacha (Zone 1)",
          zone2: "Punktgacha (Zone 2)",
          zone3: "Punktgacha (Zone 3)",
        };
      case "en":
        return {
          zone0: "To point (Zone 0)",
          zone1: "To point (Zone 1)",
          zone2: "To point (Zone 2)",
          zone3: "To point (Zone 3)",
        };
      default:
        return {
          zone0: "До пункта\n(Зона 0)",
          zone1: "До пункта\n(Зона 1)",
          zone2: "До пункта\n(Зона 2)",
          zone3: "До пункта\n(Зона 3)",
        };
    }
  };

  const cityNames = getCityNames();
  const zoneHeaders = getZoneHeaders();
  const mainTitle = getMainTitle();
  const mainSubtitle = getMainSubtitle();
  const deliveryZonesTitle = getDeliveryZonesTitle();
  const additionalServicesTitle = getAdditionalServicesTitle();
  const codServiceText = getCodServiceText();
  const declaredValueText = getDeclaredValueText();
  const volumetricWeightText = getVolumetricWeightText();
  const deliveryRatesText = getDeliveryRatesText();
  const notesText = getNotesText();

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Main Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-red-600 mb-2">{mainTitle}</h1>
        <p className="text-gray-600 text-sm">{mainSubtitle}</p>
      </div>

      {/* Rates Table */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-3 lg:p-6 w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse min-w-[700px] xl:min-w-0 text-xs lg:text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center sticky left-0 bg-red-600 z-10">
                    {getWeightHeader()}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center whitespace-pre-line">
                    {zoneHeaders.zone0}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center whitespace-pre-line">
                    {zoneHeaders.zone1}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center whitespace-pre-line">
                    {zoneHeaders.zone2}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center whitespace-pre-line">
                    {zoneHeaders.zone3}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center">
                    {getCustomerPickupHeader()}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center">
                    {getTashkentHeader()}
                  </th>
                  <th className="border border-white px-1 py-2 text-xs lg:text-sm font-medium text-center">
                    {getLockerHeader()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratesData.map((row, index) => (
                  <tr
                    key={row.weight}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-1 py-2 text-center font-medium text-xs lg:text-sm sticky left-0 bg-inherit z-10">
                      {row.weight}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                      {formatPrice(row.zone0)}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                      {formatPrice(row.zone1)}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                      {formatPrice(row.zone2)}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                      {formatPrice(row.zone3)}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                      {formatPrice(row.customer)}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                      {formatPrice(row.tashkent)}
                    </td>
                    {/* Locker column with merged cell for 1-10 kg */}
                    {row.weight === 1 ? (
                      <td
                        rowSpan={10}
                        className="border border-gray-300 px-1 py-2 text-center align-middle font-medium text-xs lg:text-sm"
                      >
                        20,000
                      </td>
                    ) : row.weight <= 10 ? null : (
                      <td className="border border-gray-300 px-1 py-2 text-center text-xs lg:text-sm">
                        -
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Zones Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">
          {deliveryZonesTitle}
        </h2>
      </div>

      {/* Zone Table */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-3 lg:p-6 w-full">
          <div className="w-full overflow-x-auto">
            <table className="border-collapse text-xs lg:text-sm w-full min-w-[800px] xl:min-w-0">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-1 lg:px-2 py-2 text-xs lg:text-sm font-medium text-center bg-white sticky left-0 z-10 min-w-[80px] lg:min-w-[100px]"></th>
                  {cityNames.map((city, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 px-1 lg:px-2 py-2 text-xs lg:text-sm font-medium text-center bg-white min-w-[50px] lg:min-w-[60px]"
                    >
                      {city}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zoneMatrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-300 px-1 lg:px-2 py-2 text-center font-medium bg-white text-xs lg:text-sm sticky left-0 z-10 min-w-[80px] lg:min-w-[100px]">
                      {cityNames[rowIndex]}
                    </td>
                    {row.map((zone, colIndex) => (
                      <td
                        key={colIndex}
                        className="border border-gray-300 px-1 lg:px-2 py-2 text-center text-xs lg:text-sm font-medium min-w-[50px] lg:min-w-[60px]"
                        style={{
                          backgroundColor: getZoneColor(zone),
                        }}
                      >
                        {zone}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Services Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {additionalServicesTitle}
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-800">
              {codServiceText.title} | {codServiceText.cost}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              - {codServiceText.description}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800">
              {declaredValueText.title} | {declaredValueText.cost}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              - {declaredValueText.description}
            </p>
          </div>
        </div>
      </div>

      {/* Volumetric Weight Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {volumetricWeightText.title}
        </h2>
        <p className="text-gray-600 text-sm mb-3">
          {volumetricWeightText.description}
        </p>
        <p className="font-bold text-gray-800">
          {volumetricWeightText.formula}
        </p>
      </div>

      {/* Delivery Rates Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-gray-800 font-medium mb-3">
          {deliveryRatesText.title}
        </p>
        <ul className="space-y-1">
          {deliveryRatesText.rates.map((rate, index) => (
            <li key={index} className="text-gray-600 text-sm">
              {rate}
            </li>
          ))}
        </ul>
      </div>

      {/* Notes Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">{notesText.title}</h3>
        <ol className="space-y-2 list-decimal list-inside">
          {notesText.notes.map((note, index) => (
            <li key={index} className="text-gray-600 text-sm">
              {note}
            </li>
          ))}
        </ol>
        <p className="text-gray-800 font-medium mt-4">
          *{notesText.effectiveDate}
        </p>
      </div>
    </div>
  );
}
