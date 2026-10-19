import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "sec-order-id-leak",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "diagnose",
      section: "authentication-is-who-you-are-authorization-is-what-you-may-",
      kind: "single",
      prompt:
        "<p>A logged-in user changes the number in <code>GET /orders/8731</code> and sees another customer's order. The login works correctly and the connection uses TLS. What is missing?</p>",
      choices: [
        {
          id: "a",
          text: "Stronger passwords for every account.",
          why: "The attacker is a legitimate, logged-in user. The password is not what failed.",
        },
        {
          id: "b",
          text: "A check in the handler that this caller owns this order, with deny by default.",
          why: "This is an authorization failure, an insecure direct object reference. The handler must load the object and check that this caller may do this action to it on every request.",
        },
        {
          id: "c",
          text: "Encrypting the order table at rest.",
          why: "Encryption at rest protects a stolen disk. The application reads decrypted data, so it hands the order to anyone it believes is allowed.",
        },
        {
          id: "d",
          text: "Longer order ids that are harder to guess.",
          why: "Random ids make guessing harder, which is a useful second layer, but an id someone obtains by other means (a shared link, a log) still returns the order without an ownership check.",
        },
      ],
      answer: "b",
    },
    {
      id: "sec-token-storage",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "tradeoff",
      section: "sessions-tokens-and-oauth-what-each-one-is-for",
      kind: "single",
      prompt:
        "<p>A single-page app keeps a 24-hour JWT in <code>localStorage</code>. A cross-site scripting bug in a third-party widget is found. Which change cuts the damage the most?</p>",
      choices: [
        {
          id: "a",
          text: "Sign the JWT with a longer key.",
          why: "The attacker's script reads the valid token as it is. A stronger signature does not stop a token from being stolen after it has been issued.",
        },
        {
          id: "b",
          text: "Compress the token so it is harder to read.",
          why: "Compression is not protection. The script copies the token string and replays it.",
        },
        {
          id: "c",
          text: "Hide the token name in the page source.",
          why: "Obscuring a name does nothing against a script that can read everything in storage.",
        },
        {
          id: "d",
          text: "A short-lived access token plus a rotating refresh token in an HttpOnly, Secure, SameSite cookie.",
          why: "HttpOnly keeps the token away from scripts, and a 10 to 15 minute lifetime limits how long a stolen one works. Rotating the refresh token makes a stolen refresh token detectable.",
        },
      ],
      answer: "d",
    },
    {
      id: "sec-pkce-purpose",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "concept",
      section: "sessions-tokens-and-oauth-what-each-one-is-for",
      kind: "single",
      prompt:
        "<p>In the authorization code flow, the app sends a hashed challenge at the start and the original verifier when it redeems the code. What attack does this stop?</p>",
      choices: [
        {
          id: "a",
          text: "An attacker who intercepts the authorization code cannot redeem it without the verifier.",
          why: "The code arrives on the redirect, where it can leak. The verifier is never sent on that redirect, so a stolen code alone is useless at the token endpoint.",
        },
        {
          id: "b",
          text: "An attacker cannot read the user's password.",
          why: "The user signs in at the identity provider in both flows. PKCE concerns the code, not the password.",
        },
        {
          id: "c",
          text: "An attacker cannot replay an expired access token.",
          why: "Expiry already rejects an old access token. PKCE protects the step before tokens are issued.",
        },
        {
          id: "d",
          text: "The tokens become unreadable to scripts in the page.",
          why: "PKCE does not control where the issued tokens are stored. That is a separate decision, such as HttpOnly cookies.",
        },
      ],
      answer: "a",
    },
    {
      id: "sec-brute-force-seconds",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "estimate",
      section: "dry-run-reviewing-a-small-design-for-flaws",
      kind: "single",
      prompt:
        "<p>Passwords are stored as an unsalted fast hash. An attacker with the database tries every eight-letter lowercase password (26<sup>8</sup> possibilities) at an illustrative 10 billion hashes a second. About how long does the whole space take?</p>",
      choices: [
        {
          id: "a",
          text: "About 2 seconds",
          why: "26 to the eighth power is about 2.1 × 10^11, which is about ten times more than the 2 × 10^10 guesses this rate allows in two seconds.",
        },
        {
          id: "b",
          text: "About 3.5 minutes",
          why: "This is ten times too slow for the rate given. 2.09 × 10^11 guesses at 10^10 a second is about 21 seconds.",
        },
        {
          id: "c",
          text: "About 21 seconds",
          why: "26^8 = 208,827,064,576. Divided by 10,000,000,000 guesses a second that is about 20.9 seconds, so a short lowercase password falls almost at once.",
        },
        {
          id: "d",
          text: "About 58 hours",
          why: "That would suit a rate of a million hashes a second, thousands of times slower than the fast-hash rate given here.",
        },
      ],
      answer: "c",
    },
    {
      id: "sec-jwt-checks",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "concept",
      section: "sessions-tokens-and-oauth-what-each-one-is-for",
      kind: "multi",
      prompt: "<p>Select every practice that makes JWT handling safer.</p>",
      choices: [
        {
          id: "a",
          text: "Verify the signature with the algorithm you configured, and reject <code>none</code>.",
          why: "Letting the token's own header choose the algorithm lets an attacker downgrade the check. The verifier decides which algorithms it accepts.",
        },
        {
          id: "b",
          text: "Check the issuer, the audience and the expiry on every use.",
          why: "A validly signed token meant for another service or issued long ago must still be refused.",
        },
        {
          id: "c",
          text: "Put the user's password reset secret in the payload so services can use it.",
          why: "The payload is only base64url encoded, so anyone holding the token can read it. Secrets do not belong there.",
        },
        {
          id: "d",
          text: "Publish a key id with each signing key so keys can be rotated.",
          why: "A key id lets verifiers pick the right public key, so you can introduce a new key before retiring the old one.",
        },
        {
          id: "e",
          text: "Trust the <code>alg</code> field to tell you how to verify.",
          why: "This is the classic downgrade mistake. The algorithm must come from your own configuration.",
        },
      ],
      answers: ["a", "b", "d"],
    },
    {
      id: "sec-pkce-order",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "sequence",
      section: "sessions-tokens-and-oauth-what-each-one-is-for",
      kind: "order",
      prompt: "<p>Put the steps of the authorization code flow with PKCE in order.</p>",
      items: [
        { id: "verifier", text: "The app creates a random verifier and sends its hash to the identity provider" },
        { id: "signin", text: "The user signs in at the identity provider" },
        { id: "code", text: "The provider sends a one-time code to the exact registered redirect address" },
        { id: "redeem", text: "The app sends the code and the original verifier to the token endpoint" },
        { id: "tokens", text: "The provider checks the verifier and returns the tokens" },
      ],
      why: "The hash is committed first, before any code exists. The code arrives through the browser, and only the app that holds the verifier can redeem it. The provider checks that the verifier hashes to the challenge before issuing tokens.",
    },
    {
      id: "sec-card-number-storage",
      chapter: "sysdes-security-basics",
      level: "intermediate",
      skill: "tradeoff",
      section: "encryption-in-transit-at-rest-and-who-holds-the-keys",
      kind: "single",
      prompt:
        "<p>Your database is on an encrypted disk. You also need to keep a sensitive field, such as a national id, that most of the application never needs. What is the stronger design?</p>",
      choices: [
        {
          id: "a",
          text: "Rely on the disk encryption, since the data is already encrypted.",
          why: "Disk encryption stops a thief who takes the drive. Anyone who obtains the application's database credentials reads decrypted rows.",
        },
        {
          id: "b",
          text: "Encrypt the field in the application with an envelope key from a key service, and let only the code that needs it decrypt it.",
          why: "The database then holds ciphertext, a leaked database credential is not enough, and changing the wrapping key only re-wraps small data keys.",
        },
        {
          id: "c",
          text: "Store the field in a separate table with a different name.",
          why: "A new table name adds no protection. The same credentials read it in plain text.",
        },
        {
          id: "d",
          text: "Base64 encode the field before saving it.",
          why: "Base64 is an encoding, not encryption. Anyone can reverse it without a key.",
        },
      ],
      answer: "b",
    },
  ],
};
