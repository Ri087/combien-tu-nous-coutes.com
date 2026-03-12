"use client";

import {
  RiCheckLine,
  RiLinkM,
  RiPlayLine,
  RiRefreshLine,
  RiShareBoxLine,
  RiStopCircleLine,
} from "@remixicon/react";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { cn } from "@/lib/utils/cn";
import { BackgroundOrbs } from "./background-orbs";

/* ─────────────────────────── Constants ─────────────────────────── */

/** Charges patronales ~45% */
const CHARGES_PATRONALES = 1.45;
/** Heures mensuelles légales en France */
const MONTHLY_HOURS = 151.67;
/** Secondes par heure */
const SECONDS_PER_HOUR = 3600;
/** Seuil de coût élevé (€) */
const COST_THRESHOLD_HIGH = 500;
/** Seuil de coût moyen (€) */
const COST_THRESHOLD_MID = 150;
/** Durée d'affichage du message "copié" (ms) */
const COPIED_FEEDBACK_DURATION = 2000;
/** Intervalle de mise à jour de l'aria-live (ms) */
const ARIA_LIVE_INTERVAL = 5000;

/* ─────────────────────────── Odometer ─────────────────────────── */

function OdometerDigit({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1.15em] overflow-hidden pr-[0.05em] align-bottom">
      <span
        className="flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: `translateY(${-digit * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span className="block h-[1.15em]" key={n}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {value.split("").map((char, i) => {
          const digit = Number.parseInt(char, 10);
          if (Number.isNaN(digit)) {
            return <span key={`s${i}`}>{char}</span>;
          }
          return <OdometerDigit digit={digit} key={`d${i}`} />;
        })}
      </span>
    </span>
  );
}

/* ─────────────────────────── Timer ─────────────────────────── */

function useTimer(
  running: boolean,
  startTimestamp: number | null
): [number, () => void] {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && startTimestamp) {
      const tick = () => {
        setElapsed((Date.now() - startTimestamp) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [running, startTimestamp]);

  const reset = useCallback(() => {
    setElapsed(0);
  }, []);

  return [elapsed, reset];
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function fmtTime(s: number): string {
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}min ${Math.floor(s % 60)}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min`;
}

function fmtEuro(n: number): string {
  return n.toFixed(2);
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-stroke-soft-200 border-b py-3 last:border-b-0">
      <span className="text-paragraph-xs text-text-sub-600">{label}</span>
      <span className="text-label-sm text-text-strong-950">{value}</span>
    </div>
  );
}

/* ─────────────────────────── State ─────────────────────────── */

type State = {
  people: string;
  salary: string;
  startTime: string;
  running: boolean;
  done: boolean;
  startTimestamp: number | null;
  copied: boolean;
  copiedLive: boolean;
  liveAnnouncement: string;
};

type Action =
  | { type: "SET_PEOPLE"; value: string }
  | { type: "SET_SALARY"; value: string }
  | { type: "SET_START_TIME"; value: string }
  | { type: "START"; timestamp: number }
  | { type: "STOP" }
  | { type: "RESET" }
  | { type: "SET_COPIED"; value: boolean }
  | { type: "SET_COPIED_LIVE"; value: boolean }
  | { type: "SET_LIVE_ANNOUNCEMENT"; value: string };

const initialState: State = {
  people: "",
  salary: "",
  startTime: "",
  running: false,
  done: false,
  startTimestamp: null,
  copied: false,
  copiedLive: false,
  liveAnnouncement: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PEOPLE":
      return { ...state, people: action.value };
    case "SET_SALARY":
      return { ...state, salary: action.value };
    case "SET_START_TIME":
      return { ...state, startTime: action.value };
    case "START":
      return {
        ...state,
        running: true,
        done: false,
        startTimestamp: action.timestamp,
      };
    case "STOP":
      return { ...state, running: false, done: true };
    case "RESET":
      return {
        ...state,
        running: false,
        done: false,
        startTimestamp: null,
        liveAnnouncement: "",
      };
    case "SET_COPIED":
      return { ...state, copied: action.value };
    case "SET_COPIED_LIVE":
      return { ...state, copiedLive: action.value };
    case "SET_LIVE_ANNOUNCEMENT":
      return { ...state, liveAnnouncement: action.value };
  }
}

/* ─────────────────────────── Component ─────────────────────────── */

export function MeetingCounter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    people,
    salary,
    startTime,
    running,
    done,
    startTimestamp,
    copied,
    copiedLive,
    liveAnnouncement,
  } = state;

  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedLiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const costPerSecond =
    ((Number.parseFloat(salary) || 0) *
      CHARGES_PATRONALES *
      (Number.parseFloat(people) || 0)) /
    MONTHLY_HOURS /
    SECONDS_PER_HOUR;
  const [elapsed, resetTimer] = useTimer(running, startTimestamp);
  const cost = elapsed * costPerSecond;

  const canStart = costPerSecond > 0;
  const costLevel =
    cost > COST_THRESHOLD_HIGH
      ? "high"
      : cost > COST_THRESHOLD_MID
        ? "mid"
        : "low";
  const isSetup = !(running || done);

  // Periodic aria-live announcements for screen readers
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      dispatch({
        type: "SET_LIVE_ANNOUNCEMENT",
        value: `Coût actuel : ${fmtEuro(cost)} euros, ${fmtTime(elapsed)} écoulées`,
      });
    }, ARIA_LIVE_INTERVAL);
    return () => clearInterval(id);
  }, [running, cost, elapsed]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      if (copiedLiveTimeoutRef.current)
        clearTimeout(copiedLiveTimeoutRef.current);
    };
  }, []);

  // Read URL params on mount for shared sessions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const s = params.get("s");
    const t = params.get("t");
    if (p && s && t) {
      const numP = Number(p);
      const numS = Number(s);
      const numT = Number(t);
      if (
        !(
          Number.isFinite(numP) &&
          Number.isFinite(numS) &&
          Number.isFinite(numT)
        ) ||
        numP <= 0 ||
        numS <= 0 ||
        numT <= 0
      ) {
        return;
      }
      dispatch({ type: "SET_PEOPLE", value: p });
      dispatch({ type: "SET_SALARY", value: s });
      dispatch({ type: "START", timestamp: numT });
    }
  }, []);

  const handleStart = useCallback(() => {
    if (!canStart) return;
    resetTimer();
    let ts = Date.now();
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      if (d.getTime() <= Date.now()) {
        ts = d.getTime();
      }
    }
    dispatch({ type: "START", timestamp: ts });
    const url = new URL(window.location.href);
    url.searchParams.set("p", people);
    url.searchParams.set("s", salary);
    url.searchParams.set("t", String(ts));
    window.history.replaceState({}, "", url.toString());
  }, [canStart, resetTimer, startTime, people, salary]);

  const handleStop = () => {
    dispatch({ type: "STOP" });
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleReset = () => {
    resetTimer();
    dispatch({ type: "RESET" });
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleShareLive = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("p", people);
    url.searchParams.set("s", salary);
    url.searchParams.set("t", String(startTimestamp));
    const shareUrl = url.toString();
    if (navigator.share) {
      navigator.share({
        url: shareUrl,
        text: "Regarde combien cette réunion nous coûte en temps réel !",
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      dispatch({ type: "SET_COPIED_LIVE", value: true });
      if (copiedLiveTimeoutRef.current)
        clearTimeout(copiedLiveTimeoutRef.current);
      copiedLiveTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_COPIED_LIVE", value: false });
      }, COPIED_FEEDBACK_DURATION);
    }
  };

  const handleShare = () => {
    const txt = `Notre réunion de ${fmtTime(elapsed)} vient de coûter ${fmtEuro(cost)} € à l'entreprise.\n\ncombien-tu-nous-coutes.com`;
    if (navigator.share) {
      navigator.share({ text: txt });
    } else {
      navigator.clipboard.writeText(txt);
      dispatch({ type: "SET_COPIED", value: true });
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_COPIED", value: false });
      }, COPIED_FEEDBACK_DURATION);
    }
  };

  const orbTopLeft = running
    ? costLevel === "high"
      ? "bg-error-base opacity-40"
      : costLevel === "mid"
        ? "bg-warning-base opacity-35"
        : "bg-feature-base opacity-30"
    : "bg-feature-base opacity-30";

  const orbTopRight = running
    ? costLevel === "high"
      ? "bg-error-base opacity-30"
      : costLevel === "mid"
        ? "bg-warning-base opacity-25"
        : "bg-information-base opacity-25"
    : "bg-information-base opacity-25";

  const orbBottom = running
    ? costLevel === "high"
      ? "bg-warning-base opacity-30"
      : costLevel === "mid"
        ? "bg-feature-base opacity-20"
        : "bg-success-base opacity-20"
    : "bg-success-base opacity-20";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-white-0">
      <BackgroundOrbs
        animated
        bottom={orbBottom}
        topLeft={orbTopLeft}
        topRight={orbTopRight}
      />

      {/* Screen reader live region for cost updates */}
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Main */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[600px]">
          {/* ==================== HERO TEXT (always visible) ==================== */}
          <div className="mb-10 text-center">
            <p
              className={cn(
                "mb-4 text-paragraph-sm text-text-soft-400 italic transition-all duration-700",
                isSetup ? "opacity-100" : "mb-0 h-0 overflow-hidden opacity-0"
              )}
            >
              Pour tous les gens qui nous font perdre du temps
            </p>
            <h1
              className={cn(
                "font-[family-name:var(--font-display)] text-feature-dark italic leading-tight transition-all duration-700",
                isSetup
                  ? "text-[2.75rem] md:text-[3.25rem]"
                  : "text-[1.75rem] md:text-[2rem]"
              )}
            >
              Combien tu nous coûtes ?
            </h1>
            <p
              className={cn(
                "mt-3 text-paragraph-sm text-text-sub-600 transition-all duration-700",
                isSetup ? "opacity-100" : "mt-0 h-0 overflow-hidden opacity-0"
              )}
            >
              Lance le compteur pendant ta prochaine réunion.
              <br />
              Observe. Souffre.
            </p>
          </div>

          {/* Grid overlay — inputs, counter & done share the same cell */}
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
            {/* ==================== SETUP (inputs + button) ==================== */}
            <form
              className={cn(
                "flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isSetup
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-8 pointer-events-none opacity-0"
              )}
              onSubmit={(e) => {
                e.preventDefault();
                handleStart();
              }}
            >
              {/* Sentence inputs */}
              <div className="mx-auto max-w-[460px]">
                <p className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center text-label-lg text-text-strong-950">
                  <span>Nous sommes</span>
                  <input
                    aria-label="Nombre de participants"
                    className="inline-block w-[3.5ch] border-stroke-sub-300 border-b-2 bg-transparent text-center font-[family-name:var(--font-display)] text-feature-dark text-title-h4 italic outline-none transition-colors focus:border-feature-base"
                    id="people"
                    min="1"
                    onChange={(e) =>
                      dispatch({ type: "SET_PEOPLE", value: e.target.value })
                    }
                    placeholder="8"
                    type="number"
                    value={people}
                  />
                  <span>personnes</span>
                  <span>avec un salaire brut moyen de</span>
                  <input
                    aria-label="Salaire brut moyen en euros"
                    className="inline-block w-[5.5ch] border-stroke-sub-300 border-b-2 bg-transparent text-center font-[family-name:var(--font-display)] text-feature-dark text-title-h4 italic outline-none transition-colors focus:border-feature-base"
                    id="salary"
                    min="1"
                    onChange={(e) =>
                      dispatch({ type: "SET_SALARY", value: e.target.value })
                    }
                    placeholder="3500"
                    type="number"
                    value={salary}
                  />
                  <span>€ brut/mois.</span>
                </p>
              </div>

              {/* Cost preview + Start */}
              <div className="mx-auto mt-6 flex w-full max-w-[400px] flex-col gap-4">
                {/* Optional: retroactive start time */}
                <div className="flex items-center justify-between rounded-10 bg-bg-weak-50 px-4 py-3">
                  <label
                    className="text-paragraph-xs text-text-sub-600"
                    htmlFor="start-time"
                  >
                    Début de la réunion{" "}
                    <span className="text-text-soft-400">(optionnel)</span>
                  </label>
                  <input
                    aria-label="Heure de début de la réunion"
                    className="bg-transparent text-right text-label-sm text-text-strong-950 outline-none"
                    id="start-time"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_START_TIME",
                        value: e.target.value,
                      })
                    }
                    placeholder="Maintenant"
                    type="time"
                    value={startTime}
                  />
                </div>

                <FancyButton.Root
                  className="mt-2 w-full"
                  disabled={!canStart}
                  size="medium"
                  type="submit"
                  variant="neutral"
                >
                  <FancyButton.Icon as={RiPlayLine} />
                  Lancer la réunion
                </FancyButton.Root>
              </div>
            </form>

            {/* ==================== COUNTER (running) ==================== */}
            <div
              className={cn(
                "flex flex-col items-center text-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
                running
                  ? "translate-y-0 opacity-100 delay-200"
                  : done
                    ? "hidden"
                    : "pointer-events-none translate-y-12 opacity-0"
              )}
            >
              <span className="text-subheading-xs text-text-soft-400 uppercase">
                Cette réunion a coûté
              </span>

              {/* Big cost — Odometer */}
              <div className="mt-4 mb-2">
                <Odometer
                  className={cn(
                    "font-[family-name:var(--font-display)] text-[72px] italic leading-none tracking-[-3px] transition-colors duration-500 md:text-[88px]",
                    costLevel === "high" && "text-error-base",
                    costLevel === "mid" && "text-warning-base",
                    costLevel === "low" && "text-text-strong-950"
                  )}
                  value={fmtEuro(cost)}
                />
                <span className="ml-1 font-[family-name:var(--font-display)] text-[32px] text-text-disabled-300 italic md:text-[40px]">
                  €
                </span>
              </div>

              {/* Elapsed */}
              <p className="mb-8 text-paragraph-sm text-text-soft-400 tabular-nums">
                {fmtTime(elapsed)} écoulées
              </p>

              <div className="mx-auto w-full max-w-[400px]">
                <Divider.Root />

                <div className="mt-2 flex flex-col text-left">
                  <StatRow label="Participants" value={people} />
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Button.Root
                    className="flex-1"
                    mode="stroke"
                    onClick={handleShareLive}
                    size="medium"
                    type="button"
                    variant="neutral"
                  >
                    <Button.Icon as={copiedLive ? RiCheckLine : RiLinkM} />
                    {copiedLive ? "Lien copié !" : "Partager le live"}
                  </Button.Root>
                  <FancyButton.Root
                    className="flex-1"
                    onClick={handleStop}
                    size="medium"
                    type="button"
                    variant="destructive"
                  >
                    <FancyButton.Icon as={RiStopCircleLine} />
                    Terminer
                  </FancyButton.Root>
                </div>
              </div>
            </div>

            {/* ==================== DONE ==================== */}
            {done && (
              <div className="flex animate-fade-up flex-col items-center text-center">
                {/* Badge */}
                <div className="mb-8 flex justify-center">
                  <Badge.Root color="gray" size="medium" variant="lighter">
                    Bilan de réunion
                  </Badge.Root>
                </div>

                {/* Big cost — Odometer */}
                <div className="mb-2">
                  <Odometer
                    className="font-[family-name:var(--font-display)] text-[72px] text-text-strong-950 italic leading-none tracking-[-3px] md:text-[88px]"
                    value={fmtEuro(cost)}
                  />
                  <span className="ml-1 font-[family-name:var(--font-display)] text-[32px] text-text-disabled-300 italic md:text-[40px]">
                    €
                  </span>
                </div>

                {/* Summary */}
                <p className="mb-8 text-paragraph-sm text-text-sub-600">
                  pour {fmtTime(elapsed)} de réunion avec {people} personnes
                </p>

                <div className="mx-auto w-full max-w-[400px]">
                  <Divider.Root />

                  {/* Stats */}
                  <div className="mt-2 flex flex-col text-left">
                    <StatRow label="Durée" value={fmtTime(elapsed)} />
                    <StatRow label="Participants" value={people} />
                    <StatRow label="Coût total" value={`${fmtEuro(cost)} €`} />
                    <StatRow
                      label="Par personne"
                      value={`${(cost / (Number.parseFloat(people) || 1)).toFixed(2)} €`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-3">
                    <Button.Root
                      className="flex-1"
                      mode="stroke"
                      onClick={handleShare}
                      size="medium"
                      type="button"
                      variant="neutral"
                    >
                      <Button.Icon as={copied ? RiCheckLine : RiShareBoxLine} />
                      {copied ? "Copié !" : "Partager"}
                    </Button.Root>
                    <FancyButton.Root
                      className="flex-1"
                      onClick={handleReset}
                      size="medium"
                      type="button"
                      variant="neutral"
                    >
                      <FancyButton.Icon as={RiRefreshLine} />
                      Nouvelle réunion
                    </FancyButton.Root>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* end grid overlay */}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-paragraph-xs text-text-soft-400">
            combien-tu-nous-coutes.com — aucune donnée collectée
          </p>
          <nav aria-label="Liens" className="flex gap-3">
            <Link
              className="text-paragraph-xs text-text-soft-400 underline-offset-2 hover:text-text-sub-600 hover:underline"
              href="/about"
            >
              À propos
            </Link>
            <Link
              className="text-paragraph-xs text-text-soft-400 underline-offset-2 hover:text-text-sub-600 hover:underline"
              href="/privacy-policy"
            >
              Confidentialité
            </Link>
            <Link
              className="text-paragraph-xs text-text-soft-400 underline-offset-2 hover:text-text-sub-600 hover:underline"
              href="/cookie-policy"
            >
              Cookies
            </Link>
            <Link
              className="text-paragraph-xs text-text-soft-400 underline-offset-2 hover:text-text-sub-600 hover:underline"
              href="/terms-of-service"
            >
              CGU
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
