# Shuhrat Abdurahmonov — portfolio with Yui

A single-screen portfolio. The visitor picks a language (EN / RU / UZ) and says how to be addressed. Then Yui, an AI assistant built as a particle-and-wireframe sphere, greets them by name. Yui talks about Shuhrat's experience, projects, skills and CARDINAL, and answers questions through Gemini. The sphere deforms with her voice.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Three.js + React Three Fiber + postprocessing, GSAP, Gemini API (text + TTS).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY
npm run dev
```

## Where things live

| Path | What |
| --- | --- |
| `src/content/profile.ts` | All facts about Shuhrat (work only): this file feeds both the panels and the AI |
| `src/content/narration.ts` | Yui's scripted lines: section intros and the "tell me about him" story |
| `src/content/ui.ts` | Interface strings and the greeting in three languages |
| `src/lib/knowledge.ts` | System prompt for Gemini, built from `profile.ts` |
| `src/lib/yui.ts` | Conversation flow: greeting, sections, narration, chat with streamed answers |
| `src/lib/voice.ts` | Audio playback through an analyser that drives the sphere |
| `src/components/scene/` | The 3D core (GLSL shaders, particles, HUD rings) |
| `src/app/api/` | `chat` (streaming Gemini), `tts` (Gemini voice), `order` (Telegram) |

## Yui's pre-recorded voice

Scripted lines are generated once into `public/voice/<lang>/*.mp3`, so they play instantly and do not use API quota. ffmpeg must be installed.

```bash
npm run voice               # only missing files
npm run voice -- --force    # regenerate everything after editing narration.ts
```

If a file is missing, the site falls back to live TTS.

## Limits worth knowing

- The free Gemini tier allows only a few TTS requests per minute. When the limit is hit, Yui's live answers show as text with the sphere pulsing. Enable billing on the key for reliable voice.
- The order form needs `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Until they are set, the form tells visitors to write on Telegram or email instead.
- The API routes have a per-IP rate limit (`src/lib/rate-limit.ts`).
