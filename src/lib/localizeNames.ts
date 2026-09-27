/**
 * Имена мастеров и названия товаров на выбранном языке.
 * - Имена людей: на английском — латиницей (Фаррух Каримов → Farrukh Karimov).
 * - Товары: словарь переводов; если перевода нет — на английском транслитерация.
 * Текущий язык выставляет LanguageProvider (setActiveLanguage) при каждом рендере.
 */
type Lang = "ru" | "tj" | "en";

let activeLanguage: Lang = "ru";
export const setActiveLanguage = (lang: string) => {
  activeLanguage = lang === "en" || lang === "tj" ? lang : "ru";
};
export const getActiveLanguage = () => activeLanguage;

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  // таджикские буквы
  ғ: "gh", ӣ: "i", қ: "q", ӯ: "u", ҳ: "h", ҷ: "j",
};

export const transliterate = (text: string) =>
  // «дж» в таджикских именах пишется как «j»: Раджабов → Rajabov, Джамшед → Jamshed
  Array.from(text.replace(/Дж/g, "ҷ".toUpperCase()).replace(/ДЖ/g, "Ҷ").replace(/дж/g, "ҷ"))
    .map((ch, i, arr) => {
      const lower = ch.toLowerCase();
      if (!(lower in MAP)) return ch;
      let out = MAP[lower];
      // «е» в начале слова и после гласной читается как «ye»: Еркин → Yerkin
      if (lower === "е" && (i === 0 || /[\s\-аеёиоуыэюяӣӯ]/i.test(arr[i - 1]))) out = "ye";
      if (ch !== lower && out) {
        const nextIsUpper = arr[i + 1] && arr[i + 1] !== arr[i + 1].toLowerCase();
        out = nextIsUpper ? out.toUpperCase() : out[0].toUpperCase() + out.slice(1);
      }
      return out;
    })
    .join("");

/** Имя человека на текущем языке. */
export const personName = (name?: string | null, lang: Lang = activeLanguage) => {
  const value = String(name ?? "").trim();
  if (!value) return value;
  return lang === "en" ? transliterate(value) : value;
};

/** Инициалы для аватарки (на английском — латиницей). */
export const personInitials = (name?: string | null, lang: Lang = activeLanguage) =>
  personName(name, lang)
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PRODUCTS: Record<string, { en: string; tj: string }> = {
  "Болгарка": { en: "Angle grinder", tj: "Дастгоҳи буриш" },
  "Шуруповерт": { en: "Cordless drill", tj: "Пармаи аккумуляторӣ" },
  "Шуруповёрт": { en: "Cordless drill", tj: "Пармаи аккумуляторӣ" },
  "Лобзик": { en: "Jigsaw", tj: "Арраи барқӣ" },
  "Лазерный уровень": { en: "Laser level", tj: "Сатҳсанҷи лазерӣ" },
  "Набор ключей": { en: "Wrench set", tj: "Маҷмӯи калидҳо" },
  "Набор отверток": { en: "Screwdriver set", tj: "Маҷмӯи мурваттобҳо" },
  "Рулетка 5м": { en: "Tape measure 5 m", tj: "Ченаки метрӣ 5 м" },
  "Молоток": { en: "Hammer", tj: "Болға" },
  "Дрель": { en: "Drill", tj: "Парма" },
  "Перфоратор": { en: "Rotary hammer", tj: "Пармаи зарбдор" },
  "Стиральная машина": { en: "Washing machine", tj: "Мошини ҷомашӯӣ" },
  "Микроволновая печь": { en: "Microwave oven", tj: "Печи микроволновӣ" },
  "Кондиционер": { en: "Air conditioner", tj: "Кондитсионер" },
  "Пылесос": { en: "Vacuum cleaner", tj: "Чангкашак" },
  "Смеситель": { en: "Faucet", tj: "Ҷӯмрак" },
  "Унитаз": { en: "Toilet", tj: "Унитаз" },
  "Раковина": { en: "Sink", tj: "Дастшӯяк" },
  "Водонагреватель": { en: "Water heater", tj: "Обгармкунак" },
  "Розетка": { en: "Socket", tj: "Васлаки барқ" },
  "Выключатель": { en: "Light switch", tj: "Калиди барқ" },
  "Кабель": { en: "Cable", tj: "Сими барқ" },
  "Электронный замок": { en: "Electronic lock", tj: "Қулфи электронӣ" },
  "Генератор": { en: "Generator", tj: "Барқистеҳсолкунак" },
  "Стабилизатор": { en: "Voltage stabilizer", tj: "Мӯътадилкунаки шиддат" },
  "Обогреватель": { en: "Heater", tj: "Гармкунак" },
  "Газовая плита": { en: "Gas stove", tj: "Плитаи газӣ" },
};

/** Название товара на текущем языке. */
export const productName = (name?: string | null, lang: Lang = activeLanguage) => {
  const value = String(name ?? "").trim();
  if (!value || lang === "ru") return value;
  const hit = PRODUCTS[value];
  if (hit) return hit[lang];
  return lang === "en" ? transliterate(value) : value;
};

/** Короткий перевод строки интерфейса прямо в месте использования. */
export const tx = (ru: string, en: string, tj?: string, lang: Lang = activeLanguage) =>
  lang === "en" ? en : lang === "tj" ? tj ?? ru : ru;

const SHOP_CATEGORIES: Record<string, { en: string; tj: string }> = {
  "Инструменты": { en: "Tools", tj: "Асбобҳо" },
  "Бытовая техника": { en: "Home appliances", tj: "Техникаи маишӣ" },
  "Видеонаблюдение": { en: "Video surveillance", tj: "Видеоназорат" },
  "Замки и двери": { en: "Locks & doors", tj: "Қулфҳо ва дарҳо" },
  "Кабели и проводка": { en: "Cables & wiring", tj: "Кабелҳо ва симкашӣ" },
  "Камеры наблюдения": { en: "Security cameras", tj: "Камераҳои назоратӣ" },
  "Освещение": { en: "Lighting", tj: "Равшанӣ" },
  "Розетки и выключатели": { en: "Sockets & switches", tj: "Розеткаҳо ва калидҳо" },
  "Сантехника": { en: "Plumbing", tj: "Сантехника" },
  "Смесители": { en: "Faucets", tj: "Смесителҳо" },
  "Товары для ремонта": { en: "Renovation supplies", tj: "Молҳо барои таъмир" },
  "Электрика": { en: "Electrical", tj: "Барқ" },
  "Каталог": { en: "Catalog", tj: "Каталог" },
};

/** Название категории магазина на текущем языке. */
export const shopCategoryName = (name?: string | null, lang: Lang = activeLanguage) => {
  const value = String(name ?? "").trim();
  if (!value || lang === "ru") return value;
  const hit = SHOP_CATEGORIES[value];
  if (hit) return hit[lang];
  return lang === "en" ? transliterate(value) : value;
};
