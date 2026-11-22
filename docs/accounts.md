# Accounts and sync: setup checklist

Optional accounts let a reader keep progress, review marks, quiz results, mock history, boards and code drafts in
sync across devices. The pages stay static: the browser talks to Supabase directly, and the SDK is only downloaded
when someone opens sign-in or already has a session. Without the environment variables below the site behaves as
it did before accounts existed: no sign-in button, and the login-only views stay open.

## What already exists

| Piece            | Where                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase project | `groundwork`, ref `wlyfdbfqwwqvfbfxmeay`, region `ap-south-1` (Mumbai), free plan, separate from the austincoders.com project                                                       |
| Schema and RLS   | `supabase/migrations/20261122060000_accounts_and_sync.sql`, already applied: `profiles`, `user_state`, the sign-up trigger, the 3,000-row cap per account and `delete_my_account()` |
| Client code      | `lib/account/` (config, lazy client, session store, sync engine, merge rules, error text)                                                                                           |
| UI               | `components/account/` (sign-in dialog, menu chip, sign-in gate), `app/account` (profile, sync, data, sign out, delete), `app/auth/callback` (OAuth, email links, password reset)    |
| Login-only views | `/progress`, `/review`, the mock interview's readiness board, the whiteboard's saved-boards list                                                                                    |
| Tests            | `tests/account-sync.test.ts` (merge rules, redirects, form checks); RLS was checked against the migration in PGlite with an emulated `auth` schema                                  |

The Supabase security advisor reports one warning, on purpose: `delete_my_account()` is a `SECURITY DEFINER`
function that signed-in users can call. It deletes only the caller (`auth.uid()`), and anonymous callers are refused.

## Fields

- **Create account:** name (2 to 60 characters), email, password (8 to 72 characters with a letter and a number, shown
  as a live checklist, with a Show button instead of a second password field). Google and GitHub skip all three.
- **Sign in:** email and password, with "Forgot password?", or an email link and 6-digit code, or Google or GitHub.
- **Profile, optional, on `/account`:** name, goal (learn, interview, switch jobs, level up), level (beginner,
  intermediate, advanced), target role (frontend, backend, full stack, other). Nothing else is asked: no phone, no
  date of birth, no college.
- **Not editable by the reader:** `plan` and `plan_expires_at`. Only the service role can write them, which is what a
  payment webhook will use when the paywall comes.

## What you need to do

1. **Vercel environment variables** (Production, Preview and Development):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://wlyfdbfqwwqvfbfxmeay.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable key in `.env.example` (public by design; RLS protects the data)
   - `NEXT_PUBLIC_AUTH_PROVIDERS` = leave empty until step 5 or 6 is done, then `google`, `github` or `google,github`.
     A provider listed here but not turned on in Supabase shows a button that fails.
   - Redeploy after adding them: they are read at build time, and the Content-Security-Policy is built from the URL.
2. **Supabase → Authentication → URL Configuration:** Site URL `https://groundwork.austincoders.com`. Redirect URLs:
   `https://groundwork.austincoders.com/auth/callback`, `http://localhost:3000/auth/callback`, and the preview pattern
   from your Vercel project, for example `https://*-austincoders.vercel.app/auth/callback`.
3. **Custom SMTP (required before launch):** until it is set, Supabase only emails members of your Supabase team, and
   only a few messages an hour, so a stranger's sign-up fails with `email_address_not_authorized`. Use Resend, ZeptoMail
   or Brevo with a sender such as `no-reply@austincoders.com`, add the provider's SPF, DKIM and DMARC records to the
   domain, then raise the email limit under Authentication → Rate Limits.
4. **Authentication → Sign In / Providers → Email:** keep **Confirm email** on. Set the minimum password length to 8 and
   require letters and digits, matching the form. Turn on **Secure password change**.
5. **Google:** Google Cloud Console → APIs & Services → OAuth consent screen (app name Groundwork, support email, the
   privacy page `https://groundwork.austincoders.com/privacy`) → Credentials → OAuth client ID, type Web application,
   authorised redirect URI `https://wlyfdbfqwwqvfbfxmeay.supabase.co/auth/v1/callback`. Paste the client ID and secret
   into Supabase → Providers → Google.
6. **GitHub:** GitHub → Settings → Developer settings → OAuth Apps → New OAuth App. Homepage
   `https://groundwork.austincoders.com`, callback `https://wlyfdbfqwwqvfbfxmeay.supabase.co/auth/v1/callback`.
   Paste the client ID and a new client secret into Supabase → Providers → GitHub.
7. **Email templates (optional but better):** in Authentication → Emails, add `{{ .Token }}` to the Magic Link template
   so the 6-digit code field in the dialog works as well as the link.
8. **Later, before heavy traffic:** CAPTCHA under Attack Protection (Cloudflare Turnstile). It needs the widget in the
   sign-up form and `challenges.cloudflare.com` in the Content-Security-Policy, so it is a separate change.

## Test it by hand after deploying

1. Signed out: `/progress`, `/review`, the mock lobby's readiness board and the whiteboard menu's board list show the
   sign-in card; reading, exercises, the playground and a mock run work.
2. Mark a chapter read and solve an exercise while signed out, then create an account: after confirming the email the
   marks are still there, and `/progress` shows them.
3. Sign in on a second browser: the same progress, quiz results, mock history and boards appear within a few seconds.
4. Change something on one device, switch tabs on the other: it updates on focus (or within a minute).
5. `/account`: edit the profile, Sync now, Download my data, change the password, sign out and sign back in.
6. Forgot password: the email link opens `/auth/callback`, asks for a new password, then lands on `/account`.
7. Delete the account with a throwaway address: it is gone from Authentication → Users and from both tables.

## How sync merges

| Data                                                          | Rule                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Chapter progress, solved exercises                            | Union; for a chapter on both sides, the later mark wins       |
| Daily activity                                                | Per day, the larger count                                     |
| Quiz results, interview confidence, practised company items   | Union by id; on a clash the side changed more recently wins   |
| Mock history, retry list, board index, saved whiteboard parts | Union by id, ordered by time, capped at the site's own limits |
| Code drafts, board bodies, level, settings that travel        | The side changed more recently wins                           |
| Theme, font, zoom, narrator, tour, navigation trail           | Never synced: they belong to one device                       |

Deletions do not travel between devices: unmarking a chapter on one device is undone by the other's copy. To start
over everywhere, use **Erase saved progress** on `/account`. When a different person signs in on the same browser,
the previous account's copy on that device is replaced, not merged.
