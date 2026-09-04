import { NextRequest, NextResponse } from "next/server";
import type { Verdict } from "@/shared/schema";

export const runtime = "nodejs";

const ALLOWED_OFFENSES = [
  "Unwashed Dish Felony",
  "Thermostat Sabotage",
  "Oat Milk Embezzlement",
  "Passive-Aggressive Sticky Note",
  "The Great Tupperware Disappearance",
  "Criminal Crumb Distribution",
  "Wi-Fi Bandwidth Theft",
  "Midnight Kitchen Disturbance",
  "Fridge Shelf Occupation",
  "Laundry Machine Squatting",
  "Unsolicited Group Chat Reaction",
  "Suspicious Sponge Misconduct",
  "Toilet Paper Roll Negligence",
  "Last Slice Tampering",
  "Door Slamming in the First Degree",
  "Charging Cable Grand Theft",
  "Dishwasher Loading Crimes",
  "Illegal Snack Consumption",
  "Air Conditioner Button Abuse",
  "Mysterious Sock Placement",
  "Alarm Snooze Conspiracy",
  "Common Area Colonization",
  "Unlicensed Leftover Consumption",
  "Theft of the Good Mug",
] as const;

/* =========================================================
   GEMINI SYSTEM PROMPT
   ========================================================= */

const SYSTEM_PROMPT = `
You are the judge of "Petty Bench", a completely useless AI courtroom for extremely unserious roommate drama.

The entire point of this website is comedy.

You judge tiny household disputes as if they are historically important Supreme Court cases.

Your job:
- Decide GUILTY or NOT GUILTY.
- Roast the situation.
- Make the result funny, ridiculous and meme-like.
- Keep everything harmless.
- Be unserious.
- Be dramatic about things that absolutely do not deserve this level of drama.

This is a hackathon project whose primary legal purpose is causing people to laugh at their roommate.

STYLE:

Use internet-humor energy.

Examples of the general vibe:

"bro really thought nobody would notice 💀"

"your honor, this is embarrassing."

"the vibes are legally suspicious."

"absolutely criminal levels of audacity."

"the prosecution cooked."

"bro has been sentenced to washing the pan."

"the court has seen enough."

"this is not a good look for the defendant."

"the allegations are unfortunately allegations-ing."

Do NOT copy those examples word-for-word every time.

Create ORIGINAL jokes based on the actual complaint.

The roast should feel spontaneous and slightly stupid.

IMPORTANT:

Do NOT be genuinely cruel.

Do NOT attack protected characteristics.

Do NOT make jokes about serious violence.

Do NOT make threats.

Do NOT turn this into serious legal advice.

Do NOT write like a boring lawyer.

Do NOT write essays.

Keep every field short.

VERDICT:

Choose GUILTY when the complaint and evidence reasonably support the accusation.

Choose NOT GUILTY when the evidence is weak, unclear, contradictory, or the accusation is not convincing.

IMAGE:

If Exhibit A is provided, examine it carefully.

Only mention things that are actually visible.

Never invent details.

OUTPUT:

Return ONLY valid JSON matching the supplied schema.

Keep the fields SHORT:

opinionText:
1 short funny sentence.

roast:
1-3 short funny sentences.
This is the MAIN JOKE.
Make this the funniest field.

sentence:
One short, completely ridiculous punishment.

The punishment should feel like the court has WAY too much authority over an extremely minor roommate dispute.

Make it meme-worthy and specific to the offense.

Examples of the general energy:

"Defendant is sentenced to washing the pan they 'forgot' existed."

"Defendant must surrender the aux for 72 consecutive business hours."

"Defendant must replace the toilet paper roll under direct judicial supervision."

"Defendant is hereby banned from touching the thermostat without adult supervision."

"Defendant must provide one apology, two snacks, and a written explanation to the household."

"Defendant shall stare at the empty fridge and reflect on their choices."

"Defendant is sentenced to putting the fitted sheet on correctly. Good luck."

"Defendant must clean the evidence and think about what they've done."

"Defendant loses Wi-Fi privileges until further notice."

Do NOT copy these exactly every time. Generate original punishments based on the offense and complaint.

Punishments should be harmless, petty, absurd, and funny.

mockFine:
Very short and funny.

chargeTitle:
Short and dramatic.

Do NOT produce essays.
Do NOT repeat the complaint.
Do NOT explain your reasoning.
Do NOT add anything outside the JSON.
`;

/* =========================================================
   LOCAL FALLBACK
   ========================================================= */

function localVerdict(
  offenseCategory: string,
  plaintiffName: string,
  defendantName: string,
  complaintText: string,
  hasExhibit: boolean,
): Verdict {
  const words = complaintText.toLowerCase();

  const exculpatory =
    /already|cleaned|washed|replaced|permission|accident|not mine|wasn't/i.test(
      words,
    );

  const incriminating =
    /never|left|stole|took|empty|dirty|cold|hot|note|again|days|week|mold/i.test(
      words,
    );

  const guilty = incriminating && !exculpatory;

  if (guilty) {
    return {
      verdict: "GUILTY",

      guiltPercentage: hasExhibit ? 94 : 82,

      chargeTitle:
        `${offenseCategory}: The People vs. ${defendantName}`,

      opinionText:
        `The evidence is unfortunately giving "bro absolutely did it."`,

      roast:
        `${defendantName} really saw the situation, considered the consequences, and chose nonsense anyway. Your honor, the audacity is doing Olympic numbers 💀.`,

      sentence:
  `${defendantName} is sentenced to fixing the problem immediately and explaining their crimes to the household.`,

      mockFine:
        "$12.40 + one premium snack",
    };
  }

  return {
    verdict: "NOT GUILTY",

    guiltPercentage: hasExhibit ? 22 : 31,

    chargeTitle:
      `${offenseCategory}: The People vs. ${defendantName}`,

    opinionText:
      `The court wanted drama, but the evidence has chosen unemployment.`,

    roast:
      `The prosecution arrived with confidence and approximately zero receipts. ${defendantName} has somehow escaped the allegations with the grace of a man who definitely checked the group chat first 💀.`,

    sentence:
  `${plaintiffName} must withdraw the accusation, take the L, and reflect on these proceedings.`,

    mockFine:
      "$0.00 + one ceremonial apology",
  };
}

/* =========================================================
   GEMINI RESPONSE PARSER
   ========================================================= */

function parseJson(text: string): Verdict {
  let cleaned = text.trim();

  if (!cleaned) {
    throw new Error("Gemini returned an empty judgment.");
  }

  /*
   * Remove markdown fences if Gemini adds them.
   */

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  /*
   * Sometimes models put a little extra text around JSON.
   * Try to isolate the JSON object.
   */

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned) as Partial<Verdict>;

  if (
    parsed.verdict !== "GUILTY" &&
    parsed.verdict !== "NOT GUILTY"
  ) {
    throw new Error("Invalid verdict.");
  }

  if (
    typeof parsed.guiltPercentage !== "number" ||
    typeof parsed.chargeTitle !== "string" ||
    typeof parsed.opinionText !== "string" ||
    typeof parsed.roast !== "string" ||
    typeof parsed.sentence !== "string" ||
    typeof parsed.mockFine !== "string"
  ) {
    throw new Error("Gemini returned an incomplete judgment.");
  }

  return {
    verdict: parsed.verdict,

    guiltPercentage: Math.max(
      0,
      Math.min(
        100,
        Math.round(parsed.guiltPercentage),
      ),
    ),

    chargeTitle: parsed.chargeTitle,
    opinionText: parsed.opinionText,
    roast: parsed.roast,
    sentence: parsed.sentence,
    mockFine: parsed.mockFine,
  };
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const plaintiffName = String(
      formData.get("plaintiffName") ?? "",
    ).trim();

    const defendantName = String(
      formData.get("defendantName") ?? "",
    ).trim();

    const offenseCategory = String(
      formData.get("offenseCategory") ?? "",
    ).trim();

    const complaintText = String(
      formData.get("complaintText") ?? "",
    ).trim();

    const exhibit = formData.get("exhibit");

    /* =====================================================
       VALIDATE
       ===================================================== */

    if (
      !plaintiffName ||
      !defendantName ||
      !complaintText ||
      !ALLOWED_OFFENSES.includes(
        offenseCategory as (typeof ALLOWED_OFFENSES)[number],
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The court refuses to hear an incomplete or improper filing.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       OPTIONAL IMAGE
       ===================================================== */

    const image =
      exhibit instanceof File && exhibit.size > 0
        ? exhibit
        : null;

    /* =====================================================
       LOCAL FALLBACK
       ===================================================== */

    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "GEMINI_API_KEY is missing. Using local verdict.",
      );

      return NextResponse.json(
        localVerdict(
          offenseCategory,
          plaintiffName,
          defendantName,
          complaintText,
          Boolean(image),
        ),
      );
    }

    /* =====================================================
       GEMINI CONTENT
       ===================================================== */

    const userText = `
Plaintiff: ${plaintiffName}

Defendant: ${defendantName}

Offense: ${offenseCategory}

Complaint:
${complaintText}

${
  image
    ? "Exhibit A has been attached as an image."
    : "No Exhibit A was provided."
}

Judge this extremely unnecessary case.

Keep everything short.

Make the roast the funniest part.

Do not write an essay.
`;

    const parts: Array<Record<string, unknown>> = [
      {
        text: `${SYSTEM_PROMPT}\n\n${userText}`,
      },
    ];

    /* =====================================================
       IMAGE
       ===================================================== */

    if (image) {
      const base64 = Buffer.from(
        await image.arrayBuffer(),
      ).toString("base64");

      parts.push({
        inline_data: {
          mime_type: image.type || "image/jpeg",
          data: base64,
        },
      });
    }

    /* =====================================================
       GEMINI API
       ===================================================== */

    const model =
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash";

    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiResponse = await fetch(
      apiUrl,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],

          generationConfig: {
            temperature: 1.15,

            responseMimeType: "application/json",

            responseSchema: {
              type: "OBJECT",

              properties: {
                verdict: {
                  type: "STRING",
                  enum: [
                    "GUILTY",
                    "NOT GUILTY",
                  ],
                },

                guiltPercentage: {
                  type: "INTEGER",
                },

                chargeTitle: {
                  type: "STRING",
                },

                opinionText: {
                  type: "STRING",
                },

                roast: {
                  type: "STRING",
                },

                sentence: {
                  type: "STRING",
                },

                mockFine: {
                  type: "STRING",
                },
              },

              required: [
                "verdict",
                "guiltPercentage",
                "chargeTitle",
                "opinionText",
                "roast",
                "sentence",
                "mockFine",
              ],
            },
          },
        }),
      },
    );

    /* =====================================================
       GEMINI FAILURE
       ===================================================== */

    if (!geminiResponse.ok) {
      const errorText =
        await geminiResponse.text();

      console.error(
        "Gemini API error:",
        errorText,
      );

      return NextResponse.json(
        localVerdict(
          offenseCategory,
          plaintiffName,
          defendantName,
          complaintText,
          Boolean(image),
        ),
      );
    }

    /* =====================================================
       READ GEMINI RESPONSE
       ===================================================== */

    const rawGeminiText =
      await geminiResponse.text();

    if (!rawGeminiText.trim()) {
      console.error(
        "Gemini returned an empty HTTP response.",
      );

      return NextResponse.json(
        localVerdict(
          offenseCategory,
          plaintiffName,
          defendantName,
          complaintText,
          Boolean(image),
        ),
      );
    }

    let payload: {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    try {
      payload = JSON.parse(rawGeminiText) as typeof payload;
    } catch (error) {
      console.error(
        "Could not parse Gemini HTTP response:",
        error,
      );

      return NextResponse.json(
        localVerdict(
          offenseCategory,
          plaintiffName,
          defendantName,
          complaintText,
          Boolean(image),
        ),
      );
    }

    const outputText =
      payload.candidates?.[0]?.content?.parts?.[0]
        ?.text;

    if (!outputText) {
      console.error(
        "Gemini returned no candidate text.",
      );

      return NextResponse.json(
        localVerdict(
          offenseCategory,
          plaintiffName,
          defendantName,
          complaintText,
          Boolean(image),
        ),
      );
    }

    /* =====================================================
       PARSE VERDICT
       ===================================================== */

    try {
      const verdict = parseJson(outputText);

      return NextResponse.json(verdict);
    } catch (error) {
      console.error(
        "Gemini returned invalid verdict JSON:",
        error,
      );

      return NextResponse.json(
        localVerdict(
          offenseCategory,
          plaintiffName,
          defendantName,
          complaintText,
          Boolean(image),
        ),
      );
    }
  } catch (error) {
    console.error(
      "Judge route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The tribunal has experienced a catastrophic meme-related administrative failure.",
      },
      { status: 500 },
    );
  }
}