import { Request, Response } from "express";
import {
  CitiesResponse,
  TariffCalculationResponse,
  WarehousesResponse,
  AuthResponse,
  RegionsResponse,
  RegionCitiesResponse,
  Region,
  RegionCity,
} from "@shared/api";

// Token management
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let refreshPromise: Promise<string> | null = null;

async function getAuthToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && now < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  // If there's already a refresh in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start a new token refresh
  refreshPromise = refreshToken();

  try {
    const token = await refreshPromise;
    return token;
  } finally {
    refreshPromise = null;
  }
}

async function refreshToken(): Promise<string> {
  console.log("Refreshing auth token...");

  const authConfig = {
    url: "https://gateway.fargo.uz/api/v1/authenticate",
    body: {
      username: "calculatoruser@fargo.uz",
      password: "Calculator1234",
      remember_me: false,
    },
  };

  console.log("Authenticating with FARGO credentials...");

  try {
    const response = await fetch(authConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(authConfig.body),
    });

    console.log(`Auth response: status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth failed:", errorText);
      throw new Error(`Auth failed: ${response.status} ${response.statusText}`);
    }

    const authData = await response.json();
    console.log("Auth response structure:", JSON.stringify(authData, null, 2));

    // Try different token paths
    const token =
      authData?.data?.data?.id_token ||
      authData?.data?.id_token ||
      authData?.id_token ||
      authData?.access_token ||
      authData?.token;

    if (!token) {
      console.error("No token found in auth response:", authData);
      throw new Error("No token received from auth API");
    }

    cachedToken = token;
    // Set expiration to 6 hours from now
    tokenExpiresAt = Date.now() + 6 * 60 * 60 * 1000;

    console.log(
      "Token refreshed successfully, expires at:",
      new Date(tokenExpiresAt),
    );
    return token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    cachedToken = null;
    tokenExpiresAt = 0;
    throw error;
  }
}

async function makeAuthenticatedRequest(url: string): Promise<Response> {
  const token = await getAuthToken();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response;
}

// Region and city data based on PDF file
const REGIONS_DATA: Region[] = [
  {
    id: "andijon-viloyati",
    names: {
      uz: "Andijon Viloyati",
      ru: "Андижанская область",
      en: "Andijan Region",
    },
  },
  {
    id: "buxoro-viloyati",
    names: {
      uz: "Buxoro Viloyati",
      ru: "Бухарская область",
      en: "Bukhara Region",
    },
  },
  {
    id: "fargona-viloyati",
    names: {
      uz: "Farg'ona Viloyati",
      ru: "Ферганская область",
      en: "Fergana Region",
    },
  },
  {
    id: "jizzax-viloyati",
    names: {
      uz: "Jizzax Viloyati",
      ru: "Джизакская область",
      en: "Jizzakh Region",
    },
  },
  {
    id: "namangan-viloyati",
    names: {
      uz: "Namagan Viloyati",
      ru: "Наманганская область",
      en: "Namangan Region",
    },
  },
  {
    id: "navoiy-viloyati",
    names: {
      uz: "Navoiy Viloyati",
      ru: "Навоийская область",
      en: "Navoi Region",
    },
  },
  {
    id: "qashqadaryo-viloyati",
    names: {
      uz: "Qashqadaryo Viloyati",
      ru: "Кашкадарьинская область",
      en: "Kashkadarya Region",
    },
  },
  {
    id: "qoraqalpogiston",
    names: {
      uz: "Qoraqalpog'iston Respublikasi",
      ru: "Республика Каракалпакстан",
      en: "Republic of Karakalpakstan",
    },
  },
  {
    id: "samarqand-viloyati",
    names: {
      uz: "Samarqand Viloyati",
      ru: "Самаркандская область",
      en: "Samarkand Region",
    },
  },
  {
    id: "sirdaryo-viloyati",
    names: {
      uz: "Sirdaryo Viloyati",
      ru: "Сырдарьинская область",
      en: "Syrdarya Region",
    },
  },
  {
    id: "surxondaryo-viloyati",
    names: {
      uz: "Surxondaryo Viloyati",
      ru: "Сурхандарьинская область",
      en: "Surkhandarya Region",
    },
  },
  {
    id: "toshkent-viloyati",
    names: {
      uz: "Toshkent Viloyati",
      ru: "Ташкентская область",
      en: "Tashkent Region",
    },
  },
  {
    id: "toshkent-shahri",
    names: {
      uz: "Toshkent Shahri",
      ru: "Город Ташкент",
      en: "Tashkent City",
    },
  },
  {
    id: "xorazm-viloyati",
    names: {
      uz: "Xorazm Viloyati",
      ru: "Хорезмская область",
      en: "Khorezm Region",
    },
  },
];

const CITIES_DATA: RegionCity[] = [
  // Andijan Region
  {
    shipox_id: 1125210871,
    region_id: "andijon-viloyati",
    names: { uz: "Andijon shahri", ru: "город Андижан", en: "Andijan city" },
  },
  {
    shipox_id: 1125206270,
    region_id: "andijon-viloyati",
    names: {
      uz: "Andijon tumani",
      ru: "Андижанский район",
      en: "Andijan district",
    },
  },
  {
    shipox_id: 263947002,
    region_id: "andijon-viloyati",
    names: { uz: "Asaka tumani", ru: "Асакинский район", en: "Asaka district" },
  },
  {
    shipox_id: 263947005,
    region_id: "andijon-viloyati",
    names: {
      uz: "Baliqchi tumani",
      ru: "Балыкчинский район",
      en: "Balikchi district",
    },
  },
  {
    shipox_id: 263947007,
    region_id: "andijon-viloyati",
    names: { uz: "Boʻz tumani", ru: "Бозский район", en: "Boz district" },
  },
  {
    shipox_id: 263947009,
    region_id: "andijon-viloyati",
    names: {
      uz: "Bulokboshi tumani",
      ru: "Булакбашинский район",
      en: "Bulakbashi district",
    },
  },
  {
    shipox_id: 263947013,
    region_id: "andijon-viloyati",
    names: {
      uz: "Izboskan tumani",
      ru: "Избасканский район",
      en: "Izboskan district",
    },
  },
  {
    shipox_id: 263947015,
    region_id: "andijon-viloyati",
    names: {
      uz: "Jalaquduq tumani",
      ru: "Джалакудукский район",
      en: "Jalakuduk district",
    },
  },
  {
    shipox_id: 263947028,
    region_id: "andijon-viloyati",
    names: {
      uz: "Marhamat tumani",
      ru: "Мархаматский район",
      en: "Markhamat district",
    },
  },
  {
    shipox_id: 1295884726,
    region_id: "andijon-viloyati",
    names: {
      uz: "Oltinkoʻl tumani",
      ru: "Алтынкульский район",
      en: "Altinkul district",
    },
  },
  {
    shipox_id: 263947033,
    region_id: "andijon-viloyati",
    names: {
      uz: "Paxtaobod tumani",
      ru: "Пахтаабадский район",
      en: "Pakhtaabad district",
    },
  },
  {
    shipox_id: 263947038,
    region_id: "andijon-viloyati",
    names: {
      uz: "Qoʻrgʻontepa tumani",
      ru: "Кургантепинский район",
      en: "Kurgantepa district",
    },
  },
  {
    shipox_id: 263947043,
    region_id: "andijon-viloyati",
    names: {
      uz: "Shahrixon tumani",
      ru: "Шахриханский район",
      en: "Shakhrikhan district",
    },
  },
  {
    shipox_id: 263947045,
    region_id: "andijon-viloyati",
    names: {
      uz: "Ulugʻnor tumani",
      ru: "Улугнорский район",
      en: "Ulugnor district",
    },
  },
  {
    shipox_id: 263947047,
    region_id: "andijon-viloyati",
    names: {
      uz: "Xoʻjaobod tumani",
      ru: "Ходжаабадский район",
      en: "Khojaabad district",
    },
  },
  {
    shipox_id: 1125248321,
    region_id: "andijon-viloyati",
    names: { uz: "Xonobod shahri", ru: "город Ханабад", en: "Khanabad city" },
  },

  // Bukhara Region
  {
    shipox_id: 263947049,
    region_id: "buxoro-viloyati",
    names: { uz: "Buxoro shahri", ru: "город Бухара", en: "Bukhara city" },
  },
  {
    shipox_id: 1420328303,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Buxoro tumani",
      ru: "Бухарский район",
      en: "Bukhara district",
    },
  },
  {
    shipox_id: 263947051,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Gʻijduvon tumani",
      ru: "Гиждуванский район",
      en: "Gijduvan district",
    },
  },
  {
    shipox_id: 263947053,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Jondor tumani",
      ru: "Жондорский район",
      en: "Jondor district",
    },
  },
  {
    shipox_id: 263947055,
    region_id: "buxoro-viloyati",
    names: { uz: "Kogon shahri", ru: "город Каган", en: "Kagan city" },
  },
  {
    shipox_id: 1420328322,
    region_id: "buxoro-viloyati",
    names: { uz: "Kogon tumani", ru: "Каганский район", en: "Kagan district" },
  },
  {
    shipox_id: 263947057,
    region_id: "buxoro-viloyati",
    names: { uz: "Olot tumani", ru: "Алатский район", en: "Alat district" },
  },
  {
    shipox_id: 263947059,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Peshku tumani",
      ru: "Пешкунский район",
      en: "Peshku district",
    },
  },
  {
    shipox_id: 263947061,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Qorakoʻl tumani",
      ru: "Каракульский район",
      en: "Karakul district",
    },
  },
  {
    shipox_id: 263947063,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Qorovulbozor tumani",
      ru: "Караулбазарский район",
      en: "Karaulbazar district",
    },
  },
  {
    shipox_id: 263947065,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Romitan tumani",
      ru: "Ромитанский район",
      en: "Romitan district",
    },
  },
  {
    shipox_id: 263947067,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Shofirkon tumani",
      ru: "Шафирканский район",
      en: "Shafirkan district",
    },
  },
  {
    shipox_id: 263947069,
    region_id: "buxoro-viloyati",
    names: {
      uz: "Vobkent tumani",
      ru: "Вабкентский район",
      en: "Vabkent district",
    },
  },

  // Fergana Region
  {
    shipox_id: 263947071,
    region_id: "fargona-viloyati",
    names: {
      uz: "Beshariq tumani",
      ru: "Бешарыкский район",
      en: "Besharik district",
    },
  },
  {
    shipox_id: 263947073,
    region_id: "fargona-viloyati",
    names: {
      uz: "Bagʻdod tumani",
      ru: "Багдадский район",
      en: "Bagdad district",
    },
  },
  {
    shipox_id: 263947075,
    region_id: "fargona-viloyati",
    names: {
      uz: "Buvayda tumani",
      ru: "Бувайдинский район",
      en: "Buvayda district",
    },
  },
  {
    shipox_id: 503897289,
    region_id: "fargona-viloyati",
    names: {
      uz: "Dangʻara tumani",
      ru: "Дангаринский район",
      en: "Dangara district",
    },
  },
  {
    shipox_id: 263947079,
    region_id: "fargona-viloyati",
    names: { uz: "Fargʻona shahri", ru: "город Фергана", en: "Fergana city" },
  },
  {
    shipox_id: 1420328341,
    region_id: "fargona-viloyati",
    names: {
      uz: "Fargʻona tumani",
      ru: "Ферганский район",
      en: "Fergana district",
    },
  },
  {
    shipox_id: 263947081,
    region_id: "fargona-viloyati",
    names: {
      uz: "Furqat tumani",
      ru: "Фуркатский район",
      en: "Furkat district",
    },
  },
  {
    shipox_id: 1216487557,
    region_id: "fargona-viloyati",
    names: {
      uz: "Margʻilon shahri",
      ru: "город Маргилан",
      en: "Margilan city",
    },
  },
  {
    shipox_id: 263947086,
    region_id: "fargona-viloyati",
    names: {
      uz: "Oltiariq tumani",
      ru: "Алтыарыкский район",
      en: "Altyaryk district",
    },
  },
  {
    shipox_id: 263947083,
    region_id: "fargona-viloyati",
    names: {
      uz: "Oʻzbekiston tumani",
      ru: "Узбекистанский район",
      en: "Uzbekistan district",
    },
  },
  {
    shipox_id: 503895913,
    region_id: "fargona-viloyati",
    names: { uz: "Qoʻqon shahri", ru: "город Коканд", en: "Kokand city" },
  },
  {
    shipox_id: 263947088,
    region_id: "fargona-viloyati",
    names: {
      uz: "Qoʻshtepa tumani",
      ru: "Куштепинский район",
      en: "Kushtepa district",
    },
  },
  {
    shipox_id: 263947096,
    region_id: "fargona-viloyati",
    names: { uz: "Quva tumani", ru: "Кувинский район", en: "Kuvin district" },
  },
  {
    shipox_id: 1420328383,
    region_id: "fargona-viloyati",
    names: {
      uz: "Quvasoy shahri",
      ru: "Куваcайский район",
      en: "Kuvasay district",
    },
  },
  {
    shipox_id: 263947098,
    region_id: "fargona-viloyati",
    names: {
      uz: "Rishton tumani",
      ru: "Риштанский район",
      en: "Rishtan district",
    },
  },
  {
    shipox_id: 263947101,
    region_id: "fargona-viloyati",
    names: { uz: "Soʻx tumani", ru: "Сохский район", en: "Sokh district" },
  },
  {
    shipox_id: 1226735408,
    region_id: "fargona-viloyati",
    names: {
      uz: "Toshloq tumani",
      ru: "Ташлакский район",
      en: "Tashlak district",
    },
  },
  {
    shipox_id: 263947108,
    region_id: "fargona-viloyati",
    names: {
      uz: "Uchkoʻprik tumani",
      ru: "Учкуприкский район",
      en: "Uchkurgan district",
    },
  },
  {
    shipox_id: 263947110,
    region_id: "fargona-viloyati",
    names: {
      uz: "Yozyovon tumani",
      ru: "Язъяванский район",
      en: "Yazyavan district",
    },
  },

  // Jizzakh Region
  {
    shipox_id: 263947112,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Arnasoy tumani",
      ru: "Арнасайский район",
      en: "Arnasay district",
    },
  },
  {
    shipox_id: 263947115,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Baxmal tumani",
      ru: "Бахмальский район",
      en: "Bakhmal district",
    },
  },
  {
    shipox_id: 263947118,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Doʻstlik tumani",
      ru: "Дустликский район",
      en: "Dustlik district",
    },
  },
  {
    shipox_id: 263947120,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Forish tumani",
      ru: "Фаришский район",
      en: "Farish district",
    },
  },
  {
    shipox_id: 263947122,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Gʻallaorol tumani",
      ru: "Галляаральский район",
      en: "Gallaorol district",
    },
  },
  {
    shipox_id: 263947124,
    region_id: "jizzax-viloyati",
    names: { uz: "Jizzax shahri", ru: "город Джизак", en: "Jizzakh city" },
  },
  {
    shipox_id: 263947127,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Mirzachoʻl tumani",
      ru: "Мирзачульский район",
      en: "Mirzachul district",
    },
  },
  {
    shipox_id: 263947129,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Paxtakor tumani",
      ru: "Пахтакорский район",
      en: "Pakhtakor district",
    },
  },
  {
    shipox_id: 263947419,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Sharof Rashidov tumani",
      ru: "Шароф Рашидовский район",
      en: "Sharof Rashidov district",
    },
  },
  {
    shipox_id: 263947133,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Yangiobod tumani",
      ru: "Янгиабадский район",
      en: "Yangiabad district",
    },
  },
  {
    shipox_id: 263947135,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Zafarobod tumani",
      ru: "Зафарабадский район",
      en: "Zafarabad district",
    },
  },
  {
    shipox_id: 263947138,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Zarbdor tumani",
      ru: "Зарбдарский район",
      en: "Zarbdar district",
    },
  },
  {
    shipox_id: 263947144,
    region_id: "jizzax-viloyati",
    names: {
      uz: "Zomin tumani",
      ru: "Зааминский район",
      en: "Zaamin district",
    },
  },

  // Namangan Region
  {
    shipox_id: 263947331,
    region_id: "namangan-viloyati",
    names: {
      uz: "Chortoq tumani",
      ru: "Чартакский район",
      en: "Chartak district",
    },
  },
  {
    shipox_id: 263947333,
    region_id: "namangan-viloyati",
    names: { 
      uz: "Chust tumani", 
      ru: "Чустcкий район", 
      en: "Chust district" },
  },
  {
    shipox_id: 263947336,
    region_id: "namangan-viloyati",
    names: {
      uz: "Kosonsoy tumani",
      ru: "Касансайский район",
      en: "Kasansay district",
    },
  },
  {
    shipox_id: 263947338,
    region_id: "namangan-viloyati",
    names: {
      uz: "Mingbuloq tumani",
      ru: "Мингбулакский район",
      en: "Mingbulak district",
    },
  },
  {
    shipox_id: 263947340,
    region_id: "namangan-viloyati",
    names: {
      uz: "Namangan tumani",
      ru: "Наманганский район",
      en: "Namangan district",
    },
  },
  {
    shipox_id: 1420328408,
    region_id: "namangan-viloyati",
    names: { uz: "Namangan shahri", ru: "город Наманган", en: "Namangan city" },
  },
  {
    shipox_id: 263947343,
    region_id: "namangan-viloyati",
    names: { uz: "Norin tumani", ru: "Нарынский район", en: "Naryn district" },
  },
  {
    shipox_id: 263947345,
    region_id: "namangan-viloyati",
    names: { uz: "Pop tumani", ru: "Папский район", en: "Pap district" },
  },
  {
    shipox_id: 263947349,
    region_id: "namangan-viloyati",
    names: {
      uz: "Toʻraqoʻrgʻon tumani",
      ru: "Туракурганский район",
      en: "Turakurgan district",
    },
  },
  {
    shipox_id: 263947351,
    region_id: "namangan-viloyati",
    names: {
      uz: "Uchqoʻrgʻon tumani",
      ru: "Учкурганский район",
      en: "Uchkurgan district",
    },
  },
  {
    shipox_id: 263947353,
    region_id: "namangan-viloyati",
    names: { uz: "Uychi tumani", ru: "Уйчинский район", en: "Uychi district" },
  },
  {
    shipox_id: 263947355,
    region_id: "namangan-viloyati",
    names: {
      uz: "Yangiqoʻrgʻon tumani",
      ru: "Янгикурганский район",
      en: "Yangikurgan district",
    },
  },

  // Navoi Region
  {
    shipox_id: 263947357,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Karmana tumani",
      ru: "Карманинский район",
      en: "Karmana district",
    },
  },
  {
    shipox_id: 263947360,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Konimex tumani",
      ru: "Канимехский район",
      en: "Kanimekh district",
    },
  },
  {
    shipox_id: 501503052,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Navbahor tumani",
      ru: "Навбахорский район",
      en: "Navbahor district",
    },
  },
  {
    shipox_id: 501053511,
    region_id: "navoiy-viloyati",
    names: { uz: "Navoiy shahri", ru: "город Навои", en: "Navoi city" },
  },
  {
    shipox_id: 263947364,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Nurota tumani",
      ru: "Нуратинский район",
      en: "Nurata district",
    },
  },
  {
    shipox_id: 263947369,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Qiziltepa tumani",
      ru: "Кызылтепинский район",
      en: "Kyzyltepa district",
    },
  },
  {
    shipox_id: 263947373,
    region_id: "navoiy-viloyati",
    names: { uz: "Tomdi tumani", ru: "Тамдынский район", en: "Tamdy district" },
  },
  {
    shipox_id: 263947376,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Uchquduq tumani",
      ru: "Учкудукский район",
      en: "Uchkuduk district",
    },
  },
  {
    shipox_id: 263947378,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Xatirchi tumani",
      ru: "Хатырчинский район",
      en: "Khatyrchi district",
    },
  },
  {
    shipox_id: 501057523,
    region_id: "navoiy-viloyati",
    names: {
      uz: "Zarafshon shahri",
      ru: "город Зарафшан",
      en: "Zarafshan city",
    },
  },

  // Kashkadarya Region
  {
    shipox_id: 263947214,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Chiroqchi tumani",
      ru: "Чиракчинский район",
      en: "Chirakchi district",
    },
  },
  {
    shipox_id: 263947216,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Dehqonobod tumani",
      ru: "Дехканабадский район",
      en: "Dehkanabad district",
    },
  },
  {
    shipox_id: 263947218,
    region_id: "qashqadaryo-viloyati",
    names: { uz: "Gʻuzor tumani", ru: "Гузарский район", en: "Guzar district" },
  },
  {
    shipox_id: 263947220,
    region_id: "qashqadaryo-viloyati",
    names: { uz: "Kasbi tumani", ru: "Касбийский район", en: "Kasby district" },
  },
  {
    shipox_id: 263947225,
    region_id: "qashqadaryo-viloyati",
    names: { uz: "Koson tumani", ru: "Касанский район", en: "Kasan district" },
  },
  {
    shipox_id: 1383137603,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Koʻkdala tumani",
      ru: "Кукдалинский район",
      en: "Kukdali district",
    },
  },
  {
    shipox_id: 263947223,
    region_id: "qashqadaryo-viloyati",
    names: { uz: "Kitob tumani", ru: "Китабский район", en: "Kitab district" },
  },
  {
    shipox_id: 263947248,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Mirishkor tumani",
      ru: "Миришкорский район",
      en: "Mirishkor district",
    },
  },
  {
    shipox_id: 263947227,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Muborak tumani",
      ru: "Мубарекский район",
      en: "Mubarek district",
    },
  },
  {
    shipox_id: 263947229,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Nishon tumani",
      ru: "Нишанский район",
      en: "Nishan district",
    },
  },
  {
    shipox_id: 263947231,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Qamashi tumani",
      ru: "Камашинский район",
      en: "Kamashi district",
    },
  },
  {
    shipox_id: 263947233,
    region_id: "qashqadaryo-viloyati",
    names: { uz: "Qarshi shahri", ru: "город Карши", en: "Karshi city" },
  },
  {
    shipox_id: 1420328441,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Qarshi tumani",
      ru: "Каршинский район",
      en: "Karshi district",
    },
  },
  {
    shipox_id: 263947235,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Shahrisabz shahri",
      ru: "город Шахрисабз",
      en: "Shakhrisabz city",
    },
  },
  {
    shipox_id: 1420328446,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Shahrisabz tumani",
      ru: "Шахрисабзский район",
      en: "Shakhrisabz district",
    },
  },
  {
    shipox_id: 263947250,
    region_id: "qashqadaryo-viloyati",
    names: {
      uz: "Yakkabogʻ tumani",
      ru: "Яккабагский район",
      en: "Yakkabag district",
    },
  },

  // Republic of Karakalpakstan
  {
    shipox_id: 263947147,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Amudaryo tumani",
      ru: "Амударьинский район",
      en: "Amudarya district",
    },
  },
  {
    shipox_id: 263947165,
    region_id: "qoraqalpogiston",
    names: { uz: "Orol dengizi", ru: "Аральское море", en: "Aral Sea" },
  },
  {
    shipox_id: 263947171,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Beruniy tumani",
      ru: "Берунийский район",
      en: "Beruniy district",
    },
  },
  {
    shipox_id: 1383137602,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Boʻzatov tumani",
      ru: "Бозатауский район",
      en: "Bozatau district",
    },
  },
  {
    shipox_id: 263947174,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Chimboy tumani",
      ru: "Чимбайский район",
      en: "Chimbay district",
    },
  },
  {
    shipox_id: 263947177,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Ellikqala tumani",
      ru: "Элликкалинский район",
      en: "Ellikqala district",
    },
  },
  {
    shipox_id: 263947188,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Kegeyli tumani",
      ru: "Кегейлийский район",
      en: "Kegeyli district",
    },
  },
  {
    shipox_id: 263947190,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Moʻynoq tumani",
      ru: "Муйнакский район",
      en: "Muynak district",
    },
  },
  {
    shipox_id: 263947194,
    region_id: "qoraqalpogiston",
    names: { uz: "Nukus shahri", ru: "город Нукус", en: "Nukus city" },
  },
  {
    shipox_id: 1420328456,
    region_id: "qoraqalpogiston",
    names: { uz: "Nukus tumani", ru: "Нукусский район", en: "Nukus district" },
  },
  {
    shipox_id: 263947197,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Qanlikoʻl tumani",
      ru: "Канлыкульский район",
      en: "Kanlykul district",
    },
  },
  {
    shipox_id: 1113714253,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Qoʻngʻirot tumani",
      ru: "Кунградский район",
      en: "Kungrad district",
    },
  },
  {
    shipox_id: 263947202,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Qoraoʻzak tumani",
      ru: "Караузякский район",
      en: "Karaozak district",
    },
  },
  {
    shipox_id: 263947206,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Shumanay tumani",
      ru: "Шуманайский район",
      en: "Shumanay district",
    },
  },
  {
    shipox_id: 1383137607,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Taxiatosh shahri",
      ru: "Тахиаташский район",
      en: "Takhiatash district",
    },
  },
  {
    shipox_id: 263947208,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Taxtakoʻpir tumani",
      ru: "Тахтакупырский район",
      en: "Takhtakupyr district",
    },
  },
  {
    shipox_id: 263947210,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Toʻrtkoʻl tumani",
      ru: "Турткульский район",
      en: "Turtkul district",
    },
  },
  {
    shipox_id: 263947212,
    region_id: "qoraqalpogiston",
    names: {
      uz: "Xoʻjayli tumani",
      ru: "Ходжейлийский район",
      en: "Khojayli district",
    },
  },

  // Samarkand Region
  {
    shipox_id: 263947380,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Bulungur tumani",
      ru: "Булунгурский район",
      en: "Bulungur district",
    },
  },
  {
    shipox_id: 263947383,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Ishtixon tumani",
      ru: "Иштыханский район",
      en: "Ishtikhon district",
    },
  },
  {
    shipox_id: 263947385,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Jomboy tumani",
      ru: "Джамбайский район",
      en: "Jambay district",
    },
  },
  {
    shipox_id: 263947387,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Kattaqoʻrgʻon shahri",
      ru: "город Каттакурган",
      en: "Kattakurgan city",
    },
  },
  {
    shipox_id: 1420328467,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Kattaqoʻrgʻon tumani",
      ru: "Каттакурганский район",
      en: "Kattakurgan district",
    },
  },
  {
    shipox_id: 263947389,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Narpay tumani",
      ru: "Нарпайский район",
      en: "Narpay district",
    },
  },
  {
    shipox_id: 263947391,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Nurobod tumani",
      ru: "Нурабадский район",
      en: "Nurabad district",
    },
  },
  {
    shipox_id: 263947393,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Oqdaryo tumani",
      ru: "Акдарьинский район",
      en: "Akdarya district",
    },
  },
  {
    shipox_id: 263947395,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Pastdargʻom tumani",
      ru: "Пастдаргомский район",
      en: "Pastdargom district",
    },
  },
  {
    shipox_id: 263947397,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Paxtachi tumani",
      ru: "Пахтачийский район",
      en: "Pakhtachi district",
    },
  },
  {
    shipox_id: 263947399,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Payariq tumani",
      ru: "Пайарыкский район",
      en: "Payarik district",
    },
  },
  {
    shipox_id: 263947401,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Qoʻshrabot tumani",
      ru: "Кошрабадский район",
      en: "Koshrabad district",
    },
  },
  {
    shipox_id: 263947403,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Samarqand shahri",
      ru: "город Самарканд",
      en: "Samarkand city",
    },
  },
  {
    shipox_id: 1420328473,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Samarqand tumani",
      ru: "Самаркандский район",
      en: "Samarkand district",
    },
  },
  {
    shipox_id: 263947405,
    region_id: "samarqand-viloyati",
    names: {
      uz: "Toyloq tumani",
      ru: "Тайлакский район",
      en: "Taylak district",
    },
  },
  {
    shipox_id: 263947407,
    region_id: "samarqand-viloyati",
    names: { uz: "Urgut tumani", ru: "Ургутский район", en: "Urgut district" },
  },

  // Syrdarya Region
  {
    shipox_id: 263947409,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Boyovut tumani",
      ru: "Баяутский район",
      en: "Bayaut district",
    },
  },
  {
    shipox_id: 263947411,
    region_id: "sirdaryo-viloyati",
    names: { uz: "Guliston shahri", ru: "город Гулистан", en: "Gulistan city" },
  },
  {
    shipox_id: 1420328478,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Guliston tumani",
      ru: "Гулистанский район",
      en: "Gulistan district",
    },
  },
  {
    shipox_id: 263947413,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Mirzaobod tumani",
      ru: "Мирзаабадский район",
      en: "Mirzaabad district",
    },
  },
  {
    shipox_id: 263947415,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Oqoltin tumani",
      ru: "Акалтынский район",
      en: "Akaltyn district",
    },
  },
  {
    shipox_id: 1383137606,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Sardoba tumani",
      ru: "Сардобинский район",
      en: "Sardoba district",
    },
  },
  {
    shipox_id: 263947417,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Sayxunobod tumani",
      ru: "Сайхунабадский район",
      en: "Saykhunabad district",
    },
  },
  {
    shipox_id: 1124630236,
    region_id: "sirdaryo-viloyati",
    names: { uz: "Shirin shahri", ru: "город Ширин", en: "Shirin city" },
  },
  {
    shipox_id: 263947426,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Sirdaryo tumani",
      ru: "Сырдарьинский район",
      en: "Syrdarya district",
    },
  },
  {
    shipox_id: 1124655691,
    region_id: "sirdaryo-viloyati",
    names: {
      uz: "Xovos tumani",
      ru: "Хавастский район",
      en: "Khavast district",
    },
  },
  {
    shipox_id: 1124633996,
    region_id: "sirdaryo-viloyati",
    names: { uz: "Yangiyer shahri", ru: "город Янгиер", en: "Yangiyer city" },
  },

  // Surkhandarya Region
  {
    shipox_id: 263947430,
    region_id: "surxondaryo-viloyati",
    names: { uz: "Angor tumani", ru: "Ангорский район", en: "Angor district" },
  },
  {
    shipox_id: 263947433,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Bandixon tumani",
      ru: "Бандиханский район",
      en: "Bandikhan district",
    },
  },
  {
    shipox_id: 263947437,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Boysun tumani",
      ru: "Байсунский район",
      en: "Baysun district",
    },
  },
  {
    shipox_id: 263947439,
    region_id: "surxondaryo-viloyati",
    names: { uz: "Denov tumani", ru: "Денауский район", en: "Denau district" },
  },
  {
    shipox_id: 263947441,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Jarqoʻrgʻon tumani",
      ru: "Джаркурганский район",
      en: "Jarkurgan district",
    },
  },
  {
    shipox_id: 263947443,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Muzrabot tumani",
      ru: "Музрабадский район",
      en: "Muzrabad district",
    },
  },
  {
    shipox_id: 263947445,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Oltinsoy tumani",
      ru: "Алтынсайский район",
      en: "Altynsay district",
    },
  },
  {
    shipox_id: 263947448,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Qiziriq tumani",
      ru: "Кизирикский район",
      en: "Kizirik district",
    },
  },
  {
    shipox_id: 263947456,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Qumqoʻrgʻon tumani",
      ru: "Кумкурганский район",
      en: "Kumkurgan district",
    },
  },
  {
    shipox_id: 263947458,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Sariosiyo tumani",
      ru: "Сариасийский район",
      en: "Sariasiy district",
    },
  },
  {
    shipox_id: 263947460,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Sherobod tumani",
      ru: "Шерабадский район",
      en: "Sherabad district",
    },
  },
  {
    shipox_id: 263947462,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Shoʻrchi tumani",
      ru: "Шурчинский район",
      en: "Shurchi district",
    },
  },
  {
    shipox_id: 263947464,
    region_id: "surxondaryo-viloyati",
    names: { uz: "Termiz shahri", ru: "город Термез", en: "Termez city" },
  },
  {
    shipox_id: 1420328484,
    region_id: "surxondaryo-viloyati",
    names: {
      uz: "Termiz tumani",
      ru: "Термезский район",
      en: "Termez district",
    },
  },
  {
    shipox_id: 263947466,
    region_id: "surxondaryo-viloyati",
    names: { uz: "Uzun tumani", ru: "Узунский район", en: "Uzun district" },
  },

  // Tashkent Region
  {
    shipox_id: 501056439,
    region_id: "toshkent-viloyati",
    names: { uz: "Angren shahri", ru: "город Ангрен", en: "Angren city" },
  },
  {
    shipox_id: 263947468,
    region_id: "toshkent-viloyati",
    names: { uz: "Bekobod shahri", ru: "город Бекабад", en: "Bekabad city" },
  },
  {
    shipox_id: 1420328489,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Bekobod tumani",
      ru: "Бекабадский район",
      en: "Bekabad district",
    },
  },
  {
    shipox_id: 263947470,
    region_id: "toshkent-viloyati",
    names: { uz: "Boʻka tumani", ru: "Букинский район", en: "Buka district" },
  },
  {
    shipox_id: 263947472,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Boʻstonliq tumani",
      ru: "Бостанлыкский район",
      en: "Bostonliq district",
    },
  },
  {
    shipox_id: 263947474,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Chinoz tumani",
      ru: "Чиназский район",
      en: "Chinaz district",
    },
  },
  {
    shipox_id: 501067990,
    region_id: "toshkent-viloyati",
    names: { uz: "Chirchiq shahri", ru: "город Чирчик", en: "Chirchiq city" },
  },
  {
    shipox_id: 1420328495,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Nurafshon shahri",
      ru: "город Нурафшан",
      en: "Nurafshan city",
    },
  },
  {
    shipox_id: 263947479,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Ohangaron shahri",
      ru: "город Ахангаран",
      en: "Ahangaran city",
    },
  },
  {
    shipox_id: 1420328503,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Ohangaron tumani",
      ru: "Ахангаранский район",
      en: "Ahangaran district",
    },
  },
  {
    shipox_id: 1113695725,
    region_id: "toshkent-viloyati",
    names: { uz: "Olmaliq shahri", ru: "город Алмалык", en: "Almalyk city" },
  },
  {
    shipox_id: 263947483,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Oqqoʻrgʻon tumani",
      ru: "Аккурганский район",
      en: "Akkurgan district",
    },
  },
  {
    shipox_id: 263947477,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Oʻrtachirchiq tumani",
      ru: "Уртачирчикский район",
      en: "Urtachirchiq district",
    },
  },
  {
    shipox_id: 263947485,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Parkent tumani",
      ru: "Паркентский район",
      en: "Parkent district",
    },
  },
  {
    shipox_id: 263947487,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Piskent tumani",
      ru: "Пскентский район",
      en: "Pskent district",
    },
  },
  {
    shipox_id: 263947489,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Qibray tumani",
      ru: "Кибрайский район",
      en: "Kibray district",
    },
  },
  {
    shipox_id: 263947492,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Quyi Chirchiq tumani",
      ru: "Куйичирчикский район",
      en: "Kuyichirchiq district",
    },
  },
  {
    shipox_id: 1216279901,
    region_id: "toshkent-shahri",
    names: { uz: "Toshkent shahri", ru: "город Ташкент", en: "Tashkent city" },
  },
  {
    shipox_id: 263947503,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Toshkent tumani",
      ru: "Ташкентский район",
      en: "Tashkent district",
    },
  },
  {
    shipox_id: 263947505,
    region_id: "toshkent-viloyati",
    names: { uz: "Yangiyoʻl shahri", ru: "город Янгиюль", en: "Yangiyul city" },
  },
  {
    shipox_id: 1420328584,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Yangiyoʻl tumani",
      ru: "Янгиюльский район",
      en: "Yangiyul district",
    },
  },
  {
    shipox_id: 263947507,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Yuqori Chirchiq tumani",
      ru: "Юкоричирчикский район",
      en: "Yukorichirchiq district",
    },
  },
  {
    shipox_id: 263947509,
    region_id: "toshkent-viloyati",
    names: {
      uz: "Zangiota tumani",
      ru: "Зангиатинский район",
      en: "Zangiata district",
    },
  },

  // Khorezm Region
  {
    shipox_id: 263947253,
    region_id: "xorazm-viloyati",
    names: { uz: "Bogʻot tumani", ru: "Багатский район", en: "Bagat district" },
  },
  {
    shipox_id: 263947258,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Gurlan tumani",
      ru: "Гурленский район",
      en: "Gurlen district",
    },
  },
  {
    shipox_id: 263947267,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Hazorasp tumani",
      ru: "Хазараспский район",
      en: "Khazarasp district",
    },
  },
  {
    shipox_id: 263947277,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Qoʻshkoʻpir tumani",
      ru: "Кошкупырский район",
      en: "Koshkupyr district",
    },
  },
  {
    shipox_id: 263947287,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Shovot tumani",
      ru: "Шаватский район",
      en: "Shavat district",
    },
  },
  {
    shipox_id: 1383137608,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Tuproqqalʼa tumani",
      ru: "Тупроккалинский район",
      en: "Tuprakkala district",
    },
  },
  {
    shipox_id: 263947299,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Urganch tumani",
      ru: "Ургенчский район",
      en: "Urgench district",
    },
  },
  {
    shipox_id: 1420328585,
    region_id: "xorazm-viloyati",
    names: { uz: "Urganch shahri", ru: "город Ургенч", en: "Urgench city" },
  },
  {
    shipox_id: 263947311,
    region_id: "xorazm-viloyati",
    names: { uz: "Xiva tumani", ru: "Хивинский район", en: "Khiva district" },
  },
  {
    shipox_id: 1420328590,
    region_id: "xorazm-viloyati",
    names: { uz: "Xiva shahri", ru: "город Хива", en: "Khiva city" },
  },
  {
    shipox_id: 263947319,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Xonqa tumani",
      ru: "Ханкинский район",
      en: "Khanka district",
    },
  },
  {
    shipox_id: 263947327,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Yangiariq tumani",
      ru: "Янгиарыкский район",
      en: "Yangiaryk district",
    },
  },
  {
    shipox_id: 263947329,
    region_id: "xorazm-viloyati",
    names: {
      uz: "Yangibozor tumani",
      ru: "Янгибазарский район",
      en: "Yangibazar district",
    },
  },
];

export async function calculateTariff(req: Request, res: Response) {
  try {
    console.log(
      "Calculating tariff with body:",
      JSON.stringify(req.body, null, 2),
    );

    const {
      from_latitude,
      from_longitude,
      to_latitude,
      to_longitude,
      weight,
      tariff_type,
    } = req.body;

    if (
      !from_latitude ||
      !from_longitude ||
      !to_latitude ||
      !to_longitude ||
      !weight ||
      !tariff_type
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "from_latitude",
          "from_longitude",
          "to_latitude",
          "to_longitude",
          "weight",
          "tariff_type",
        ],
      });
    }

    // Build URL with query parameters for the new API
    const baseUrl =
      "https://gateway.fargo.uz/api/v2/admin/packages/prices";
    const params = new URLSearchParams({
      size: "50",
      "dimensions.width": "32",
      "dimensions.length": "45",
      "dimensions.height": "1",
      "dimensions.unit": "METRIC",
      "dimensions.weight": weight.toString(),
      to_country_id: "234",
      from_country_id: "234",
      courier_type: tariff_type,
      page: "0",
      customerId: "2484820352",
      logistic_type: "REGULAR",
      from_latitude: from_latitude.toString(),
      from_longitude: from_longitude.toString(),
      to_latitude: to_latitude.toString(),
      to_longitude: to_longitude.toString(),
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log("FARGO API request URL:", url);

    const token = await getAuthToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
        marketplace_id: "307345429",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Tariff calculation failed: ${response.status} ${response.statusText}`,
        errorText,
      );
      throw new Error(
        `Tariff calculation failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("FARGO API response:", JSON.stringify(data, null, 2));

    const response_data: TariffCalculationResponse = {
      data: data.data || data,
    };

    res.json(response_data);
  } catch (error) {
    console.error("Error calculating tariff:", error);
    res.status(500).json({
      error: "Failed to calculate tariff",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getRegions(req: Request, res: any) {
  try {
    console.log("Fetching regions...");
    const response_data: RegionsResponse = {
      data: REGIONS_DATA,
    };
    console.log(`Returning ${REGIONS_DATA.length} regions`);
    res.json(response_data);
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({
      error: "Failed to fetch regions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getRegionCities(req: Request, res: any) {
  try {
    const { regionId } = req.params;
    console.log(`Fetching cities for region: ${regionId}`);

    if (!regionId) {
      return res.status(400).json({
        error: "Region ID is required",
      });
    }

    const cities = CITIES_DATA.filter((city) => city.region_id === regionId);
    console.log(`Found ${cities.length} cities for region ${regionId}`);

    const response_data: RegionCitiesResponse = {
      data: cities,
    };

    res.json(response_data);
  } catch (error) {
    console.error("Error fetching region cities:", error);
    res.status(500).json({
      error: "Failed to fetch region cities",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getCities(req: Request, res: Response) {
  try {
    console.log("Fetching cities from FARGO API...");

    const url =
      "https://gateway.fargo.uz/api/v2/cities?size=200&country_id=234&is_uae=false&page=0&status=active";
    const response = await makeAuthenticatedRequest(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Cities API failed: ${response.status} ${response.statusText}`,
        errorText,
      );
      throw new Error(
        `Cities API failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Cities API response structure:", Object.keys(data));

    // Handle nested response structure - cities can be in data.data or data.list
    let cities = [];
    if (data.data) {
      if (Array.isArray(data.data)) {
        cities = data.data;
      } else if (data.data.data && Array.isArray(data.data.data)) {
        cities = data.data.data;
      } else if (data.data.list && Array.isArray(data.data.list)) {
        cities = data.data.list;
      }
    } else if (data.list && Array.isArray(data.list)) {
      cities = data.list;
    }

    console.log(`Found ${cities.length} cities`);

    const response_data: CitiesResponse = {
      data: cities,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last,
      first: data.first,
      numberOfElements: data.numberOfElements,
      size: data.size,
      number: data.number,
    };

    res.json(response_data);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      error: "Failed to fetch cities",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getWarehouses(req: Request, res: Response) {
  try {
    console.log("Fetching warehouses from FARGO API...");

    const url =
      "https://gateway.fargo.uz/api/v1/admin/warehouses?size=100&multi_marketplace=false&page=0&status=active&type=POST_OFFICE&show_all=true";
    const response = await makeAuthenticatedRequest(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Warehouses API failed: ${response.status} ${response.statusText}`,
        errorText,
      );
      throw new Error(
        `Warehouses API failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Handle nested response structure
    let warehouses = [];
    if (data.data) {
      if (Array.isArray(data.data)) {
        warehouses = data.data;
      } else if (data.data.data && Array.isArray(data.data.data)) {
        warehouses = data.data.data;
      } else if (data.data.list && Array.isArray(data.data.list)) {
        warehouses = data.data.list;
      }
    } else if (data.list && Array.isArray(data.list)) {
      warehouses = data.list;
    }

    console.log(`Found ${warehouses.length} warehouses`);

    const response_data: WarehousesResponse = {
      data: warehouses,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last,
      first: data.first,
      numberOfElements: data.numberOfElements,
      size: data.size,
      number: data.number,
    };

    res.json(response_data);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({
      error: "Failed to fetch warehouses",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getLockers(req: Request, res: Response) {
  try {
    console.log("Fetching lockers from FARGO API...");

    const url =
      "https://gateway.fargo.uz/api/v1/admin/warehouses?size=1000&multi_marketplace=false&page=0&status=active&type=LOCKER&show_all=true";
    const response = await makeAuthenticatedRequest(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Lockers API failed: ${response.status} ${response.statusText}`,
        errorText,
      );
      throw new Error(
        `Lockers API failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Handle nested response structure
    let lockers = [];
    if (data.data) {
      if (Array.isArray(data.data)) {
        lockers = data.data;
      } else if (data.data.data && Array.isArray(data.data.data)) {
        lockers = data.data.data;
      } else if (data.data.list && Array.isArray(data.data.list)) {
        lockers = data.data.list;
      }
    } else if (data.list && Array.isArray(data.list)) {
      lockers = data.list;
    }

    console.log(`Found ${lockers.length} lockers`);

    const response_data: WarehousesResponse = {
      data: lockers,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last,
      first: data.first,
      numberOfElements: data.numberOfElements,
      size: data.size,
      number: data.number,
    };

    res.json(response_data);
  } catch (error) {
    console.error("Error fetching lockers:", error);
    res.status(500).json({
      error: "Failed to fetch lockers",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
