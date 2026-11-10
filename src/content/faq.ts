// Suggested questions under the chat: what visitors most likely want to know, answered from
// profile.ts and recorded ahead (public/voice/<lang>/faq-<id>.mp3), so a tap costs no Gemini call.
import type { L, ProjectKind } from "./profile";
import type { PanelId } from "./ui";

export type Faq = { id: string; q: L; a: L; panel?: PanelId; kind?: ProjectKind };

export const faq: Faq[] = [
  {
    id: "tech-stack",
    q: {
      en: "What's his tech stack?",
      ru: "Какой у него стек?",
      uz: "Qaysi texnologiyalarda ishlaydi?",
    },
    a: {
      en: "His main stack is React, Next.js, Node.js, TypeScript and PostgreSQL, plus Three.js for 3D in the browser. He also works with Express, Prisma, Socket.IO, and Kotlin with Jetpack Compose for Android. The full list is in the panel.",
      ru: "Его основной стек — React, Next.js, Node.js, TypeScript и PostgreSQL, а для 3D в браузере — Three.js. Ещё он работает с Express, Prisma, Socket.IO, а под Android — с Kotlin и Jetpack Compose. Полный список — в панели.",
      uz: "Uning asosiy steki — React, Next.js, Node.js, TypeScript va PostgreSQL, brauzerdagi 3D uchun esa Three.js. Shuningdek, u Express, Prisma, Socket.IO bilan, Android uchun esa Kotlin va Jetpack Compose bilan ishlaydi. To‘liq ro‘yxat panelda.",
    },
    panel: "skills",
  },
  {
    id: "open-to-work",
    q: {
      en: "Is he open to work?",
      ru: "Он открыт к предложениям?",
      uz: "U ish takliflariga ochiqmi?",
    },
    a: {
      en: "Yes, he is open to offers: office, hybrid or remote. He is based in Tashkent, Uzbekistan. His CV in English and Russian is in the panel.",
      ru: "Да, он открыт к предложениям: офис, гибрид или удалёнка. Он базируется в Ташкенте, в Узбекистане. Его резюме на английском и русском — в панели.",
      uz: "Ha, u ish takliflariga ochiq: ofis, gibrid yoki masofaviy. U hozir Toshkentda, O‘zbekistonda. Uning inglizcha va ruscha rezyumesi panelda.",
    },
    panel: "cv",
  },
  {
    id: "build-my-site",
    q: {
      en: "Can he build my website?",
      ru: "Может ли он сделать мне сайт?",
      uz: "Menga sayt qilib bera oladimi?",
    },
    a: {
      en: "Yes. He builds full-stack web applications with admin dashboards, role-based workspaces and real-time features, as well as interactive 3D web projects that run right in the browser. Take a look at his projects in the panel.",
      ru: "Да. Он делает full-stack веб-приложения с админ-панелями, ролевыми кабинетами и обменом данными в реальном времени, а также интерактивные 3D-проекты, которые работают прямо в браузере. Посмотрите его проекты в панели.",
      uz: "Ha. U admin panellar, rollarga asoslangan kabinetlar va real-time funksiyalarga ega full-stack veb-ilovalar, shuningdek, brauzerning o‘zida ishlaydigan interaktiv 3D loyihalar yaratadi. Loyihalarini panelda ko‘ring.",
    },
    panel: "projects",
  },
  {
    id: "cardinal",
    q: {
      en: "What is his startup CARDINAL?",
      ru: "Что за стартап CARDINAL?",
      uz: "CARDINAL qanday startap?",
    },
    a: {
      en: "CARDINAL is Shuhrat's own startup: a B2B AI platform that prepares Live-Ops events, quests and assets for game studios, and nothing goes live without the developer's approval. It is in development and raising a 150,000-dollar pre-seed round. The details are in the panel.",
      ru: "CARDINAL — собственный стартап Шухрата: B2B AI-платформа, которая готовит Live-Ops события, квесты и ассеты для игровых студий, причём ничего не попадает в игру без одобрения разработчика. Проект в разработке, привлекается pre-seed раунд в 150 000 долларов. Подробности — в панели.",
      uz: "CARDINAL — Shuhratning shaxsiy startapi: o‘yin studiyalari uchun Live-Ops tadbirlari, kvestlar va assetlarni tayyorlaydigan B2B AI platforma, dasturchi tasdiqlamaguncha esa hech narsa o‘yinga chiqmaydi. Loyiha ishlab chiqilmoqda, 150 000 dollarlik pre-seed raund jalb qilinmoqda. Batafsil — panelda.",
    },
    panel: "cardinal",
  },
  {
    id: "current-role",
    q: {
      en: "Where does he work now?",
      ru: "Где он сейчас работает?",
      uz: "Hozir qayerda ishlaydi?",
    },
    a: {
      en: "Since September 2026 he has been a frontend developer intern at Neovex in Tashkent, where he built the Neovex One Core 3D concept site with Three.js. In parallel he is the founder of CARDINAL, his own product. The details are in the panel.",
      ru: "С сентября 2026 года он frontend-стажёр в Neovex в Ташкенте: там он сделал 3D-сайт-концепт Neovex One Core на Three.js. Параллельно он основатель CARDINAL, своего собственного продукта. Подробности — в панели.",
      uz: "2026-yil sentyabridan beri u Toshkentdagi Neovex’da Frontend stajyor: u yerda Three.js’da Neovex One Core 3D konsept-saytini yaratdi. Shu bilan birga, u o‘zining CARDINAL mahsuloti asoschisi. Batafsil — panelda.",
    },
    panel: "experience",
  },
  {
    id: "experience",
    q: {
      en: "How much experience does he have?",
      ru: "Какой у него опыт работы?",
      uz: "Qancha tajribasi bor?",
    },
    a: {
      en: "He has been building web applications as a freelancer since September 2024: REST APIs, authentication, role-based workspaces, admin dashboards and real-time features. In summer 2026 he completed a software engineer internship at Itransition Group, where he built and deployed a final project.",
      ru: "Веб-приложения он делает как фрилансер с сентября 2024 года: REST API, авторизация, ролевые кабинеты, админ-панели и real-time. Летом 2026 года он прошёл стажировку Software Engineer в Itransition Group, где разработал и развернул итоговый проект.",
      uz: "U 2024-yil sentyabridan beri frilanser sifatida veb-ilovalar yaratib kelmoqda: REST API, avtorizatsiya, rollarga asoslangan kabinetlar, admin panellar va real-time funksiyalar. 2026-yil yozida Itransition Group’da Software Engineer stajyori sifatida amaliyot o‘tab, yakuniy loyihani ishlab chiqdi va joylashtirdi.",
    },
    panel: "experience",
  },
  {
    id: "project-cost",
    q: {
      en: "How much does a project cost?",
      ru: "Сколько стоит проект?",
      uz: "Loyiha narxi qancha?",
    },
    a: {
      en: "Shuhrat discusses the price of each project individually. Describe what you need in the order form, and he will get back to you personally.",
      ru: "Стоимость каждого проекта Шухрат обсуждает индивидуально. Опишите задачу в форме заказа, и он ответит вам лично.",
      uz: "Har bir loyiha narxi Shuhrat bilan alohida kelishiladi. Buyurtma shaklida nima kerakligini yozing, u sizga shaxsan javob beradi.",
    },
    panel: "order",
  },
  {
    id: "contact",
    q: {
      en: "How can I contact him?",
      ru: "Как с ним связаться?",
      uz: "U bilan qanday bog‘lanish mumkin?",
    },
    a: {
      en: "You can write to him on Telegram or WhatsApp, connect on LinkedIn or send an email, and his code is on GitHub. All the links are in the panel.",
      ru: "Ему можно написать в Telegram или WhatsApp, найти его в LinkedIn или отправить письмо на почту, а его код лежит на GitHub. Все ссылки — в панели.",
      uz: "Unga Telegram yoki WhatsApp’da yozish, LinkedIn orqali bog‘lanish yoki email yuborish mumkin, kodlari esa GitHub’da. Barcha havolalar panelda.",
    },
    panel: "contacts",
  },
  {
    id: "education",
    q: {
      en: "Where does he study?",
      ru: "Где он учится?",
      uz: "Qayerda o‘qiydi?",
    },
    a: {
      en: "He is a third-year Software Engineering student at Fergana State Technical University. He is due to graduate in 2028.",
      ru: "Он студент третьего курса, специальность — программный инжиниринг. Его вуз — Ферганский государственный технический университет, выпуск в 2028 году.",
      uz: "U Farg‘ona davlat texnika universitetida Dasturiy injiniring yo‘nalishi bo‘yicha uchinchi kursda o‘qiydi. O‘qishni 2028-yilda tamomlaydi.",
    },
    panel: "about",
  },
  {
    id: "languages",
    q: {
      en: "What languages does he speak?",
      ru: "На каких языках он говорит?",
      uz: "U qaysi tillarda gapiradi?",
    },
    a: {
      en: "Uzbek is his native language, and he speaks Russian fluently. His English is basic, but enough to read technical material.",
      ru: "Узбекский у него родной, на русском он говорит свободно. Английский — базовый, но для чтения технических текстов его хватает.",
      uz: "O‘zbek tili — uning ona tili, rus tilida esa erkin gapiradi. Ingliz tili — boshlang‘ich darajada, ammo texnik matnlarni o‘qishga yetarli.",
    },
    panel: "about",
  },
];
