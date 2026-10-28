// Work-only facts about Shuhrat. Sources: CV (EN/RU), GitHub README, LinkedIn, CARDINAL one-pager.
// Never add personal data here (home address, birth date, family, hobbies): this file feeds the AI.

export type Lang = "en" | "ru" | "uz";
export type L = Record<Lang, string>;

export const LANGS: Lang[] = ["en", "ru", "uz"];

export const person = {
  name: { en: "Shuhrat Abdurahmonov", ru: "Шухрат Абдурахмонов", uz: "Shuhrat Abdurahmonov" } as L,
  firstName: { en: "Shuhrat", ru: "Шухрат", uz: "Shuhrat" } as L,
  role: {
    en: "Full-Stack Software Engineer",
    ru: "Full-Stack разработчик",
    uz: "Full-Stack dasturchi",
  } as L,
  stackLine: "React · Next.js · Node.js · TypeScript · PostgreSQL · Three.js",
  location: {
    en: "Tashkent, Uzbekistan (home: Fergana)",
    ru: "Ташкент, Узбекистан (родной город — Фергана)",
    uz: "Toshkent, O‘zbekiston (asli Farg‘onadan)",
  } as L,
  status: {
    en: "Open to work · office, hybrid or remote",
    ru: "Открыт к предложениям · офис, гибрид или удалёнка",
    uz: "Ish takliflariga ochiq · ofis, gibrid yoki masofaviy",
  } as L,
  summary: {
    en: "Full-stack engineer building web applications since September 2024: interfaces in React and Next.js, REST APIs on Node.js and Express, PostgreSQL, role-based workspaces, admin dashboards, real-time features and integrations. Frontend intern at Neovex, founder of CARDINAL, and the author of several interactive 3D web projects.",
    ru: "Full-stack разработчик, с сентября 2024 года создаю веб-приложения: интерфейсы на React и Next.js, REST API на Node.js и Express, PostgreSQL, ролевые кабинеты, админ-панели, real-time и интеграции. Frontend-стажёр в Neovex, основатель CARDINAL и автор интерактивных 3D-проектов для браузера.",
    uz: "2024-yil sentyabridan beri veb-ilovalar yarataman: React va Next.js’da interfeyslar, Node.js va Express’da REST API, PostgreSQL, rollarga asoslangan kabinetlar, admin panellar, real-time funksiyalar va integratsiyalar. Neovex’da Frontend stajyor, CARDINAL asoschisi va brauzer uchun interaktiv 3D loyihalar muallifi.",
  } as L,
};

export const education = {
  school: {
    en: "Fergana State Technical University",
    ru: "Ферганский государственный технический университет",
    uz: "Farg‘ona davlat texnika universiteti",
  } as L,
  program: {
    en: "Software Engineering · 3rd year · graduating in 2028",
    ru: "Программный инжиниринг · 3 курс · окончание в 2028 году",
    uz: "Dasturiy injiniring · 3-kurs · 2028-yilda tamomlaydi",
  } as L,
};

export const spokenLanguages: L = {
  en: "Uzbek (native), Russian (fluent), English (basic, technical reading)",
  ru: "Узбекский (родной), русский (свободно), английский (базовый, технический)",
  uz: "O‘zbek (ona tili), rus (erkin), ingliz (boshlang‘ich, texnik matnlar)",
};

export type Contact = { id: string; label: string; handle: string; href: string };

export const contacts: Contact[] = [
  { id: "telegram", label: "Telegram", handle: "@abdurahmonov_shuhrat", href: "https://t.me/abdurahmonov_shuhrat" },
  { id: "linkedin", label: "LinkedIn", handle: "shuhrat-abdurahmonov", href: "https://www.linkedin.com/in/shuhrat-abdurahmonov-4b4264278/" },
  { id: "github", label: "GitHub", handle: "Shuhrat25", href: "https://github.com/Shuhrat25" },
  { id: "whatsapp", label: "WhatsApp", handle: "+998 90 777 92 44", href: "https://wa.me/998907779244" },
  { id: "email", label: "Email", handle: "shuhratabdurahmonov2004@gmail.com", href: "mailto:shuhratabdurahmonov2004@gmail.com" },
];

export type Experience = {
  id: string;
  company: string;
  link?: string;
  role: L;
  period: L;
  place: L;
  points: L[];
};

export const experience: Experience[] = [
  {
    id: "neovex",
    company: "Neovex",
    link: "https://neovex.uz/ru",
    role: { en: "Frontend Developer Intern", ru: "Frontend-разработчик (стажёр)", uz: "Frontend dasturchi (stajyor)" },
    period: { en: "Sep 2026 — now", ru: "сент. 2026 — сейчас", uz: "2026-yil sent. — hozir" },
    place: { en: "Tashkent", ru: "Ташкент", uz: "Toshkent" },
    points: [
      {
        en: "Built Neovex One Core: a scroll-driven site where one Three.js scene morphs through AI, 3D, AR, VR, Software and Robotics.",
        ru: "Сделал Neovex One Core: сайт, где одна Three.js-сцена меняет форму при прокрутке — AI, 3D, AR, VR, Software и Robotics.",
        uz: "Neovex One Core’ni yaratdim: aylantirilganda bitta Three.js sahnasi AI, 3D, AR, VR, Software va Robotics shakllariga o‘tadigan sayt.",
      },
      {
        en: "Stack: Next.js, React, TypeScript, React Three Fiber, GSAP ScrollTrigger, GLSL.",
        ru: "Стек: Next.js, React, TypeScript, React Three Fiber, GSAP ScrollTrigger, GLSL.",
        uz: "Stek: Next.js, React, TypeScript, React Three Fiber, GSAP ScrollTrigger, GLSL.",
      },
    ],
  },
  {
    id: "cardinal",
    company: "CARDINAL",
    role: { en: "Founder & Product Architect", ru: "Основатель и продуктовый архитектор", uz: "Asoschi va mahsulot arxitektori" },
    period: { en: "Aug 2026 — now", ru: "авг. 2026 — сейчас", uz: "2026-yil avg. — hozir" },
    place: { en: "Own product · remote", ru: "Собственный продукт · удалённо", uz: "Shaxsiy mahsulot · masofaviy" },
    points: [
      {
        en: "Designing a B2B multi-tenant AI platform that prepares Live-Ops events, quests and assets for game studios.",
        ru: "Проектирую B2B multi-tenant AI-платформу, которая готовит Live-Ops события, квесты и ассеты для игровых студий.",
        uz: "O‘yin studiyalari uchun Live-Ops tadbirlari, kvestlar va assetlarni tayyorlaydigan B2B multi-tenant AI platformani loyihalayapman.",
      },
      {
        en: "Human-in-the-Loop: nothing reaches a live game without the developer's approval; SDK/API integrations for Unity and Unreal.",
        ru: "Human-in-the-Loop: ничего не попадает в живую игру без одобрения разработчика; интеграции через SDK/API для Unity и Unreal.",
        uz: "Human-in-the-Loop: dasturchi tasdiqlamaguncha hech narsa o‘yinga chiqmaydi; Unity va Unreal uchun SDK/API integratsiyalari.",
      },
    ],
  },
  {
    id: "freelance",
    company: "Freelance",
    role: { en: "Full-Stack Web Developer", ru: "Full-Stack веб-разработчик", uz: "Full-Stack veb-dasturchi" },
    period: { en: "Sep 2024 — now", ru: "сент. 2024 — сейчас", uz: "2024-yil sent. — hozir" },
    place: { en: "Uzbekistan · remote", ru: "Узбекистан · удалённо", uz: "O‘zbekiston · masofaviy" },
    points: [
      {
        en: "Web applications with React, Next.js, Node.js/Express, TypeScript and PostgreSQL.",
        ru: "Веб-приложения на React, Next.js, Node.js/Express, TypeScript и PostgreSQL.",
        uz: "React, Next.js, Node.js/Express, TypeScript va PostgreSQL’da veb-ilovalar.",
      },
      {
        en: "REST APIs, authentication, role-based workspaces, admin dashboards and real-time features.",
        ru: "REST API, авторизация, ролевые кабинеты, админ-панели и обмен данными в реальном времени.",
        uz: "REST API, avtorizatsiya, rollarga asoslangan kabinetlar, admin panellar va real-time funksiyalar.",
      },
    ],
  },
  {
    id: "itransition",
    company: "Itransition Group",
    role: { en: "Software Engineer Intern", ru: "Software Engineer (стажёр)", uz: "Software Engineer (stajyor)" },
    period: { en: "Jun — Aug 2026", ru: "июнь — авг. 2026", uz: "2026-yil iyun — avg." },
    place: { en: "Tashkent · remote", ru: "Ташкент · удалённо", uz: "Toshkent · masofaviy" },
    points: [
      {
        en: "Internship in full-stack architecture and enterprise integrations; built and deployed a final project.",
        ru: "Стажировка по full-stack архитектуре и корпоративным интеграциям; разработал и развернул итоговый проект.",
        uz: "Full-stack arxitektura va korporativ integratsiyalar bo‘yicha amaliyot; yakuniy loyihani ishlab chiqib, joylashtirdim.",
      },
      {
        en: "REST APIs, Vercel and Render; explored Salesforce, Odoo and Power Automate integrations.",
        ru: "REST API, Vercel и Render; изучал интеграции с Salesforce, Odoo и Power Automate.",
        uz: "REST API, Vercel va Render; Salesforce, Odoo va Power Automate integratsiyalarini o‘rgandim.",
      },
    ],
  },
];

export type ProjectKind = "3d" | "fullstack" | "mobile" | "contribution";

export type Project = {
  id: string;
  title: string;
  kind: ProjectKind;
  summary: L;
  stack: string[];
  demo?: string;
  code?: string;
  badge?: L;
};

const prototype: L = { en: "prototype", ru: "прототип", uz: "prototip" };

export const projects: Project[] = [
  {
    id: "neovex-one-core",
    title: "Neovex One Core",
    kind: "3d",
    summary: {
      en: "Scroll-driven 3D concept site for Neovex: one neural sphere morphs into a house, interfaces and a robot. Seven linked scene states, procedural geometry, GLSL materials.",
      ru: "3D-сайт-концепт для Neovex: нейронная сфера при прокрутке превращается в дом, интерфейсы и робота. Семь связанных состояний сцены, процедурная геометрия, GLSL.",
      uz: "Neovex uchun 3D konsept-sayt: aylantirilganda neyron sfera uyga, interfeyslarga va robotga aylanadi. Yettita bog‘langan sahna holati, protsedurali geometriya, GLSL.",
    },
    stack: ["Next.js", "TypeScript", "Three.js", "R3F", "GSAP"],
    demo: "https://neovex-one-core-concept.vercel.app/",
    code: "https://github.com/Shuhrat25/neovex-one-core-concept",
  },
  {
    id: "solar-system",
    title: "Solar System 3D",
    kind: "3d",
    summary: {
      en: "Fly between planets on a rocket: cinematic intro, autopilot to any planet, orbit camera, keyboard and touch controls with a virtual stick.",
      ru: "Полёт между планетами на ракете: кинематографичное вступление, автопилот к любой планете, орбитальная камера, управление с клавиатуры и сенсорный стик.",
      uz: "Raketada sayyoralar orasida parvoz: kinematografik kirish, istalgan sayyoraga avtopilot, orbital kamera, klaviatura va sensorli boshqaruv.",
    },
    stack: ["React", "Three.js", "R3F", "Postprocessing"],
    demo: "https://solar-system-3-d-gamma.vercel.app/",
    code: "https://github.com/Shuhrat25/Solar-System-3D",
  },
  {
    id: "restorers-bench",
    title: "Restorer’s Bench",
    kind: "3d",
    summary: {
      en: "Museum restoration game: carry a fragile find, drop it and it shatters procedurally; reassemble the shards while a hologram shows what was lost.",
      ru: "Игра-реставрация для музея: донесите хрупкую находку — уроните, и она процедурно расколется; соберите черепки, а утраченное покажет голограмма.",
      uz: "Muzey uchun restavratsiya o‘yini: mo‘rt topilmani olib boring — tushirsangiz, protsedurali tarzda sinadi; parchalarni yig‘ing, yo‘qolganini gologramma ko‘rsatadi.",
    },
    stack: ["React", "TypeScript", "Three.js", "R3F"],
    demo: "https://restorers-bench.vercel.app/",
    code: "https://github.com/Shuhrat25/restorers-bench",
  },
  {
    id: "hologram-house",
    title: "Hologram House",
    kind: "3d",
    summary: {
      en: "3D model gallery with two modes: real PBR materials and a custom GLSL hologram that re-materialises on every switch. Models optimised with glTF-Transform.",
      ru: "Галерея 3D-моделей в двух режимах: реальные PBR-материалы и собственная GLSL-голограмма с анимацией материализации. Модели оптимизированы через glTF-Transform.",
      uz: "Ikki rejimli 3D modellar galereyasi: haqiqiy PBR materiallar va har safar qayta paydo bo‘ladigan GLSL gologramma. Modellar glTF-Transform bilan optimallashtirilgan.",
    },
    stack: ["React", "TypeScript", "Three.js", "GLSL"],
    demo: "https://hologram-house.vercel.app/",
    code: "https://github.com/Shuhrat25/hologram-house",
  },
  {
    id: "mahoratli-pedagog",
    title: "Mahoratli pedagog",
    kind: "fullstack",
    summary: {
      en: "Learning platform for future teachers: lessons unlocked server-side, auto-graded tests, assignments with files, forum, live lessons, jigsaw puzzles and WebSocket notifications. Hardened: role checks, login/upload limits, HTML sanitisation, session revocation, transactions and grade audit.",
      ru: "Платформа для будущих учителей: уроки открываются по порядку на сервере, автотесты, задания с файлами, форум, live-уроки, пазлы и уведомления по WebSocket. Защита: проверки ролей, лимиты входа и загрузок, очистка HTML, отзыв сессий, транзакции и аудит оценок.",
      uz: "Bo‘lajak o‘qituvchilar uchun platforma: darslar serverda ketma-ket ochiladi, avtomatik testlar, fayl topshiriqlari, forum, jonli darslar, boshqotirmalar va WebSocket bildirishnomalari. Himoya: rollar tekshiruvi, kirish va yuklash limitlari, HTML tozalash, sessiyalarni bekor qilish, tranzaksiyalar va baholar auditi.",
    },
    stack: ["Next.js", "Express", "Prisma", "PostgreSQL", "WebSocket"],
    demo: "https://mahoratli-pedagog.vercel.app/",
    code: "https://github.com/Shuhrat25/mahoratli_pedagog",
  },
  {
    id: "talentpulse",
    title: "TalentPulse",
    kind: "fullstack",
    summary: {
      en: "CV and position management for candidates, recruiters and admins: typed attributes, automatic CV assembly, optimistic locking, print view, QR and CSV export. Working read-only Salesforce integration via OAuth with a visible connection check.",
      ru: "Управление CV и вакансиями для кандидатов, рекрутеров и админа: типизированные атрибуты, автосборка CV, optimistic locking, печатный вид, QR и CSV-экспорт. Работающая read-only интеграция с Salesforce через OAuth с проверкой подключения в интерфейсе.",
      uz: "Nomzodlar, rekruterlar va admin uchun CV va vakansiyalarni boshqarish: tiplangan atributlar, CV’ni avtomatik yig‘ish, optimistic locking, chop etish ko‘rinishi, QR va CSV eksport. OAuth orqali ishlaydigan read-only Salesforce integratsiyasi.",
    },
    stack: ["React", "TypeScript", "Express", "Prisma", "PostgreSQL", "Salesforce"],
    demo: "https://cv-management-system-57ra-dun.vercel.app/",
    code: "https://github.com/Shuhrat25/cv-management-system",
  },
  {
    id: "battleship",
    title: "Battleship Multiplayer",
    kind: "fullstack",
    summary: {
      en: "Real-time battleship: Socket.IO rooms, a smart bot that finishes ships, step-by-step match replays, hand-drawn SVG fleet and 10×10 to 20×20 boards.",
      ru: "«Морской бой» в реальном времени: комнаты Socket.IO, умный бот, который добивает корабли, пошаговые повторы матчей, SVG-флот и поля от 10×10 до 20×20.",
      uz: "Real vaqtdagi «Dengiz jangi»: Socket.IO xonalari, kemalarni oxirigacha yo‘q qiladigan aqlli bot, o‘yin takrorlari, SVG flot va 10×10 dan 20×20 gacha maydonlar.",
    },
    stack: ["React", "Tailwind", "Node.js", "Socket.IO"],
    demo: "https://battle-ship-jet.vercel.app/",
    code: "https://github.com/Shuhrat25/Battle_ship",
  },
  {
    id: "music-store",
    title: "Music Store Generator",
    kind: "fullstack",
    summary: {
      en: "Deterministic catalogue generator: the same 64-bit seed, region and page always return the same tracks, covers and audio previews. Table and infinite gallery views.",
      ru: "Детерминированный генератор каталога: одинаковый 64-битный seed, регион и страница всегда дают те же треки, обложки и аудио-превью. Таблица и бесконечная галерея.",
      uz: "Deterministik katalog generatori: bir xil 64-bitli seed, mintaqa va sahifa doimo bir xil treklar, muqovalar va audio-namunalarni beradi. Jadval va cheksiz galereya.",
    },
    stack: ["React", "TypeScript", "Express", "Web Audio API"],
    demo: "https://music-store-generator.vercel.app/",
    code: "https://github.com/Shuhrat25/music-store-generator",
  },
  {
    id: "video-player",
    title: "Video Player",
    kind: "fullstack",
    badge: prototype,
    summary: {
      en: "Video catalogue with a custom player: frame previews on the progress bar, hotkeys, resume watching, skip intro/outro, seasons and episodes, admin dashboard.",
      ru: "Видеокаталог с собственным плеером: превью кадра на прогресс-баре, горячие клавиши, продолжение просмотра, пропуск опенинга, сезоны и серии, админ-панель.",
      uz: "O‘z pleyeriga ega video katalog: progress-barda kadr ko‘rinishi, tezkor tugmalar, ko‘rishni davom ettirish, intro’ni o‘tkazib yuborish, fasllar va seriyalar, admin panel.",
    },
    stack: ["React", "TypeScript", "Express", "Drizzle", "PostgreSQL"],
    demo: "https://video-player-sandy-delta.vercel.app/",
    code: "https://github.com/Shuhrat25/video_player",
  },
  {
    id: "admin-workspace",
    title: "Admin Workspace",
    kind: "fullstack",
    summary: {
      en: "User management: registration and login, filtering, sorting, pagination, bulk block, unblock and delete, light and dark themes.",
      ru: "Управление пользователями: регистрация и вход, фильтрация, сортировка, пагинация, массовая блокировка, разблокировка и удаление, светлая и тёмная темы.",
      uz: "Foydalanuvchilarni boshqarish: ro‘yxatdan o‘tish va kirish, filtrlash, saralash, sahifalash, ommaviy bloklash va o‘chirish, yorug‘ va qorong‘i mavzular.",
    },
    stack: ["React", "Express", "PostgreSQL", "bcrypt"],
    demo: "https://admin-panel-seven-gold.vercel.app/",
    code: "https://github.com/Shuhrat25/Admin_panel",
  },
  {
    id: "iccu-kiosk",
    title: "ICCU Museum Kiosk",
    kind: "contribution",
    summary: {
      en: "Contributed fixes to the museum kiosk app of the Center of Islamic Civilization in Uzbekistan: freeze analysis, image handling, offline caching, Android WebView diagnostics and recovery, kiosk APK builds and tablet checks.",
      ru: "Исправления в приложении музейных витрин Центра исламской цивилизации в Узбекистане: анализ зависаний, обработка изображений, офлайн-кэш, диагностика и восстановление Android WebView, сборка APK и проверка на планшете.",
      uz: "O‘zbekistondagi Islom sivilizatsiyasi markazining muzey kiosk ilovasiga tuzatishlar: qotib qolishlar tahlili, rasmlarni qayta ishlash, oflayn kesh, Android WebView diagnostikasi va tiklash, APK yig‘ish.",
    },
    stack: ["React", "TypeScript", "PWA", "Service Worker", "Android WebView", "Expo"],
    demo: "https://iccu.uz/ru",
  },
  {
    id: "metafora",
    title: "Metafora",
    kind: "mobile",
    summary: {
      en: "Android visual-riddle game: interpret an image, type the answer, use hints; online questions via Retrofit with offline fallback to Room.",
      ru: "Android-игра с визуальными загадками: угадать смысл картинки, ввести ответ, взять подсказку; онлайн-вопросы через Retrofit с офлайн-резервом в Room.",
      uz: "Vizual topishmoqli Android o‘yini: rasm ma’nosini toping, javob yozing, maslahatdan foydalaning; Retrofit orqali onlayn savollar va Room’da oflayn zaxira.",
    },
    stack: ["Kotlin", "Jetpack Compose", "Room", "Retrofit"],
    code: "https://github.com/Shuhrat25/Metafora_apk",
  },
  {
    id: "ozbek-land",
    title: "O‘zbek Land",
    kind: "mobile",
    summary: {
      en: "Uzbek-language Android quiz with a local user profile and question screens.",
      ru: "Android-викторина на узбекском языке с локальным профилем и экранами вопросов.",
      uz: "Mahalliy profil va savol ekranlariga ega o‘zbek tilidagi Android viktorina.",
    },
    stack: ["Kotlin", "Jetpack Compose", "Material 3"],
    code: "https://github.com/Shuhrat25/Ozbek_Land__apk",
  },
];

export const skills: { id: string; group: L; items: string[] }[] = [
  { id: "frontend", group: { en: "Frontend", ru: "Frontend", uz: "Frontend" }, items: ["JavaScript", "TypeScript", "React", "Next.js", "HTML5 / CSS3", "Tailwind CSS"] },
  { id: "backend", group: { en: "Backend & data", ru: "Backend и данные", uz: "Backend va ma’lumotlar" }, items: ["Node.js", "Express", "REST API", "PostgreSQL", "Prisma", "Drizzle ORM", "WebSocket", "Socket.IO"] },
  { id: "3d", group: { en: "3D web", ru: "3D в браузере", uz: "3D veb" }, items: ["Three.js", "React Three Fiber", "GLSL", "GSAP"] },
  { id: "mobile", group: { en: "Mobile & other", ru: "Mobile и другое", uz: "Mobil va boshqalar" }, items: ["Kotlin", "Jetpack Compose", "Room", "Retrofit", "Flutter", "Python", "Django"] },
  { id: "deploy", group: { en: "Delivery", ru: "Деплой", uz: "Joylashtirish" }, items: ["Git / GitHub", "Vercel", "Render", "Supabase"] },
  { id: "ai", group: { en: "AI tools", ru: "AI-инструменты", uz: "AI vositalari" }, items: ["Claude Code", "Codex", "Antigravity", "Gemini API", "AI image & video"] },
];

export const cardinal = {
  tagline: {
    en: "Human-in-the-Loop AI platform for game Live-Ops",
    ru: "Human-in-the-Loop AI-платформа для игровых Live-Ops",
    uz: "O‘yin Live-Ops’i uchun Human-in-the-Loop AI platforma",
  } as L,
  intro: {
    en: "A B2B multi-tenant SaaS that generates Live-Ops events, quests and assets for game studios. AI prepares the content, the studio approves it with one click — nothing reaches a live game without a human.",
    ru: "B2B multi-tenant SaaS, который генерирует Live-Ops события, квесты и ассеты для игровых студий. ИИ готовит контент, студия утверждает его в один клик — без человека ничего не попадает в живую игру.",
    uz: "O‘yin studiyalari uchun Live-Ops tadbirlari, kvestlar va assetlarni yaratadigan B2B multi-tenant SaaS. Kontentni AI tayyorlaydi, studiya bir bosishda tasdiqlaydi — insonsiz hech narsa o‘yinga chiqmaydi.",
  } as L,
  pipeline: [
    { title: { en: "Analyse", ru: "Анализ", uz: "Tahlil" } as L, text: { en: "Reads the game's style, balance rules and trends.", ru: "Изучает стиль игры, правила баланса и тренды.", uz: "O‘yin uslubi, balans qoidalari va trendlarni o‘rganadi." } as L },
    { title: { en: "Generate", ru: "Генерация", uz: "Generatsiya" } as L, text: { en: "Events, quests, 3D assets, audio and promo.", ru: "События, квесты, 3D-ассеты, звук и промо.", uz: "Tadbirlar, kvestlar, 3D assetlar, audio va promo." } as L },
    { title: { en: "Approve", ru: "Утверждение", uz: "Tasdiqlash" } as L, text: { en: "AI co-pilot dialogue and one-click manual override.", ru: "Диалог с AI-копилотом и ручная замена в один клик.", uz: "AI yordamchi bilan muloqot va bir bosishda qo‘lda almashtirish." } as L },
    { title: { en: "Deploy", ru: "Деплой", uz: "Joylashtirish" } as L, text: { en: "Sandbox check, then release through an isolated SDK/API.", ru: "Проверка в песочнице, затем выпуск через изолированный SDK/API.", uz: "Sandbox’da tekshiruv, so‘ng izolyatsiyalangan SDK/API orqali chiqarish." } as L },
  ],
  architecture: {
    en: "Non-blocking by design: AI calls run off the game loop, and if the network or model fails the SDK falls back to deterministic rules, so players see no downtime.",
    ru: "Архитектура не блокирует игру: AI-запросы идут вне игрового цикла, а при сбое сети или модели SDK переключается на детерминированные правила — игроки не замечают простоя.",
    uz: "Arxitektura o‘yinni bloklamaydi: AI so‘rovlari o‘yin siklidan tashqarida ishlaydi, tarmoq yoki model ishlamay qolsa, SDK deterministik qoidalarga o‘tadi.",
  } as L,
  model: {
    en: "Tiered subscription by player count ($200 — $2,000+/month), success fee on event revenue, enterprise integrations.",
    ru: "Подписка по числу игроков ($200 — $2 000+/мес), процент от выручки событий, enterprise-интеграции.",
    uz: "O‘yinchilar soniga qarab obuna ($200 — $2 000+/oy), tadbirlar daromadidan ulush, enterprise integratsiyalar.",
  } as L,
  ask: {
    en: "Raising a $150,000 pre-seed round for 12 months: MVP, Unity/Unreal SDKs and pilots with 3–5 studios. Looking for pilot partners and advisors.",
    ru: "Привлекаем pre-seed раунд $150 000 на 12 месяцев: MVP, SDK для Unity/Unreal и пилоты с 3–5 студиями. Ищем пилотных партнёров и эдвайзеров.",
    uz: "12 oylik $150 000 pre-seed raund jalb qilinmoqda: MVP, Unity/Unreal uchun SDK va 3–5 studiya bilan pilotlar. Pilot hamkorlar va maslahatchilar izlanmoqda.",
  } as L,
  status: {
    en: "In development. The 85% cost reduction is the product goal, not a measured result yet.",
    ru: "В разработке. Снижение затрат на 85% — цель продукта, а не измеренный результат.",
    uz: "Ishlab chiqilmoqda. Xarajatlarni 85% ga kamaytirish — mahsulot maqsadi, hali o‘lchangan natija emas.",
  } as L,
};
