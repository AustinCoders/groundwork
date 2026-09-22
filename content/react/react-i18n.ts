import type { Chapter } from "../types";

export const reactI18n: Chapter = {
  id: "react-i18n",
  num: "I19",
  title: "Internationalisation",
  short: "i18n",
  levels: ["intermediate"],
  practice: ["ex-react-pick-plural", "ex-comp-locale-provider"],
  ready: true,
  subtitle: "Translating strings is the easy third. Plurals, formats and layout direction are the rest.",
  body: `<h3>What the word covers</h3>
<p>
  <b>Internationalisation</b> (i18n, because of the eighteen letters between the
  i and the n) is building the app so it <em>can</em> speak more than one
  language. <b>Localisation</b> (l10n) is supplying one particular language. A
  team that has done the first can add a locale by adding a file; a team that has
  not has to rewrite components.
</p>
<p>Four things change between locales, and only the first is translation:</p>
<ul>
  <li><b>Text,</b> including plurals, gender and word order.</li>
  <li><b>Formats:</b> dates, numbers, currencies, lists, relative times.</li>
  <li><b>Direction:</b> Arabic and Hebrew run right to left.</li>
  <li><b>Length:</b> German and Finnish routinely run a third longer than English, and a button sized to "Save" breaks.</li>
</ul>

<div class="bx is-prim">
  <span class="ttl">Never build a sentence out of pieces</span>
  <pre><code>"Delete " + count + " " + (count === 1 ? "file" : "files")     <span class="c">// ✗</span>
t("deleteFiles", { count })                                    <span class="c">// ✓ one whole message</span></code></pre>
  <p>
    Word order differs between languages, so a sentence assembled from fragments
    cannot be translated: the translator sees "Delete" and "files" as unrelated
    strings and has no way to move the number. And English has two plural forms,
    but Russian has three that matter (1, 2&ndash;4, 5 and up) and Arabic has six.
    A ternary on <code>count === 1</code> is wrong in most of the world.
  </p>
</div>

<h3>The platform already does formatting</h3>
<pre><code>new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234.5);
<span class="c">// "1.234,50 €"</span>

new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date());
<span class="c">// "21 September 2026"</span>

new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(-1, "day");
<span class="c">// "ayer"</span>

new Intl.ListFormat("en", { type: "conjunction" }).format(["a", "b", "c"]);
<span class="c">// "a, b and c"</span>

new Intl.PluralRules("ru").select(3);
<span class="c">// "few"</span></code></pre>
<p>
  Before adding a dependency for any of these, use <code>Intl</code>. It is built
  into every browser and Node, ships the locale data, and is what the libraries
  below call underneath. Two rules: never format dates or numbers by hand
  (<code>toFixed</code> and string slicing are not localisation), and pass the
  <b>locale</b> from your i18n layer instead of letting the browser guess, so
  the server and client agree.
</p>

<h3>react-i18next, for any React app</h3>
<pre><code>import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: {
      welcome: "Welcome back, {{name}}",
      file_one: "{{count}} file",
      file_other: "{{count}} files",
    } },
    fr: { translation: {
      welcome: "Bon retour, {{name}}",
      file_one: "{{count}} fichier",
      file_other: "{{count}} fichiers",
    } },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },     <span class="c">// React already escapes</span>
});

function Files({ n, name }) {
  const { t } = useTranslation();
  return (
    &lt;&gt;
      &lt;h1&gt;{t("welcome", { name })}&lt;/h1&gt;
      &lt;p&gt;{t("file", { count: n })}&lt;/p&gt;     <span class="c">// picks file_one or file_other</span>
    &lt;/&gt;
  );
}</code></pre>
<p>
  Plural forms are separate keys with the CLDR suffixes <code>_one</code>,
  <code>_other</code>, and where a language needs them <code>_zero</code>,
  <code>_two</code>, <code>_few</code> and <code>_many</code>. The variable must
  be named <code>count</code>, and it must be passed &mdash; without it there is
  no plural lookup at all. Underneath, i18next asks
  <code>Intl.PluralRules</code>, so the rules are the standard ones.
</p>
<p>
  When a translated sentence contains markup, <code>Trans</code> lets the
  translator move the tag: <code>"Read our &lt;1&gt;terms&lt;/1&gt;"</code>
  maps index 1 to your <code>&lt;a&gt;</code>. Never split that sentence into
  three strings around a link.
</p>

<h3>next-intl, for the Next.js App Router</h3>
<pre><code><span class="c">// i18n/routing.ts</span>
export const routing = defineRouting({ locales: ["en", "de"], defaultLocale: "en" });

<span class="c">// proxy.ts — called middleware.ts before Next.js 16</span>
export default createMiddleware(routing);
export const config = { matcher: "/((?!api|trpc|_next|_vercel|.*\\\\..*).*)" };

<span class="c">// app/[locale]/layout.tsx</span>
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);                  <span class="c">// lets the page render statically</span>
  return (
    &lt;html lang={locale}&gt;
      &lt;body&gt;&lt;NextIntlClientProvider&gt;{children}&lt;/NextIntlClientProvider&gt;&lt;/body&gt;
    &lt;/html&gt;
  );
}

<span class="c">// a Server Component                       // a Client Component</span>
const t = await getTranslations("Inbox");   const t = useTranslations("Inbox");</code></pre>
<pre><code>{ "Inbox": { "unread": "{count, plural, =0 {No messages} one {# message} other {# messages}}" } }</code></pre>
<p>
  The locale lives in the URL &mdash; <code>/de/pricing</code> &mdash; because a
  URL is what search engines index and what a user can share. The proxy
  negotiates the locale from the <code>Accept-Language</code> header on the first
  visit and redirects. Messages use the ICU format, so plurals and selects live
  inside the string, where the translator can see and change them. Server
  Components read translations on the server, so those strings never reach the
  browser bundle. What you hand to the client provider is what ships, so pass
  only the namespaces that Client Components actually use.
</p>

<h3>Choosing</h3>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Reach for</th></tr></thead>
<tbody>
<tr><td>Vite, or any client-rendered React app</td><td>react-i18next, or FormatJS (react-intl) if you want ICU messages</td></tr>
<tr><td>Next.js App Router</td><td>next-intl &mdash; it understands Server Components and static rendering</td></tr>
<tr><td>Translators work in a tool</td><td>Whatever exports to the format that tool accepts; ICU JSON is the common one</td></tr>
<tr><td>One language now, maybe more later</td><td>Still extract strings now; retrofitting is the expensive path</td></tr>
</tbody>
</table></div>

<h3>Gender, choices and fallbacks</h3>
<pre><code>"{gender, select, female {She replied} male {He replied} other {They replied}}"</code></pre>
<p>
  ICU's <code>select</code> handles the cases a plural cannot: a message that
  changes with a value that is not a number. Always include <code>other</code>;
  it is the branch used when the value is anything unexpected, and it is what
  keeps a new enum value from producing an empty string. Locales also fall back
  in a chain &mdash; a French-Canadian visitor (<code>fr-CA</code>) should see
  <code>fr</code> before English &mdash; and the last stop must be a complete
  catalogue, so a missing key shows real text rather than the key itself.
</p>

<h3>Making it a workflow, not a one-off</h3>
<ul>
  <li><b>Extract, do not hand-maintain.</b> A tool that scans the code for message calls and writes the catalogue means the source and the file cannot drift apart.</li>
  <li><b>Fail CI on missing keys.</b> A locale with a key absent in one file is a bug you can find in seconds, or one a customer in Munich finds in production.</li>
  <li><b>Give translators context.</b> "Post" is a noun on a blog and a verb on a button. A short description alongside the key is worth more than any tool.</li>
  <li><b>Type the keys.</b> With TypeScript, both major libraries can check <code>t("settings.svae")</code> at compile time against the English catalogue.</li>
  <li><b>Keep the default language honest.</b> If English is only a fallback and nobody reads it, its typos ship.</li>
</ul>

<h3>Layout direction</h3>
<pre><code>&lt;html lang="ar" dir="rtl"&gt;

.card { margin-inline-start: 1rem; padding-inline: 1rem; }   <span class="c">/* not margin-left */</span></code></pre>
<p>
  Set <code>lang</code> and <code>dir</code> on the root element, and write CSS
  with <b>logical properties</b> &mdash; <code>margin-inline-start</code>,
  <code>padding-inline</code>, <code>inset-inline-end</code>, <code>text-align:
  start</code> &mdash; so the layout mirrors without a second stylesheet. Icons
  that imply direction, like a back arrow, need to flip; icons that do not, like
  a clock, must not.
</p>

<h3>What goes wrong</h3>
<ul>
  <li><b>Keys named after the English text.</b> <code>"Save"</code> as a key breaks the day marketing changes it to "Save changes". Name by meaning: <code>settings.save</code>.</li>
  <li><b>Translated strings in state or the database.</b> Store the key or the raw value and translate at render, or the text stays in the old language when the user switches.</li>
  <li><b>Hydration mismatch.</b> A date formatted on the server in one timezone and in the browser in another renders two different strings. Format with an explicit locale and <code>timeZone</code>.</li>
  <li><b>Bundle weight.</b> Loading every language for every user is the default failure. Load the active locale, and split large catalogues by page.</li>
  <li><b>Untested layouts.</b> Pseudo-localisation &mdash; automatically stretching every string with accented characters &mdash; finds truncation and hard-coded text before a translator does.</li>
  <li><b>SEO.</b> One URL per locale, <code>lang</code> on the page, and <code>hreflang</code> alternates linking the versions.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Internationalisation is text, formats, direction and length: whole
    messages with ICU or CLDR plural rules instead of concatenation, the
    built-in <code>Intl</code> APIs for formatting, the locale in the URL,
    logical CSS properties for right-to-left, and translation resolved at render
    time, never stored."
  </p>
</div>`,
};
