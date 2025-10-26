import { NextResponse } from "next/server";

const GEMINI_MODEL_ID = "gemini-2.5-flash-image-preview";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;
const GEMINI_TIMEOUT_MS = 60_000;

const toneDescriptions: Record<string, string> = {
  pose: "un ton posé et calme",
  direct: "un ton direct et franc",
  chaleureux: "un ton chaleureux et amical",
  doux: "un ton inspirant et doux",
  rigolo: "un ton rigolo et détendu"
};

const layoutDescriptions: Record<string, string> = {
  clair: "un style très épuré avec beaucoup d'espace blanc",
  range: "une mise en page bien rangée avec quelques éléments illustrés",
  vivant: "une page vibrante avec beaucoup d'images"
};

const reasonDescriptions: Record<string, string> = {
  vente: "pour vendre plus facilement",
  contact: "pour que les personnes puissent le contacter",
  montrer: "pour montrer son travail",
  autre: "autre besoin à préciser"
};

const moodDescriptions: Record<string, string> = {
  doux: "une ambiance douce et calme",
  joyeux: "un univers joyeux et coloré",
  clair: "un style simple et clair",
  chic: "une sensation chic et sérieuse",
  autre: "un univers personnalisé"
};

type GeminiRequestBody = {
  name: string;
  activity: string;
  reasons: string[];
  otherReason: string;
  services: { title: string; description: string; price: string }[];
  colors: string[];
  mood: string;
  moodCustom: string;
  tone: string;
  feelings: string[];
  layout: string;
  signature: string;
  city: string;
  hasLogo: boolean;
  hasPhotos: boolean;
};

const sanitizeList = (values: string[]) =>
  values
    .map((value) => value.trim())
    .filter((value, index, array) => value !== "" && array.indexOf(value) === index);

const buildPrompt = (body: GeminiRequestBody) => {
  const services = body.services
    .map((service) => {
      const parts = [service.title.trim(), service.description.trim(), service.price.trim()]
        .filter(Boolean)
        .join(" — ");
      return parts;
    })
    .filter(Boolean);

  const cleanedReasons = sanitizeList(
    body.reasons.map((reason) =>
      reason === "autre"
        ? body.otherReason
        : reasonDescriptions[reason] || reason
    )
  );

  const cleanedFeelings = sanitizeList(body.feelings);

  const palette = sanitizeList(body.colors);

  const moodDescription =
    body.mood === "autre"
      ? `une ambiance ${body.moodCustom.trim() || "unique"}`
      : moodDescriptions[body.mood] || "une ambiance personnalisée";

  const toneDescription = toneDescriptions[body.tone] || "un ton chaleureux";
  const layoutDescription = layoutDescriptions[body.layout] || "une mise en page équilibrée";

  const details: string[] = [
    `Nom de la marque : ${body.name || "Nom à définir"}.`,
    body.activity ? `Activité principale : ${body.activity}.` : "",
    cleanedReasons.length > 0
      ? `Objectifs recherchés : ${cleanedReasons.join(", ")}.`
      : "",
    services.length > 0
      ? `Offres à mettre en avant : ${services.join(" | ")}.`
      : "",
    palette.length > 0
      ? `Palette de couleurs à respecter : ${palette.join(", ")}.`
      : "",
    `Ambiance souhaitée : ${moodDescription}.`,
    `Ton éditorial : ${toneDescription}.`,
    cleanedFeelings.length > 0
      ? `Émotions à transmettre : ${cleanedFeelings.join(", ")}.`
      : "",
    `Préférence de mise en page : ${layoutDescription}.`,
    body.signature ? `Signature personnelle ou devise : ${body.signature}.` : "",
    body.city ? `Localisation : ${body.city}.` : "",
    body.hasLogo ? "Prévoir un emplacement subtil pour le logo." : "",
    body.hasPhotos
      ? "Suggérer une grille de photos du travail pour renforcer la preuve sociale."
      : "",
    "Montrer une capture réaliste, nette et professionnelle d'une page d'accueil responsive vue sur ordinateur.",
    "Inclure un bouton d'action vert « Discuter sur WhatsApp » bien visible.",
    "Le rendu final doit être livré en PNG, prêt à être partagé avec le client."
  ].filter(Boolean);

  return [
    "Tu es un directeur artistique qui crée un aperçu crédible d'une page d'accueil de site web.",
    "Compose une scène comme si c'était une capture d'écran de site vitrine moderne avec sections, titres et visuels harmonieux.",
    details.join(" ")
  ].join(" ");
};

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "La clé API Gemini est manquante. Ajoute GEMINI_API_KEY dans tes variables d'environnement." },
      { status: 500 }
    );
  }

  let body: GeminiRequestBody;

  try {
    body = (await request.json()) as GeminiRequestBody;
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de lire les informations envoyées pour la génération." },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "image/png",
          aspectRatio: "3:2"
        }
      })
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const errorMessage =
        (errorPayload as { error?: { message?: string } })?.error?.message ||
        "La génération d'image a échoué du côté de Gemini.";
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const json = (await response.json()) as Record<string, unknown>;

    const candidates = json?.candidates as Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string };
        }>;
      };
    }> | undefined;

    const inlineData = candidates?.[0]?.content?.parts?.find((part) =>
      part.inlineData?.data
    )?.inlineData;

    const base64Data = inlineData?.data;

    if (!base64Data) {
      return NextResponse.json(
        { error: "Gemini n'a retourné aucune image pour cette demande." },
        { status: 502 }
      );
    }

    const mimeType = inlineData?.mimeType || "image/png";

    return NextResponse.json({
      imageUrl: `data:${mimeType};base64,${base64Data}`
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "La génération a pris trop de temps. Réessaie dans un instant." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur inattendue est survenue pendant la génération." },
      { status: 500 }
    );
  }
}
