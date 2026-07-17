import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an AI assistant for oriensworld's website. You help visitors learn about the company's services, capabilities, and projects.

About oriensworld:
- A cross-disciplinary studio offering architecture, graphic design, web development, software engineering, and game development services
- Founded on the belief that the best work happens when disciplines collide
- Bridges physical and digital design thinking

Services & Capabilities:
- Architecture: Rhino, Grasshopper, Revit, AutoCAD, V-Ray, parametric design, BIM
- Software Engineering: TypeScript, React, Node.js, C++, PostgreSQL, full-stack development
- Graphic Design: Photoshop, Illustrator, After Effects, Lightroom, Figma, brand identity
- Game Development: Unreal Engine 5, C++, Blueprints, HLSL, level design
- Web Development: Astro, Next.js, Tailwind CSS, Vercel, WordPress

Keep responses concise (2-3 sentences max), friendly, and professional. If asked something you don't know, suggest they reach out via email at dadavidtseng@gmail.com.`;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Try both env access patterns (Astro + Node.js)
    const apiKey =
      import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error(
        "ANTHROPIC_API_KEY not found. Available env keys:",
        Object.keys(import.meta.env).filter((k) => !k.startsWith("_"))
      );
      return new Response(
        JSON.stringify({
          message:
            "The AI assistant is not configured yet. Please reach out via email at dadavidtseng@gmail.com.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const message = textBlock
      ? textBlock.text
      : "I couldn't generate a response.";

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Log the full error for debugging
    const errMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    const errName = error instanceof Error ? error.name : "Unknown";
    console.error(`Chat API error [${errName}]: ${errMsg}`);

    // Return user-friendly message with debug hint in dev
    const isDev = import.meta.env.DEV;
    return new Response(
      JSON.stringify({
        message: isDev
          ? `Error: ${errMsg}`
          : "Sorry, I'm having trouble right now. Please try again or email dadavidtseng@gmail.com.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
