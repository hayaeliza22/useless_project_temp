export const verdictJsonSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    verdict: {
      type: "string",
      enum: ["GUILTY", "NOT GUILTY"],
    },

    guiltPercentage: {
      type: "number",
    },

    chargeTitle: {
      type: "string",
    },

    opinionText: {
      type: "string",
    },

    roast: {
      type: "string",
    },

    sentence: {
      type: "string",
    },

    mockFine: {
      type: "string",
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
} as const;

export type Verdict = {
  verdict: "GUILTY" | "NOT GUILTY";

  guiltPercentage: number;

  chargeTitle: string;

  opinionText: string;

  roast: string;

  sentence: string;

  mockFine: string;
};