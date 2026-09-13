export type Lang = "en" | "ar";

const dict = {
  en: {
    home: "Home",
    communities: "Communities",
    go: "GO",
    market: "Market",
    sportId: "SPORT ID",
    nextMove: "YOUR NEXT MOVE",
    startActivity: "START ACTIVITY",
    continueActivity: "CONTINUE ACTIVITY",
    findGame: "FIND A GAME",
    createGame: "CREATE A GAME",
    weekly: "WEEKLY LEGENDS",
    notifications: "Notifications",
    settings: "Settings",
    skip: "Skip for demo",
    prayer: "Prayer",
  },
  ar: {
    home: "الرئيسية",
    communities: "المجتمع",
    go: "انطلق",
    market: "السوق",
    sportId: "SPORT ID",
    nextMove: "خطوتك التالية",
    startActivity: "ابدأ نشاطاً",
    continueActivity: "أكمل النشاط",
    findGame: "ابحث عن مباراة",
    createGame: "أنشئ مباراة",
    weekly: "أساطير الأسبوع",
    notifications: "الإشعارات",
    settings: "الإعدادات",
    skip: "تخطي للتجربة",
    prayer: "الصلاة",
  },
} as const;

export function t(lang: Lang, key: keyof typeof dict.en) {
  return dict[lang][key];
}
