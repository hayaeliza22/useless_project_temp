"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  playGuiltySound,
  playNotGuiltySound,
} from "@/lib/courtSounds";

import type { Verdict } from "@/lib/schema";

const OFFENSES = [
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

export default function Home() {
  const [plaintiff, setPlaintiff] = useState("");
  const [defendant, setDefendant] = useState("");
  const [offense, setOffense] = useState(OFFENSES[0]);
  const [complaint, setComplaint] = useState("");
  const [exhibit, setExhibit] = useState<File | null>(null);

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!verdict) return;

    if (verdict.verdict === "GUILTY") {
      playGuiltySound();
    } else {
      playNotGuiltySound();
    }
  }, [verdict]);

  async function submitCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData();

    formData.append("plaintiffName", plaintiff);
    formData.append("defendantName", defendant);
    formData.append("offenseCategory", offense);
    formData.append("complaintText", complaint);

    if (exhibit) {
      formData.append("exhibit", exhibit);
    }

    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        body: formData,
      });

      /*
       * IMPORTANT:
       * Never blindly call response.json().
       * If the server returns an empty response, HTML,
       * or some unexpected text, response.json() itself crashes.
       */
      const rawText = await response.text();

      let data: Record<string, unknown> = {};

      if (rawText.trim()) {
        try {
          data = JSON.parse(rawText) as Record<string, unknown>;
        } catch {
          throw new Error(
            `The tribunal returned something that was definitely not JSON. HTTP ${response.status}.`,
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `The court malfunctioned with HTTP ${response.status}.`,
        );
      }

      if (!data.verdict) {
        throw new Error(
          "The judge disappeared before delivering the verdict.",
        );
      }

      setVerdict(data as Verdict);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The tribunal has adjourned in chaos.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     VERDICT SCREEN
     ======================================================== */

  if (verdict) {
    const guilty = verdict.verdict === "GUILTY";

    return (
      <main className="min-h-screen px-5 py-8 text-cream sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Header />

          <section className="simple-verdict">

            {/* VERDICT */}

            <div className="verdict-main">
              <p className="eyebrow">
                Petty Bench has unfortunately decided
              </p>

              <div
                className={`big-verdict ${
                  guilty ? "is-guilty" : "is-free"
                }`}
              >
                {guilty ? "💀 GUILTY" : "🫡 NOT GUILTY"}
              </div>

              <p className="charge-line">
                {verdict.chargeTitle}
              </p>

              <div className="guilt-meter compact-meter">
                <div className="meter-label">
                  <span>Criminal vibes</span>

                  <strong>
                    {verdict.guiltPercentage}%
                  </strong>
                </div>

                <div className="meter-track">
                  <div
                    className={`meter-fill ${
                      guilty ? "is-guilty" : "is-free"
                    }`}
                    style={{
                      width: `${verdict.guiltPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ROAST — THE MAIN EVENT */}

            <div
              className={`roast-card ${
                guilty
                  ? "roast-guilty"
                  : "roast-not-guilty"
              }`}
            >
              <div className="roast-header">
                <span className="roast-fire">
                  🔥
                </span>

                <div>
                  <p className="eyebrow">
                    The court has zero chill
                  </p>

                  <h3>
                    COURTROOM ROAST
                  </h3>
                </div>
              </div>

              <p className="roast-text">
                {verdict.roast}
              </p>
            </div>

            {/* QUICK RULING */}

            <div className="quick-ruling">
              <div>
                <p className="eyebrow">
                  Punishment
                </p>

                <p className="sentence">
  {verdict.sentence}
</p>
              </div>

              <div>
                <p className="eyebrow">
                  Extremely real fine
                </p>

                <p className="fine">
                  {verdict.mockFine}
                </p>
              </div>
            </div>

            <p className="audio-note">
              {guilty
                ? "🔊 The defendant has been cooked."
                : "🔊 The prosecution has taken the L."}
            </p>

            <button
              className="secondary-button verdict-reset"
              onClick={() => {
                setVerdict(null);
                setError("");
              }}
            >
              ↩ File another completely unnecessary case
            </button>
          </section>
        </div>
      </main>
    );
  }

  /* ========================================================
     FILING SCREEN
     ======================================================== */

  return (
    <main className="min-h-screen px-5 py-8 text-cream sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Header />

        <section className="intro-row">
          <div>
            <p className="eyebrow">
              Docket no. 004 · Now hearing
            </p>

            <h2>
              Bring forth your
              <br />
              <em>pettiest</em> grievance.
            </h2>
          </div>

          <p className="intro-copy">
            A completely unnecessary court for
            extremely unserious problems.
          </p>
        </section>

        <form
          className="filing-grid"
          onSubmit={submitCase}
        >
          {/* PARTIES */}

          <div className="form-panel">
            <div className="section-title">
              <span>01</span>
              <h3>
                The victims & suspects
              </h3>
            </div>

            <div className="name-grid">
              <Field
                label="Plaintiff name"
                value={plaintiff}
                onChange={setPlaintiff}
                placeholder="The aggrieved"
              />

              <Field
                label="Defendant name"
                value={defendant}
                onChange={setDefendant}
                placeholder="The accused"
              />
            </div>

            <label
              className="field-label"
              htmlFor="offense"
            >
              Nature of the nonsense
            </label>

            <select
              id="offense"
              value={offense}
              onChange={(event) =>
                setOffense(event.target.value)
              }
            >
              {OFFENSES.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="section-title second">
              <span>02</span>
              <h3>State your case</h3>
            </div>

            <label
              className="field-label"
              htmlFor="complaint"
            >
              What happened?
            </label>

            <textarea
              id="complaint"
              required
              value={complaint}
              onChange={(event) =>
                setComplaint(event.target.value)
              }
              placeholder="Tell the court what they did..."
              rows={5}
            />

            <p className="character-hint">
              More petty details = more material for the roast.
            </p>
          </div>

          {/* EVIDENCE */}

          <div className="evidence-panel">
            <div className="section-title">
              <span>03</span>
              <h3>Exhibit A</h3>
            </div>

            <label
              className="upload-zone"
              htmlFor="exhibit"
            >
              <span className="upload-mark">
                {exhibit ? "✓" : "+"}
              </span>

              <strong>
                {exhibit
                  ? exhibit.name
                  : "Admit evidence"}
              </strong>

              <small>
                Photo or screenshot · optional
              </small>

              <input
                id="exhibit"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setExhibit(
                    event.target.files?.[0] || null,
                  )
                }
              />
            </label>

            <div className="evidence-rule">
              <span>THE HONOURABLE</span>
              <span>◊</span>
              <span>PETTY BENCH</span>
            </div>

            {error && (
              <div className="error-message">
                <strong>
                  🚨 PROCEDURAL DISASTER
                </strong>

                <p>{error}</p>
              </div>
            )}

            <button
              className="gavel-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Judge is cooking..."
                  : "Commence proceedings"}
              </span>

              <b>
                {loading ? "⏳" : "⚖"}
              </b>
            </button>

            <p className="fine-print">
              Legally binding in roommate group chats only.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

/* =========================================================
   HEADER
   ========================================================= */

function Header() {
  return (
    <header className="site-header">
      <div className="brand-mark">
        PB
      </div>

      <div>
        <p className="eyebrow">
          Supreme tribunal of nonsense
        </p>

        <h1>
          Petty Bench
        </h1>
      </div>

      <div className="header-status">
        <span className="status-dot" />
        Open for grievances
      </div>
    </header>
  );
}

/* =========================================================
   INPUT FIELD
   ========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const id = label
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div>
      <label
        className="field-label"
        htmlFor={id}
      >
        {label}
      </label>

      <input
        id={id}
        required
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
      />
    </div>
  );
}