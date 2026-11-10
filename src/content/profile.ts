// Work-only facts about Shuhrat. Sources: CV (EN/RU), GitHub README, LinkedIn, project repos, CARDINAL deck and one-pager.
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

// Captured from the live demo by scripts/capture-previews.mjs into public/projects/:
// a 960×600 poster and, for the 3D projects, a muted 4-second loop.
export type ProjectPreview = { image: string; video?: string };

export type Project = {
  id: string;
  title: string;
  kind: ProjectKind;
  summary: L;
  stack: string[];
  demo?: string;
  code?: string;
  badge?: L;
  preview?: ProjectPreview;
  /** What Yui says on "Tell me more": adds to the summary, one clip (public/voice/<lang>/project-<id>.mp3). */
  story?: L;
};

const prototype: L = { en: "prototype", ru: "прототип", uz: "prototip" };
const shot = (id: string, video = false): ProjectPreview => ({
  image: `/projects/${id}.webp`,
  ...(video ? { video: `/projects/${id}.mp4` } : {}),
});

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
    preview: shot("neovex-one-core", true),
    story: {
      en: "He built this concept site during his frontend internship at Neovex. The key idea: every shape is a continuous mapping of the original sphere, so neighbouring particles stay neighbours, the neural links never turn into a tangle of lines, and morphing is plain interpolation in the vertex shader. The same house goes through three states: whole for 3D, shrunk above a person's open palm for AR, and life-size with the camera inside for VR.",
      ru: "Этот сайт-концепт он сделал во время frontend-стажировки в Neovex. Главное решение: каждая форма — непрерывное отображение исходной сферы, поэтому соседние частицы остаются соседями, нейронные связи не превращаются в хаос линий, а морфинг сводится к интерполяции в вершинном шейдере. Один и тот же дом проходит три состояния: целиком для 3D, уменьшенным над раскрытой ладонью человека для AR и в натуральную величину, с камерой внутри, для VR.",
      uz: "Bu konsept-saytni u Neovex’da frontend stajyor sifatida yaratgan. Asosiy yechim: har bir shakl dastlabki sferaning uzluksiz akslantirilishi, shuning uchun qo‘shni zarrachalar qo‘shniligicha qoladi, neyron bog‘lanishlar tartibsiz chiziqlarga aylanmaydi, morfing esa vertex sheyderdagi oddiy interpolyatsiyaga aylanadi. Bitta uy uch holatdan o‘tadi: 3D uchun butunligicha, AR uchun kichraytirilib, inson ochiq kafti ustida, VR uchun esa haqiqiy o‘lchamda, kamera ichkarida.",
    },
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
    preview: shot("solar-system", true),
    story: {
      en: "There are no texture files here: every planet surface, cloud layer and ring is painted on a canvas at load time from 3D noise sampled on a sphere, so the maps are seamless and the project stays light. Orbital speeds follow Kepler's third law, while planets are enlarged so they don't shrink to dots. Flight data lives outside React, and the HUD writes straight to the DOM instead of re-rendering sixty times a second. The rocket can even be swapped for an astronaut.",
      ru: "В проекте нет ни одного файла текстур: поверхности планет, облака и кольца рисуются на canvas при загрузке из трёхмерного шума, взятого в точках сферы, поэтому карты бесшовны, а проект остаётся лёгким. Скорости орбит подчиняются третьему закону Кеплера, а планеты увеличены, чтобы не превратиться в точки. Данные полёта живут вне React, и HUD пишет прямо в DOM, а не перерисовывается шестьдесят раз в секунду. А ракету можно даже сменить на космонавта в скафандре.",
      uz: "Loyihada birorta ham tekstura fayli yo‘q: sayyoralar yuzasi, bulutlar va halqalar yuklanish paytida sfera nuqtalaridan olingan uch o‘lchamli shovqin asosida canvas’da chiziladi, shuning uchun xaritalar choksiz, loyiha esa yengil. Orbitalar tezligi Keplerning uchinchi qonuniga bo‘ysunadi, sayyoralar esa nuqtaga aylanib qolmasligi uchun kattalashtirilgan. Parvoz ma’lumotlari React’dan tashqarida saqlanadi, HUD esa soniyasiga oltmish marta qayta chizilmasdan to‘g‘ridan-to‘g‘ri DOM’ga yozadi. Raketani hatto skafandrdagi kosmonavtga almashtirish mumkin.",
    },
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
    preview: shot("restorers-bench", true),
    story: {
      en: "The exhibit is a real scan of an ancient Greek black-figure krater, split by a Voronoi diagram over its own triangles, so a new exhibit needs no manual markup. When the find slips, the whole fall is simulated at once: the impact point is known before landing, the new fracture is computed in a Web Worker while it is still falling, and shards come out finer where it hit. Even the crack and the ring of ceramic are synthesised with Web Audio, not recorded.",
      ru: "Экспонат — настоящий скан древнегреческого чернофигурного кратера, а раскол строится диаграммой Вороного прямо по его треугольникам, поэтому новый экспонат не требует ручной разметки. Когда находка срывается, всё падение просчитывается сразу: точка удара известна заранее, новый раскол считается в Web Worker, пока она ещё летит, и у места удара черепки мельче. Даже треск и звон керамики синтезированы через Web Audio, а не записаны.",
      uz: "Eksponat — qadimgi yunon qora figurali kraterning haqiqiy skani, parchalar esa bevosita uning uchburchaklari bo‘yicha Voronoy diagrammasi bilan hisoblanadi, shuning uchun yangi eksponat qo‘lda belgilashni talab qilmaydi. Topilma qo‘ldan tushib ketganda butun qulash darhol hisoblanadi: zarba nuqtasi oldindan ma’lum, yangi parchalanish u hali tushayotgan paytda Web Worker’da hisoblanadi, zarba joyida esa parchalar maydaroq bo‘ladi. Hatto keramikaning chirsillashi va jarangi ham yozuv emas, Web Audio orqali sintez qilingan.",
    },
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
    preview: shot("hologram-house", true),
    story: {
      en: "The hologram draws the same geometry in three passes: one fixes the nearest surface, one shows only what lies behind it, and one adds exactly one hologram layer. So the shell stays smooth while the interior reads through like an X-ray, without the mush of ordinary transparency. The model builds bottom-up under beams from three drones, timed by the clock rather than by frames, so low fps doesn't stretch it. KTX2 textures cut the sword's video memory about fourfold.",
      ru: "Голограмма рисует одну и ту же геометрию в три прохода: первый фиксирует ближайшую поверхность, второй показывает только то, что за ней, третий кладёт ровно один голограммный слой. Поэтому оболочка остаётся гладкой, а начинка просвечивает как на рентгене, без каши обычной прозрачности. Модель собирается снизу вверх под лучами трёх дронов, и время считается по часам, а не по кадрам, так что просадка fps не растягивает появление. KTX2-текстуры уменьшили видеопамять меча примерно вчетверо.",
      uz: "Gologramma bitta geometriyani uch o‘tishda chizadi: birinchisi eng yaqin sirtni belgilaydi, ikkinchisi faqat uning ortidagini ko‘rsatadi, uchinchisi aynan bitta gologramma qatlamini qo‘shadi. Shuning uchun qobiq silliq qoladi, ichki qismi esa oddiy shaffoflikdagi chalkashliksiz rentgendagidek ko‘rinadi. Model uchta dron nurlari ostida pastdan yuqoriga yig‘iladi, vaqt kadrlar bo‘yicha emas, soat bo‘yicha hisoblanadi, shuning uchun fps tushsa ham paydo bo‘lish cho‘zilmaydi. KTX2 teksturalar qilichning video xotirasini taxminan to‘rt baravar kamaytirdi.",
    },
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
    preview: shot("mahoratli-pedagog"),
    story: {
      en: "Mahoratli pedagog has an Uzbek interface and a curriculum built around national values: folk tales, for example, are turned into comics. The test timer lives on the server: the browser only gets the end time, so a reload buys no extra seconds. Teachers import tests straight from DOCX or PDF with a simple markup. In jigsaw lessons every joint is three Bézier curves shared by both neighbouring pieces, so they fit exactly, and the server rejects impossibly fast solves.",
      ru: "Интерфейс Mahoratli pedagog на узбекском, а учебная программа построена на национальных ценностях: например, народные сказки превращены в комиксы. Таймер теста живёт на сервере: браузер получает только время окончания, поэтому перезагрузка страницы не добавляет ни секунды. Тесты учитель загружает прямо из DOCX или PDF с простой разметкой. В пазлах каждый стык собран из трёх кривых Безье, общих для обеих соседних деталей, поэтому они сходятся точно, а слишком быстрые решения сервер отклоняет.",
      uz: "Mahoratli pedagog interfeysi o‘zbek tilida, o‘quv dasturi esa milliy qadriyatlarga tayanadi: masalan, xalq ertaklari komikslarga aylantirilgan. Test taymeri serverda ishlaydi: brauzer faqat tugash vaqtini oladi, shuning uchun sahifani qayta yuklash bir soniya ham qo‘shmaydi. O‘qituvchi testlarni oddiy belgilash bilan to‘g‘ridan-to‘g‘ri DOCX yoki PDF fayldan yuklaydi. Boshqotirmada har bir chok ikki qo‘shni bo‘lak uchun umumiy bo‘lgan uchta Bezye egri chizig‘idan yasalgan, shuning uchun ular aniq mos tushadi, juda tez yechimlarni esa server rad etadi.",
    },
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
    story: {
      en: "In TalentPulse a candidate fills in one profile, and a recruiter describes each position as attributes and rules, so the candidate sees which requirement is missing. Each CV is assembled from that profile and cannot be published while required fields are empty. A save based on an outdated version gets a conflict instead of silently overwriting newer data. The public Salesforce check caches even failures for a minute and returns only a status, no tokens or CRM data.",
      ru: "В TalentPulse кандидат заполняет один профиль, а рекрутер описывает вакансию набором атрибутов и правил, и кандидат видит, какого требования ему не хватает. CV под вакансию собирается из этого профиля и не публикуется, пока пусты обязательные поля. Сохранение на основе устаревшей версии получает конфликт, а не тихо перезаписывает более новые данные. Публичная проверка Salesforce кеширует на минуту даже неудачи и возвращает только статус, без токенов и данных CRM.",
      uz: "TalentPulse’da nomzod bitta profilni to‘ldiradi, rekruter esa vakansiyani atributlar va qoidalar orqali tavsiflaydi, shunda nomzod qaysi talab yetishmayotganini ko‘radi. Har bir CV shu profildan yig‘iladi va majburiy maydonlar to‘ldirilmaguncha e’lon qilinmaydi. Eskirgan versiya asosidagi saqlash yangiroq ma’lumotni jimgina ustidan yozmaydi, balki ziddiyat qaytaradi. Salesforce’ning ochiq tekshiruvi hatto muvaffaqiyatsiz natijani ham bir daqiqa keshlaydi va tokenlar yoki CRM ma’lumotlarisiz faqat holatni qaytaradi.",
    },
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
    preview: shot("battleship"),
    story: {
      en: "The bot in Battleship Multiplayer fires at random until it hits, then tries the neighbouring cells, and after a second hit works out the ship's direction and follows that line. When a ship sinks, the server marks the cells around it, since ships may not touch even diagonally. Every shot is stored as an event, and the replay plays them back with both fleets revealed. In a two-player match, a disconnected player has fifteen seconds to return, or the opponent wins.",
      ru: "Бот в Battleship Multiplayer стреляет наугад, пока не попадёт, затем проверяет соседние клетки, а после второго попадания определяет направление корабля и идёт вдоль линии. Когда корабль потоплен, сервер сам отмечает клетки вокруг него, ведь корабли не могут касаться даже углами. Каждый выстрел сохраняется как событие, и повтор проигрывает их с открытыми флотами обоих игроков. В партии двух игроков у отключившегося есть пятнадцать секунд, чтобы вернуться, иначе побеждает соперник.",
      uz: "Battleship Multiplayer’dagi bot nishonga tekkuncha tasodifiy o‘q uzadi, so‘ng qo‘shni kataklarni tekshiradi, ikkinchi marta tekkanidan keyin esa kema yo‘nalishini aniqlab, shu chiziq bo‘ylab davom etadi. Kema cho‘kkanda server uning atrofidagi kataklarni o‘zi belgilaydi, chunki kemalar hatto burchaklari bilan ham tegolmaydi. Har bir o‘q hodisa sifatida saqlanadi va o‘yin takrori ularni ikkala flot ochiq holda qayta ijro etadi. Ikki o‘yinchili partiyada uzilgan o‘yinchiga qaytish uchun o‘n besh soniya bor, aks holda raqib g‘alaba qozonadi.",
    },
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
    preview: shot("music-store"),
    story: {
      en: "Music Store Generator keeps no catalogue at all: each track gets its own seed from the user's seed and its position, so any page can be built at once without generating earlier ones. Likes come from a separate random stream, so the likes slider changes only the counts, never the titles. Each preview melody is six notes of a pentatonic scale synthesised right in the browser, with no audio files. The region picks US, German or Ukrainian locale data.",
      ru: "Music Store Generator вообще не хранит каталог: у каждого трека свой seed из пользовательского seed и номера позиции, поэтому любую страницу можно построить сразу, не генерируя предыдущие. Лайки берутся из отдельного случайного потока, так что ползунок лайков меняет только их число, но не названия. Мелодия превью — шесть нот пентатоники, синтезированных прямо в браузере, без аудиофайлов. Регион выбирает данные локали США, Германии или Украины.",
      uz: "Music Store Generator katalogni umuman saqlamaydi: har bir trekning seed’i foydalanuvchi seed’i va tartib raqamidan olinadi, shuning uchun istalgan sahifani oldingilarini yaratmasdan darhol qurish mumkin. Layklar alohida tasodifiy oqimdan olinadi, shu sababli layklar slayderi nomlarni emas, faqat layklar sonini o‘zgartiradi. Namuna kuyi brauzerning o‘zida sintez qilinadigan pentatonikaning oltita notasidan iborat, audiofayllarsiz. Mintaqa AQSh, Germaniya yoki Ukraina lokal ma’lumotlarini tanlaydi.",
    },
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
    story: {
      en: "For the frame preview, a hidden, muted copy of the video jumps to the moment under the cursor and draws that frame on a tiny canvas. The browser saves the viewer's place per title every four seconds, on pause and on tab close, and the next episode carries into the next season. On the server, Drizzle links titles, seasons with a dubbing studio, and episodes with quality sources, subtitles and intro timecodes. It is still a prototype, demoed on an FFmpeg test clip.",
      ru: "Для превью кадра скрытая беззвучная копия видео перематывается на момент под курсором и рисует этот кадр на маленьком canvas. Место просмотра сохраняется в браузере для каждого тайтла каждые четыре секунды, на паузе и при закрытии вкладки, а следующая серия подхватывается даже из следующего сезона. На сервере схема Drizzle связывает тайтлы, сезоны со студией озвучки и серии с источниками разного качества, субтитрами и таймкодами опенинга. Это пока прототип, а в демо используется тестовый ролик, созданный через FFmpeg.",
      uz: "Kadr ko‘rinishi uchun videoning yashirin, ovozsiz nusxasi kursor turgan lahzaga o‘tadi va o‘sha kadrni kichik canvas’ga chizadi. Har bir film yoki serialda to‘xtagan joy brauzerda har to‘rt soniyada, pauzada va sahifa yopilganda saqlanadi, keyingi seriya esa keyingi fasldan ham olinadi. Serverda Drizzle sxemasi film va seriallarni, ovozlashtirish studiyasi biriktirilgan fasllarni va sifat manbalari, subtitrlar hamda intro taymkodlari bor seriyalarni bog‘laydi. Bu hozircha prototip, demoda FFmpeg’da yaratilgan sinov roligi ishlatiladi.",
    },
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
    preview: shot("admin-workspace"),
    story: {
      en: "The key detail is the status check: before every protected request the server re-reads the caller's status in PostgreSQL, so an admin who blocks or deletes their own account is sent back to the login page at once. Bulk actions run as one SQL query over an array of IDs, passwords are hashed with bcrypt, and a unique index on email turns a duplicate into a clear error. It is openly a learning demo: the check relies on a user ID header, not a signed session.",
      ru: "Самое интересное здесь — проверка статуса: перед каждым защищённым запросом сервер заново читает статус пользователя в PostgreSQL, поэтому админ, заблокировавший или удаливший собственный аккаунт, сразу оказывается на странице входа. Массовые действия выполняются одним SQL-запросом по массиву ID, пароли хешируются через bcrypt, а уникальный индекс на email превращает дубликат в понятную ошибку. Проект честно описан как учебный: проверка идёт по заголовку с ID пользователя, а не по подписанной сессии.",
      uz: "Eng qiziq joyi — holatni tekshirish: har bir himoyalangan so‘rovdan oldin server foydalanuvchi holatini PostgreSQL’dan qayta o‘qiydi, shuning uchun o‘z akkauntini bloklagan yoki o‘chirgan admin darhol kirish sahifasiga qaytadi. Ommaviy amallar ID massivi bo‘yicha bitta SQL so‘rov bilan bajariladi, parollar bcrypt bilan xeshlanadi, email’dagi unikal indeks esa takroriy manzilni tushunarli xatoga aylantiradi. Loyiha ochiqchasiga o‘quv namunasi deb tavsiflangan: tekshiruv imzolangan sessiya emas, foydalanuvchi ID sarlavhasi orqali ishlaydi.",
    },
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
    story: {
      en: "He did not build this app from scratch: he joined an existing application for the museum display stands of the Center in Tashkent, which holds more than three thousand artifacts. He helped analyse why the app froze and took part in the fixes, refining image handling and offline caching. He also worked on diagnostics and recovery for Android WebView, prepared the APKs for the display stands and checked them on a tablet.",
      ru: "Это приложение он не писал с нуля: он подключился к уже существующему приложению для музейных витрин Центра в Ташкенте, где собрано больше трёх тысяч артефактов. Он помогал разобраться, почему приложение зависало, участвовал в исправлениях и дорабатывал обработку изображений и офлайн-кэширование. Ещё он занимался диагностикой и восстановлением Android WebView, готовил APK для витрин и проверял их на планшете.",
      uz: "Bu ilovani u noldan yozmagan: u uch mingdan ortiq artefakt jamlangan Toshkentdagi Markazning muzey vitrinalari uchun mavjud ilovaga qo‘shilgan. U ilova nega qotib qolayotganini aniqlashga yordam berdi, tuzatishlarda qatnashdi, rasmlarni qayta ishlash va oflayn keshlashni takomillashtirdi. Shuningdek, Android WebView diagnostikasi va tiklanishi ustida ishladi, vitrinalar uchun APK tayyorladi va ularni planshetda tekshirdi.",
    },
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
    story: {
      en: "Each riddle is a pair or trio of pictures hiding a short phrase in Uzbek: a book and a lightbulb mean that knowledge enlightens a person. It ships with 105 riddles built from about forty images, and before filling the local database it sorts them by his own difficulty score, where more pictures, longer answers and abstract words like justice or hope count higher. So the riddles go from easier to harder, with three lives and a best score kept on the phone.",
      ru: "Каждая загадка — это две или три картинки, за которыми спрятана короткая фраза на узбекском: книга и лампочка означают, что знание освещает человека. В приложении 105 встроенных загадок, собранных примерно из сорока изображений, и перед заполнением локальной базы оно сортирует их по придуманной им оценке сложности: больше картинок, длиннее ответ и абстрактные слова вроде «справедливость» или «надежда» дают больше баллов. Поэтому загадки идут от простых к сложным, у игрока три жизни, а рекорд сохраняется на телефоне.",
      uz: "Har bir topishmoq — ikki yoki uchta rasm, ularning ortida o‘zbekcha qisqa ibora yashiringan: kitob va lampochka bilim insonni yoritishini anglatadi. Ilovada qirqqa yaqin rasmdan tuzilgan 105 ta topishmoq bor, mahalliy bazani to‘ldirishdan oldin ilova ularni u o‘zi yozgan murakkablik bahosi bo‘yicha saralaydi: rasm ko‘p, javob uzun bo‘lsa yoki «adolat», «umid» kabi mavhum so‘zlar uchrasa, ball oshadi. Shuning uchun topishmoqlar osondan qiyinga qarab boradi, o‘yinchida uchta jon bor, rekord esa telefonda saqlanadi.",
    },
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
    story: {
      en: "The welcome screen asks for a name and an age from six to ten, and one section is third-grade mother-tongue tests. There are 95 questions, from the alphabet and sounds to synonyms, homonyms, proverbs, folk riddles and figurative phrases, where white gold means cotton. He modelled typed answers and multiple choice as one Kotlin sealed class, some with pictures, the order is shuffled each time the quiz starts, and the question list marks each card green or red.",
      ru: "На экране приветствия вводится имя и выбирается возраст от шести до десяти лет, а один из разделов — тесты по родному языку за третий класс. Всего 95 вопросов — от алфавита и звуков до синонимов, омонимов, пословиц, народных загадок и образных выражений, где «белое золото» означает хлопок. Вопросы с вводом ответа и с выбором варианта он описал одним sealed-классом на Kotlin, часть из них с картинками, порядок перемешивается при каждом запуске викторины, а в списке вопросов карточки потом становятся зелёными или красными.",
      uz: "Kirish ekranida ism yoziladi va oltidan o‘n yoshgacha bo‘lgan yosh tanlanadi, bo‘limlardan biri esa uchinchi sinf ona tili testlari. Jami 95 ta savol bor — alifbo va tovushlardan tortib ma’nodosh, shakldosh so‘zlar, maqollar, xalq topishmoqlari va «oq oltin» paxtani bildiradigan tasviriy ifodalargacha. Javob yoziladigan va variant tanlanadigan savollarni u Kotlin’dagi bitta sealed klass bilan ifodalagan, ba’zilarida rasm bor, viktorina har safar boshlanganda tartib aralashtiriladi, savollar ro‘yxatida esa kartochkalar yashil yoki qizilga bo‘yaladi.",
    },
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

export type CardinalItem = { label?: L; text: L };
export type CardinalSection = { id: string; title: L; body: L; items: CardinalItem[] };

// Sources: CARDINAL.pptx (Aug 2026, the latest; wins on conflicts), CARDINAL_One_Pager.pdf and
// cardinal_updated_pitch.pdf. Targets stay targets: it is pre-seed and in development.
export const cardinal = {
  tagline: {
    en: "Human-in-the-Loop AI platform for game Live-Ops",
    ru: "Human-in-the-Loop AI-платформа для игровых Live-Ops",
    uz: "O‘yin Live-Ops’i uchun Human-in-the-Loop AI platforma",
  } as L,
  intro: {
    en: "AI infrastructure for game Live-Ops: a B2B multi-tenant SaaS that automates events, quests and content for game studios under strict Human-in-the-Loop control.",
    ru: "AI-инфраструктура для игровых Live-Ops: B2B multi-tenant SaaS, который автоматизирует события, квесты и контент для игровых студий под строгим контролем Human-in-the-Loop.",
    uz: "O‘yin Live-Ops’i uchun AI infratuzilma: o‘yin studiyalari uchun tadbirlar, kvestlar va kontentni qat’iy Human-in-the-Loop nazorati ostida avtomatlashtiradigan B2B multi-tenant SaaS.",
  } as L,
  facts: [
    { label: {
      en: "Product",
      ru: "Продукт",
      uz: "Mahsulot",
    }, text: {
      en: "a cloud platform, a studio dashboard and engine SDKs.",
      ru: "облачная платформа, панель студии и SDK для движков.",
      uz: "bulutli platforma, studiya paneli va o‘yin dvigatellari uchun SDK.",
    } },
    { label: {
      en: "Engines",
      ru: "Движки",
      uz: "Dvigatellar",
    }, text: {
      en: "Unity and Unreal Engine; custom engines through a REST API.",
      ru: "Unity и Unreal Engine; собственные движки — через REST API.",
      uz: "Unity va Unreal Engine; maxsus dvigatellar — REST API orqali.",
    } },
    { label: {
      en: "Stage",
      ru: "Стадия",
      uz: "Bosqich",
    }, text: {
      en: "in development; raising a pre-seed round.",
      ru: "в разработке; привлекается pre-seed раунд.",
      uz: "ishlab chiqilmoqda; pre-seed raund jalb qilinmoqda.",
    } },
  ] as CardinalItem[],
  sections: [
    {
      id: "problem",
      title: {
        en: "The problem",
        ru: "Проблема",
        uz: "Muammo",
      },
      body: {
        en: "Live-service games depend on a steady stream of new content, and producing it by hand is slow and expensive.",
        ru: "Игры-сервисы живут за счёт постоянного нового контента, а делать его вручную долго и дорого.",
        uz: "Live-service o‘yinlar doimiy yangi kontentga bog‘liq, uni qo‘lda tayyorlash esa sekin va qimmat.",
      },
      items: [
        { label: {
          en: "Cost and speed",
          ru: "Цена и скорость",
          uz: "Narx va tezlik",
        }, text: {
          en: "bi-weekly content updates take weeks of manual dev time and tens of thousands of dollars.",
          ru: "обновления раз в две недели отнимают недели ручной работы и десятки тысяч долларов.",
          uz: "har ikki haftalik yangilanishlar haftalab qo‘l mehnati va o‘n minglab dollarni oladi.",
        } },
        { label: {
          en: "Resource bottleneck",
          ru: "Нехватка ресурсов",
          uz: "Resurs yetishmasligi",
        }, text: {
          en: "mid-size and indie studios lack large dedicated Live-Ops teams, which leads to player churn.",
          ru: "у средних и инди-студий нет больших Live-Ops команд, и игроки уходят.",
          uz: "o‘rta va indie studiyalarda katta Live-Ops jamoalari yo‘q, natijada o‘yinchilar ketib qoladi.",
        } },
        { label: {
          en: "Fear of uncontrolled AI",
          ru: "Страх перед бесконтрольным ИИ",
          uz: "Nazoratsiz AI xavfi",
        }, text: {
          en: "unchecked generation can break a game's balance and economy.",
          ru: "непроверенная генерация может сломать баланс и экономику игры.",
          uz: "tekshirilmagan generatsiya o‘yin balansi va iqtisodini buzishi mumkin.",
        } },
        { label: {
          en: "Crossover barrier",
          ru: "Барьер кроссоверов",
          uz: "Krossover to‘sig‘i",
        }, text: {
          en: "brand and mythology crossovers are slow and costly to negotiate without a quick visual prototype.",
          ru: "без быстрого визуального прототипа договориться о кроссовере с брендом или мифологией долго и дорого.",
          uz: "tezkor vizual prototipsiz brend yoki mifologiya bilan krossover kelishuvi uzoq va qimmatga tushadi.",
        } },
      ],
    },
    {
      id: "solution",
      title: {
        en: "The solution",
        ru: "Решение",
        uz: "Yechim",
      },
      body: {
        en: "The AI is meant to prepare 90% of assets and mechanics, but nothing is deployed without an administrator's explicit one-click approval.",
        ru: "ИИ должен готовить 90% ассетов и механик, но без явного одобрения администратора в один клик ничего не выпускается.",
        uz: "AI assetlar va mexanikalarning 90% ini tayyorlashi ko‘zda tutilgan, ammo administrator bir bosishda aniq tasdiqlamaguncha hech narsa chiqarilmaydi.",
      },
      items: [
        { label: {
          en: "Core Orchestration",
          ru: "Core Orchestration",
          uz: "Core Orchestration",
        }, text: {
          en: "an LLM-powered engine that generates quest lines, balance parameters and event assets.",
          ru: "движок на LLM, который генерирует сюжетные линии квестов, параметры баланса и ассеты событий.",
          uz: "kvest syujetlari, balans parametrlari va tadbir assetlarini yaratadigan LLM asosidagi tizim.",
        } },
        { label: {
          en: "Studio Dashboard",
          ru: "Studio Dashboard",
          uz: "Studio Dashboard",
        }, text: {
          en: "a visual interface where game designers review, tweak and approve content before deployment.",
          ru: "визуальный интерфейс, где геймдизайнеры проверяют, правят и утверждают контент перед деплоем.",
          uz: "geymdizaynerlar kontentni joylashtirishdan oldin ko‘rib chiqadigan, tuzatadigan va tasdiqlaydigan vizual interfeys.",
        } },
        { label: {
          en: "Manual Override",
          ru: "Manual Override",
          uz: "Manual Override",
        }, text: {
          en: "any 3D model, sound, text or NPC parameter can be swapped for the studio's own in one click.",
          ru: "любую 3D-модель, звук, текст или параметр NPC можно заменить своим в один клик.",
          uz: "istalgan 3D model, ovoz, matn yoki NPC parametrini bir bosishda studiyaning o‘z variantiga almashtirish mumkin.",
        } },
        { label: {
          en: "AI Co-Pilot",
          ru: "AI Co-Pilot",
          uz: "AI Co-Pilot",
        }, text: {
          en: "text and voice commands refine an event in real time, including its concept and difficulty.",
          ru: "текстовые и голосовые команды дорабатывают событие в реальном времени, включая концепт и сложность.",
          uz: "matnli va ovozli buyruqlar tadbirni, jumladan uning konsepti va murakkabligini real vaqtda takomillashtiradi.",
        } },
      ],
    },
    {
      id: "pipeline",
      title: {
        en: "Four stages",
        ru: "Четыре этапа",
        uz: "To‘rt bosqich",
      },
      body: {
        en: "In the planned architecture, each event passes through four stages and ends with an administrator's final click.",
        ru: "В проектируемой архитектуре каждое событие проходит четыре этапа и заканчивается финальным кликом администратора.",
        uz: "Loyihalanayotgan arxitekturada har bir tadbir to‘rt bosqichdan o‘tadi va administratorning yakuniy bosishi bilan tugaydi.",
      },
      items: [
        { label: {
          en: "Analyse",
          ru: "Анализ",
          uz: "Tahlil",
        }, text: {
          en: "parses online trends and scans the game's art style, balance and overall DNA.",
          ru: "парсинг трендов в сети и сканирование стилистики, баланса и «ДНК» игры.",
          uz: "internetdagi trendlarni o‘rganish hamda o‘yin uslubi, balansi va «DNK»sini skanerlash.",
        } },
        { label: {
          en: "Generate",
          ru: "Генерация",
          uz: "Generatsiya",
        }, text: {
          en: "3D models, animations, SFX, music, voice-over, quests, scripts, promo videos and a simulation trailer.",
          ru: "3D-модели, анимации, SFX, музыка, озвучка, квесты, сценарии, промо-видео и трейлер-симуляция.",
          uz: "3D modellar, animatsiyalar, SFX, musiqa, ovozlashtirish, kvestlar, ssenariylar, promo-videolar va simulyatsion treyler.",
        } },
        { label: {
          en: "Approve",
          ru: "Утверждение",
          uz: "Tasdiqlash",
        }, text: {
          en: "dialogue with the AI Co-Pilot, manual overrides and a pitch pack for brands.",
          ru: "диалог с AI Co-Pilot, ручные правки и питч-пакет для брендов.",
          uz: "AI Co-Pilot bilan muloqot, qo‘lda tuzatishlar va brendlar uchun pitch-paket.",
        } },
        { label: {
          en: "Deploy",
          ru: "Деплой",
          uz: "Joylashtirish",
        }, text: {
          en: "the administrator's final click, then upload through an isolated SDK/API.",
          ru: "финальный клик администратора и загрузка через изолированный SDK/API.",
          uz: "administratorning yakuniy bosishi, so‘ng izolyatsiyalangan SDK/API orqali yuklash.",
        } },
      ],
    },
    {
      id: "integration",
      title: {
        en: "How it plugs into a game",
        ru: "Как подключается к игре",
        uz: "O‘yinga qanday ulanadi",
      },
      body: {
        en: "The AI does not change the game's code. It delivers standardized asset packages, such as AssetBundles and Prefabs, through an isolated sandbox and API.",
        ru: "ИИ не меняет код игры. Он поставляет стандартизированные пакеты ассетов, например AssetBundles и Prefabs, через изолированную песочницу и API.",
        uz: "AI o‘yin kodini o‘zgartirmaydi. U AssetBundles va Prefabs kabi standart asset paketlarini izolyatsiyalangan sandbox va API orqali yetkazadi.",
      },
      items: [
        { label: {
          en: "Engine SDKs",
          ru: "SDK для движков",
          uz: "Dvigatellar uchun SDK",
        }, text: {
          en: "one-click, plug-and-play integration with Unity and Unreal Engine; custom engines connect through a REST API.",
          ru: "подключение plug-and-play в один клик к Unity и Unreal Engine; собственные движки — через REST API.",
          uz: "Unity va Unreal Engine bilan bir bosishda plug-and-play ulanish; maxsus dvigatellar REST API orqali ulanadi.",
        } },
        { label: {
          en: "Onboarding",
          ru: "Подключение",
          uz: "Ulash",
        }, text: {
          en: "the studio installs the plugin and grants read-only API access; the AI studies art style, polygon count, textures and balance rules.",
          ru: "студия ставит плагин и выдаёт доступ к API только на чтение; ИИ изучает стилистику, полигональность, текстуры и правила баланса.",
          uz: "studiya plaginni o‘rnatadi va API’ga faqat o‘qish huquqini beradi; AI grafik uslub, poligonlar soni, teksturalar va balans qoidalarini o‘rganadi.",
        } },
        { label: {
          en: "Safe deployment",
          ru: "Безопасный деплой",
          uz: "Xavfsiz joylashtirish",
        }, text: {
          en: "each event is simulated in a closed sandbox for balance stability and crashes before the final Approve and Launch button.",
          ru: "каждое событие прогоняется в закрытой песочнице на устойчивость баланса и вылеты, затем — финальная кнопка «Утвердить и запустить».",
          uz: "har bir tadbir yopiq sandbox’da balans barqarorligi va ishdan chiqishlarga sinaladi, so‘ng — yakuniy «Tasdiqlash va ishga tushirish» tugmasi.",
        } },
        { label: {
          en: "Multi-tenant isolation",
          ru: "Multi-tenant изоляция",
          uz: "Multi-tenant izolyatsiya",
        }, text: {
          en: "each game's data is kept strictly separate, so one platform can serve many independent studios.",
          ru: "данные каждой игры строго разделены, поэтому одна платформа может обслуживать много независимых студий.",
          uz: "har bir o‘yin ma’lumotlari qat’iy ajratilgan, shuning uchun bitta platforma ko‘plab mustaqil studiyalarga xizmat qila oladi.",
        } },
      ],
    },
    {
      id: "ip",
      title: {
        en: "IP and crossover engine",
        ru: "IP-движок и кроссоверы",
        uz: "IP moduli va krossoverlar",
      },
      body: {
        en: "An IP engine generates culturally appropriate events from world mythology, historical events and public-domain IP. For brand crossovers it turns 3D simulations and ROI forecasts into a pitch package the studio can send to rights holders.",
        ru: "IP-движок создаёт культурно корректные события на основе мировой мифологии, исторических событий и произведений из общественного достояния. Для кроссоверов с брендами он собирает 3D-симуляции и прогнозы ROI в питч-пакет, который студия может отправить правообладателям.",
        uz: "IP moduli jahon mifologiyasi, tarixiy voqealar va jamoat mulki bo‘lgan asarlar asosida madaniy jihatdan to‘g‘ri tadbirlar yaratadi. Brend krossoverlari uchun esa 3D simulyatsiyalar va ROI prognozlarini studiya huquq egalariga yubora oladigan pitch-paketga yig‘adi.",
      },
      items: [

      ],
    },
    {
      id: "market",
      title: {
        en: "Market and first customers",
        ru: "Рынок и первые клиенты",
        uz: "Bozor va birinchi mijozlar",
      },
      body: {
        en: "CARDINAL targets mid-size studios of 10–50 developers making mid-core RPGs, strategy games and PC action-roguelikes first.",
        ru: "В первую очередь CARDINAL нацелен на средние студии на 10–50 разработчиков, которые делают mid-core RPG, стратегии и PC action-roguelike.",
        uz: "CARDINAL birinchi navbatda mid-core RPG, strategiya va PC action-roguelike o‘yinlarini yaratadigan 10–50 dasturchili o‘rta studiyalarni mo‘ljal qiladi.",
      },
      items: [
        { label: {
          en: "TAM",
          ru: "TAM",
          uz: "TAM",
        }, text: {
          en: "the $200B+ global gaming market.",
          ru: "мировой игровой рынок, $200B+.",
          uz: "$200B+ hajmdagi jahon o‘yin bozori.",
        } },
        { label: {
          en: "SAM",
          ru: "SAM",
          uz: "SAM",
        }, text: {
          en: "mid-core mobile and PC live-service games.",
          ru: "mid-core мобильные и PC live-service игры.",
          uz: "mid-core mobil va PC live-service o‘yinlar.",
        } },
        { label: {
          en: "Forecast",
          ru: "Прогноз",
          uz: "Prognoz",
        }, text: {
          en: "the global Live-Ops and game analytics market is projected to reach $15B+ by 2028.",
          ru: "мировой рынок Live-Ops и игровой аналитики к 2028 году по прогнозу достигнет $15B+.",
          uz: "jahon Live-Ops va o‘yin analitikasi bozori 2028-yilga borib $15B+ ga yetishi kutilmoqda.",
        } },
      ],
    },
    {
      id: "edge",
      title: {
        en: "Why CARDINAL is different",
        ru: "Чем CARDINAL отличается",
        uz: "CARDINAL nimasi bilan farq qiladi",
      },
      body: {
        en: "Compared with the two kinds of tools studios use today:",
        ru: "В сравнении с двумя типами инструментов, которыми студии пользуются сегодня:",
        uz: "Studiyalar bugun foydalanadigan vositalarning ikki turi bilan solishtirganda:",
      },
      items: [
        { text: {
          en: "Traditional Live-Ops tools, such as PlayFab, require heavy manual entry and setup.",
          ru: "Классические Live-Ops инструменты, например PlayFab, требуют много ручного ввода и настройки.",
          uz: "An’anaviy Live-Ops vositalari, masalan PlayFab, ko‘p qo‘lda kiritish va sozlashni talab qiladi.",
        } },
        { text: {
          en: "Generic AI tools generate disconnected assets with a high risk of hallucinations.",
          ru: "Универсальные AI-инструменты создают разрозненные ассеты с высоким риском галлюцинаций.",
          uz: "Umumiy AI vositalari bir-biriga bog‘lanmagan assetlar yaratadi, gallyutsinatsiya xavfi esa yuqori.",
        } },
        { text: {
          en: "CARDINAL combines structured AI generation, engine integration and Human-in-the-Loop balance protection.",
          ru: "CARDINAL объединяет структурированную AI-генерацию, интеграцию с движком и защиту баланса через Human-in-the-Loop.",
          uz: "CARDINAL tuzilmali AI generatsiya, o‘yin dvigateli bilan integratsiya va Human-in-the-Loop orqali balans himoyasini birlashtiradi.",
        } },
      ],
    },
    {
      id: "model",
      title: {
        en: "Business model",
        ru: "Бизнес-модель",
        uz: "Biznes model",
      },
      body: {
        en: "B2B SaaS: a subscription plus usage-based pricing. Live-Ops tools become deeply embedded in a studio's workflow, which gives high lifetime-value potential.",
        ru: "B2B SaaS: подписка плюс оплата по использованию. Live-Ops инструменты глубоко встраиваются в процессы студии, поэтому потенциал LTV высокий.",
        uz: "B2B SaaS: obuna va foydalanishga qarab to‘lov. Live-Ops vositalari studiya jarayonlariga chuqur singib ketadi, shuning uchun LTV salohiyati yuqori.",
      },
      items: [
        { label: {
          en: "Starter / Growth",
          ru: "Starter / Growth",
          uz: "Starter / Growth",
        }, text: {
          en: "a monthly subscription per active game title for the core Live-Ops tools.",
          ru: "ежемесячная подписка за каждую активную игру на базовые Live-Ops инструменты.",
          uz: "asosiy Live-Ops vositalari uchun har bir faol o‘yinga oylik obuna.",
        } },
        { label: {
          en: "Scale",
          ru: "Scale",
          uz: "Scale",
        }, text: {
          en: "usage-based billing for heavy LLM generation and custom pipeline workflows.",
          ru: "оплата по использованию для интенсивной LLM-генерации и собственных пайплайнов.",
          uz: "og‘ir LLM generatsiya va maxsus pipeline jarayonlari uchun foydalanishga qarab to‘lov.",
        } },
        { text: {
          en: "Earlier versions of the pitch also considered plans from $200 a month, a success fee on extra in-game revenue during events, and paid onboarding and fine-tuning for AAA studios.",
          ru: "В ранних версиях питча также рассматривались тарифы от $200 в месяц, success fee с прироста внутриигровой выручки во время событий и платные онбординг и донастройка для AAA-студий.",
          uz: "Pitch’ning avvalgi versiyalarida, shuningdek, oyiga $200 dan boshlanadigan tariflar, tadbirlar paytidagi qo‘shimcha o‘yin ichi daromadidan success fee hamda AAA studiyalar uchun pullik onboarding va moslashtirish ko‘rib chiqilgan.",
        } },
      ],
    },
    {
      id: "goals",
      title: {
        en: "Product goals",
        ru: "Цели продукта",
        uz: "Mahsulot maqsadlari",
      },
      body: {
        en: "These are targets, not measured results.",
        ru: "Это цели, а не измеренные результаты.",
        uz: "Bular maqsadlar, o‘lchangan natijalar emas.",
      },
      items: [
        { text: {
          en: "Up to 85% lower Live-Ops costs compared with manual workflows.",
          ru: "Снижение затрат на Live-Ops до 85% по сравнению с ручной работой.",
          uz: "Qo‘lda ishlashga nisbatan Live-Ops xarajatlarini 85% gacha kamaytirish.",
        } },
        { text: {
          en: "Event and quest creation cut from weeks to minutes.",
          ru: "Создание событий и квестов за минуты вместо недель.",
          uz: "Tadbir va kvest yaratishni haftalardan daqiqalarga qisqartirish.",
        } },
        { text: {
          en: "One-click manual override and full developer control over the game's economy and logic.",
          ru: "Ручная замена в один клик и полный контроль разработчика над экономикой и логикой игры.",
          uz: "Bir bosishda qo‘lda almashtirish va dasturchining o‘yin iqtisodi hamda mantig‘i ustidan to‘liq nazorati.",
        } },
      ],
    },
    {
      id: "roadmap",
      title: {
        en: "Roadmap",
        ru: "Дорожная карта",
        uz: "Yo‘l xaritasi",
      },
      body: {
        en: "The 12-month plan as of August 2026.",
        ru: "План на 12 месяцев по состоянию на август 2026 года.",
        uz: "2026-yil avgust holatiga ko‘ra 12 oylik reja.",
      },
      items: [
        { label: {
          en: "Q3 2026",
          ru: "Q3 2026",
          uz: "Q3 2026",
        }, text: {
          en: "finalize the core backend architecture and the Unity SDK.",
          ru: "завершить архитектуру основного бэкенда и Unity SDK.",
          uz: "asosiy backend arxitekturasi va Unity SDK’ni yakunlash.",
        } },
        { label: {
          en: "Q4 2026",
          ru: "Q4 2026",
          uz: "Q4 2026",
        }, text: {
          en: "closed pilot testing with 2–3 partner mid-size studios.",
          ru: "закрытое пилотное тестирование с 2–3 партнёрскими средними студиями.",
          uz: "2–3 hamkor o‘rta studiya bilan yopiq pilot sinovlar.",
        } },
        { label: {
          en: "Q1 2027",
          ru: "Q1 2027",
          uz: "Q1 2027",
        }, text: {
          en: "release the Unreal Engine SDK and expand the automated asset pipeline.",
          ru: "выпуск Unreal Engine SDK и расширение автоматического пайплайна ассетов.",
          uz: "Unreal Engine SDK’ni chiqarish va avtomatlashtirilgan asset pipeline’ni kengaytirish.",
        } },
        { label: {
          en: "Q2 2027",
          ru: "Q2 2027",
          uz: "Q2 2027",
        }, text: {
          en: "public SaaS launch and scaling the sales funnel.",
          ru: "публичный запуск SaaS и масштабирование воронки продаж.",
          uz: "SaaS’ni ommaviy ishga tushirish va savdo voronkasini kengaytirish.",
        } },
      ],
    },
  ] as CardinalSection[],
  ask: {
    title: {
      en: "The ask",
      ru: "Раунд",
      uz: "Investitsiya",
    } as L,
    body: {
      en: "Raising a $150,000 pre-seed round for 12 months. Target: working SDKs and validated pilot metrics within 4–6 months.",
      ru: "Привлекается pre-seed раунд $150 000 на 12 месяцев. Цель: рабочие SDK и проверенные метрики пилотов за 4–6 месяцев.",
      uz: "12 oyga $150 000 pre-seed raund jalb qilinmoqda. Maqsad: 4–6 oy ichida ishlaydigan SDK’lar va tasdiqlangan pilot ko‘rsatkichlari.",
    } as L,
    funds: [
      { share: 60, text: {
        en: "core engineering and engine SDK development.",
        ru: "основная разработка и SDK для движков.",
        uz: "asosiy ishlab chiqish va o‘yin dvigatellari uchun SDK.",
      } },
      { share: 25, text: {
        en: "infrastructure and LLM API pipelines.",
        ru: "инфраструктура и пайплайны LLM API.",
        uz: "infratuzilma va LLM API pipeline’lari.",
      } },
      { share: 15, text: {
        en: "studio partnerships and pilot rollouts.",
        ru: "партнёрства со студиями и запуск пилотов.",
        uz: "studiyalar bilan hamkorlik va pilotlarni ishga tushirish.",
      } },
    ] as { share: number; text: L }[],
    notes: [
      { label: {
        en: "Approach",
        ru: "Подход",
        uz: "Yondashuv",
      }, text: {
        en: "gaming-focused venture funds; a business teaser first, without disclosing source code, then due diligence.",
        ru: "игровые венчурные фонды; сначала бизнес-тизер без раскрытия исходного кода, затем due diligence.",
        uz: "o‘yin sohasidagi venchur fondlar; avval manba kodi oshkor qilinmagan biznes-tizer, so‘ng due diligence.",
      } },
    ] as CardinalItem[],
  },
  team: {
    id: "status",
    title: {
      en: "Status and team",
      ru: "Статус и команда",
      uz: "Holat va jamoa",
    },
    body: {
      en: "Pre-seed and in development: Shuhrat is designing the SDK/API integrations, tenant isolation and the developer-approval flow. He is the founder: a full-stack engineer with experience in system integrations, web architecture and AI pipelines.",
      ru: "Pre-seed, в разработке: Шухрат проектирует интеграции через SDK/API, изоляцию данных клиентов и процесс утверждения контента разработчиком. Он основатель проекта — full-stack инженер с опытом системных интеграций, веб-архитектуры и AI-пайплайнов.",
      uz: "Pre-seed bosqichi, ishlab chiqilmoqda: Shuhrat SDK/API integratsiyalari, mijozlar ma’lumotlarini izolyatsiyalash va kontentni dasturchi tasdiqlash jarayonini loyihalamoqda. U loyiha asoschisi — tizim integratsiyalari, veb-arxitektura va AI pipeline’lar bo‘yicha tajribaga ega full-stack muhandis.",
    },
    items: [
      { text: {
        en: "Shuhrat Abdurahmonov — Founder & Product Architect.",
        ru: "Шухрат Абдурахмонов — основатель и продуктовый архитектор.",
        uz: "Shuhrat Abdurahmonov — asoschi va mahsulot arxitektori.",
      } },
    ],
  } as CardinalSection,
  status: {
    en: "In development. The cost and speed figures are product goals, not measured results yet.",
    ru: "В разработке. Цифры по затратам и скорости — цели продукта, а не измеренные результаты.",
    uz: "Ishlab chiqilmoqda. Xarajat va tezlik ko‘rsatkichlari — mahsulot maqsadlari, hali o‘lchangan natijalar emas.",
  } as L,
  /** "Tell me more": one clip per step (public/voice/<lang>/cardinal-<i>.mp3). */
  story: [
    {
      en: "Live-service games run on fresh content, often with an update every two weeks. Done by hand, that costs weeks of developer time and tens of thousands of dollars, and mid-size or indie studios lack large dedicated Live-Ops teams, so players drift away. Generative AI could help, but left unchecked it can wreck a game's balance and economy. CARDINAL is Shuhrat's answer to both problems.",
      ru: "Игры-сервисы держатся на свежем контенте, часто с обновлением раз в две недели. Вручную это отнимает недели работы разработчиков и десятки тысяч долларов, а у средних и инди-студий нет больших Live-Ops команд, и игроки уходят. Генеративный ИИ мог бы помочь, но без контроля он способен сломать баланс и экономику игры. CARDINAL — ответ Шухрата на обе проблемы.",
      uz: "Live-service o‘yinlar yangi kontent bilan yashaydi, ko‘pincha har ikki haftada yangilanish talab qilinadi. Qo‘lda bu dasturchilarning haftalab vaqtini va o‘n minglab dollarni oladi, o‘rta va indie studiyalarda esa katta Live-Ops jamoalari yo‘q, shu sababli o‘yinchilar ketib qoladi. Generativ AI yordam berishi mumkin, ammo nazoratsiz u o‘yin balansi va iqtisodini buzib yuborishi mumkin. CARDINAL — Shuhratning bu ikki muammoga javobi.",
    },
    {
      en: "The idea is a strict split between machine and human. An LLM-driven core drafts quest lines, balance parameters and event assets, and a designer refines the result through an AI co-pilot, by text or by voice. Any 3D model, sound, line of text or stat can be swapped by hand in one click. Nothing goes live until an administrator presses the final approve and launch button.",
      ru: "Идея в чётком разделении ролей между машиной и человеком. Ядро на LLM готовит сюжетные линии квестов, параметры баланса и ассеты события, а геймдизайнер дорабатывает результат через AI-копилота текстом или голосом. Любую 3D-модель, звук, строку текста или параметр можно заменить вручную в один клик. В игру ничего не попадает, пока администратор не нажмёт финальную кнопку утверждения и запуска.",
      uz: "G‘oya — mashina va inson o‘rtasidagi aniq taqsimot. LLM asosidagi yadro kvest syujetlari, balans parametrlari va tadbir assetlarini tayyorlaydi, geymdizayner esa natijani AI yordamchi orqali matn yoki ovoz bilan takomillashtiradi. Istalgan 3D model, ovoz, matn yoki parametrni bir bosishda qo‘lda almashtirish mumkin. Administrator yakuniy tasdiqlash va ishga tushirish tugmasini bosmaguncha o‘yinga hech narsa chiqmaydi.",
    },
    {
      en: "The key technical decision is that the AI never touches the game's code. In his design, a studio installs the Unity or Unreal plugin, or connects its own engine through a REST API, and grants read-only access so the system can learn the art style, textures and balance rules. Each event is first simulated in a closed sandbox for balance and crashes, then delivered as standard packages such as AssetBundles and Prefabs.",
      ru: "Ключевое техническое решение: ИИ никогда не трогает код игры. По его замыслу, студия ставит плагин для Unity или Unreal либо подключает свой движок через REST API и даёт доступ только на чтение, чтобы система изучила стилистику, текстуры и правила баланса. Каждое событие сначала прогоняется в закрытой песочнице на баланс и вылеты, а затем поставляется стандартными пакетами вроде AssetBundles и Prefabs.",
      uz: "Asosiy texnik qaror: AI o‘yin kodiga hech qachon tegmaydi. Uning loyihasiga ko‘ra, studiya Unity yoki Unreal uchun plaginni o‘rnatadi yoki o‘z dvigatelini REST API orqali ulaydi va faqat o‘qish huquqini beradi, shunda tizim grafik uslub, teksturalar va balans qoidalarini o‘rganadi. Har bir tadbir avval yopiq sandbox’da balans va ishdan chiqishlarga sinaladi, so‘ng AssetBundles va Prefabs kabi standart paketlar bilan yetkaziladi.",
    },
    {
      en: "His first target customers are mid-size studios of ten to fifty developers making mid-core RPGs, strategy games and PC action-roguelikes. The pricing is a monthly subscription per active game title, plus usage-based billing for heavy LLM generation. Unlike tools such as PlayFab, which need heavy manual setup, or generic AI, which makes disconnected assets, CARDINAL ties structured generation to the engine and protects balance.",
      ru: "Первые целевые клиенты — средние студии на десять–пятьдесят разработчиков, которые делают mid-core RPG, стратегии и PC action-roguelike. Модель оплаты: ежемесячная подписка за каждую активную игру плюс оплата по использованию для тяжёлой LLM-генерации. В отличие от инструментов вроде PlayFab, где нужна тяжёлая ручная настройка, и от универсального ИИ, который создаёт разрозненные ассеты, CARDINAL связывает структурированную генерацию с движком и защищает баланс.",
      uz: "Birinchi maqsadli mijozlar — mid-core RPG, strategiya va PC action-roguelike o‘yinlarini yaratadigan o‘ndan elliktagacha dasturchili o‘rta studiyalar. To‘lov modeli: har bir faol o‘yin uchun oylik obuna va og‘ir LLM generatsiya uchun foydalanishga qarab to‘lov. Og‘ir qo‘lda sozlashni talab qiladigan PlayFab kabi vositalardan va bir-biriga bog‘lanmagan assetlar yaratadigan umumiy AI’dan farqli o‘laroq, CARDINAL tuzilmali generatsiyani o‘yin dvigateli bilan bog‘laydi va balansni himoya qiladi.",
    },
    {
      en: "The twelve-month plan, as of August 2026: the core backend and Unity SDK first, closed pilots with two or three mid-size studios in late 2026, the Unreal SDK in early 2027 and a public launch in its second quarter. To fund it, Shuhrat is raising a 150,000-dollar pre-seed round, with sixty percent planned for engineering and SDKs. CARDINAL is still in development, so these are plans, not results.",
      ru: "План на двенадцать месяцев, по состоянию на август 2026 года: сначала ядро бэкенда и Unity SDK, в конце 2026-го закрытые пилоты с двумя-тремя средними студиями, в начале 2027-го Unreal SDK, а во втором квартале публичный запуск. На это Шухрат привлекает pre-seed раунд в 150 000 долларов, шестьдесят процентов которого планируется направить на разработку и SDK. CARDINAL пока в разработке, так что это планы, а не результаты.",
      uz: "2026-yil avgust holatiga ko‘ra o‘n ikki oylik reja: avval backend yadrosi va Unity SDK, 2026-yil oxirida ikki-uch o‘rta studiya bilan yopiq pilotlar, 2027-yil boshida Unreal SDK va o‘sha yilning ikkinchi choragida ommaviy ishga tushirish. Buning uchun Shuhrat 150 000 dollarlik pre-seed raund jalb qilmoqda, uning oltmish foizini ishlab chiqish va SDK’larga yo‘naltirish rejalashtirilgan. CARDINAL hali ishlab chiqilmoqda, shuning uchun bular natijalar emas, rejalar.",
    },
  ] as L[],
};
