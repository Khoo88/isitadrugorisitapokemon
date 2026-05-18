# Drug or Pokémon?

A gamified quiz: classify random names as **medications** or **Pokémon**. Built with Next.js, Tailwind CSS, Framer Motion, Supabase, and TinaCMS.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase credentials, the app uses `src/data/items.json` (150 drugs + 150 Pokémon).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor.
3. Import rows from `src/data/items.json` (or use the Supabase table editor).
4. Copy `.env.example` to `.env.local` and add your URL and anon key.

## TinaCMS

Learn More pages live in `content/learnMore/`. Run `npm run dev` to open the Tina sidebar and edit rich-text content. Sample pages: `lisinopril.md`, `pikachu.md`.

## Game features

- **Ratio constraint:** Each deck keeps drugs and Pokémon between 30% and 70%.
- **Modes:** Standard (timed or Zen) and Sudden Death (3 lives, high score).
- **Play styles:** Swipe, Classic buttons, Drag & Drop, Multiple Choice.
- **Results:** Accuracy, review list, ad placeholders, Learn More links.
