export const runtime = "nodejs";

interface JokeApiSingle {
  error: false;
  type: "single";
  joke: string;
}

interface JokeApiTwoPart {
  error: false;
  type: "twopart";
  setup: string;
  delivery: string;
}

interface JokeApiError {
  error: true;
}

type JokeApiResponse = JokeApiSingle | JokeApiTwoPart | JokeApiError;

export async function GET() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/joke/Programming?safe-mode", {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`JokeAPI responded ${res.status}`);
    const data: JokeApiResponse = await res.json();
    if (data.error) throw new Error("JokeAPI returned an error");

    const text = data.type === "single" ? data.joke : `${data.setup}\n${data.delivery}`;
    return Response.json({ text }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json(
      { text: "Why do programmers prefer dark mode? Because light attracts bugs." },
      { status: 200 }
    );
  }
}
