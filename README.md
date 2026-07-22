# Kaidenz — Mobile

Expo Router app. Chat-first, calling the existing Vercel API routes as-is —
no separate backend. Cross-device chat continuity comes free from
`conversation_history` being keyed by `user_id` in Supabase.

## Before first run

1. Resolve the Clerk version mismatch on web: `middleware.ts` uses
   `authMiddleware` (v4) while the API routes use `auth()` from
   `@clerk/nextjs/server` (v5). Mobile authenticates via a Bearer token
   in the `Authorization` header — confirm this works against your
   current middleware before relying on it.
2. Confirm `update_athlete_profile`'s `input_schema` actually accepts
   `active_persona_id` — only the common profile fields were visible
   when this was scaffolded. If not, add it, since the persona switcher
   depends on it.
3. Confirm where "stride length at matched HR" (the primary run KPI)
   is queryable — it isn't a field on `AthleteKPIs` today. The KPIs
   screen currently ships with placeholder values for it.

## Setup

    npm install
    npx expo install --fix
    copy .env.example .env
    # fill in EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (same Clerk project as web)
    # and EXPO_PUBLIC_API_URL (your Vercel deployment URL)
    npx expo start

`npx expo install --fix` true-ups every Expo/RN/Clerk package to the exact
patch versions SDK 53 expects — the versions in package.json are close but
hand-typed, so run this once before your first `expo start`.

Uses `@clerk/expo` (Core 3), not the deprecated `@clerk/clerk-expo` —
Core 3 requires Expo SDK 53+ and React 19, which is why this scaffold
targets those versions rather than Expo 51/React 18.

## Structure

    app/
      _layout.tsx           Clerk provider, token cache, auth gate
      (auth)/sign-in.tsx
      (tabs)/
        _layout.tsx          Bottom nav: Profile, KPIs, Chat, Sessions, More
        chat.tsx             Default tab
        profile.tsx
        kpis.tsx
        sessions/index.tsx
        sessions/[id].tsx    Tap-through detail, no upload
        more.tsx             Flags badge, races, notes, sign out
    context/
      AthleteStateContext.tsx  Single GET /api/athlete/state hydration,
                               shared across all tabs
    lib/
      api.ts                 Fetch wrapper, attaches Clerk Bearer token
      types.ts                Mirrors web's lib/types.ts (kept in sync by hand)

## Deploying to the stores

    npx eas build --platform ios
    npx eas build --platform android
    npx eas submit --platform ios
    npx eas submit --platform android

Requires an Expo/EAS account and Apple/Google developer accounts
(separate from Vercel — nothing here touches your web deploy).