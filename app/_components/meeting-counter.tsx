"use client";

import {
  RiCheckLine,
  RiLinkM,
  RiPlayLine,
  RiRefreshLine,
  RiShareBoxLine,
  RiStopCircleLine,
} from "@remixicon/react";
import { useCallback, useEffect, useRef, useState } from "react";

import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { cn } from "@/lib/utils/cn";

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
    <span aria-label={value} className={className}>
      {value.split("").map((char, i) => {
        const digit = Number.parseInt(char, 10);
        if (Number.isNaN(digit)) {
          return <span key={`s${i}`}>{char}</span>;
        }
        return <OdometerDigit digit={digit} key={`d${i}`} />;
      })}
    </span>
  );
}

/* ─────────────────────────── Timer ─────────────────────────── */

function useTimer(
  running: boolean,
  startTimestamp: number | null
): [number, () => void] {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && startTimestamp) {
      intervalRef.current = setInterval(
        () => setElapsed((Date.now() - startTimestamp) / 1000),
        50
      );
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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

/* ─────────────────────────── Component ─────────────────────────── */

export function MeetingCounter() {
  const [people, setPeople] = useState("");
  const [salary, setSalary] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLive, setCopiedLive] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [isSharedSession, setIsSharedSession] = useState(false);
  const [startTime, setStartTime] = useState("");

  // Coût employeur = salaire brut × 1.45 (charges patronales ~45%)
  const CHARGES_PATRONALES = 1.45;
  const costPerSecond =
    ((Number.parseFloat(salary) || 0) *
      CHARGES_PATRONALES *
      (Number.parseFloat(people) || 0)) /
    151.67 /
    3600;
  const [elapsed, resetTimer] = useTimer(running, startTimestamp);
  const cost = elapsed * costPerSecond;

  const canStart = costPerSecond > 0;
  const costLevel = cost > 500 ? "high" : cost > 150 ? "mid" : "low";
  const isSetup = !(running || done);

  // Read URL params on mount for shared sessions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const s = params.get("s");
    const t = params.get("t");
    if (p && s && t) {
      setPeople(p);
      setSalary(s);
      setStartTimestamp(Number(t));
      setRunning(true);
      setIsSharedSession(true);
    }
  }, []);

  const handleStart = () => {
    if (!canStart) return;
    resetTimer();
    setDone(false);
    let ts = Date.now();
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      if (d.getTime() <= Date.now()) {
        ts = d.getTime();
      }
    }
    setStartTimestamp(ts);
    setRunning(true);
    setIsSharedSession(false);
    // Set URL params
    const url = new URL(window.location.href);
    url.searchParams.set("p", people);
    url.searchParams.set("s", salary);
    url.searchParams.set("t", String(ts));
    window.history.replaceState({}, "", url.toString());
  };

  const handleStop = () => {
    setRunning(false);
    setDone(true);
    // Clear URL params
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleReset = () => {
    resetTimer();
    setRunning(false);
    setDone(false);
    setStartTimestamp(null);
    setIsSharedSession(false);
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
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2000);
    }
  };

  const handleShare = () => {
    const txt = `Notre réunion de ${fmtTime(elapsed)} vient de coûter ${fmtEuro(cost)} € à l'entreprise.\n\ncombien-tu-nous-coutes.com`;
    if (navigator.share) {
      navigator.share({ text: txt });
    } else {
      navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-white-0">
      {/* Orbs */}
      <div
        className={cn(
          "-top-32 -left-32 pointer-events-none absolute size-[400px] rounded-full opacity-30 blur-[100px] transition-all duration-[2000ms]",
          running
            ? costLevel === "high"
              ? "bg-error-base opacity-40"
              : costLevel === "mid"
                ? "bg-warning-base opacity-35"
                : "bg-feature-base"
            : "bg-feature-base"
        )}
      />
      <div
        className={cn(
          "-right-32 pointer-events-none absolute top-1/3 size-[350px] rounded-full opacity-25 blur-[100px] transition-all duration-[2000ms]",
          running
            ? costLevel === "high"
              ? "bg-error-base opacity-30"
              : costLevel === "mid"
                ? "bg-warning-base opacity-25"
                : "bg-information-base"
            : "bg-information-base"
        )}
      />
      <div
        className={cn(
          "-bottom-24 pointer-events-none absolute left-1/4 size-[300px] rounded-full opacity-20 blur-[100px] transition-all duration-[2000ms]",
          running
            ? costLevel === "high"
              ? "bg-warning-base opacity-30"
              : costLevel === "mid"
                ? "bg-feature-base"
                : "bg-success-base"
            : "bg-success-base"
        )}
      />

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
                "bg-gradient-to-r from-feature-dark via-error-base to-warning-base bg-clip-text font-[family-name:var(--font-display)] text-transparent italic leading-tight transition-all duration-700",
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
            <div
              className={cn(
                "flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isSetup
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-8 pointer-events-none opacity-0"
              )}
            >
              {/* Sentence inputs */}
              <div className="mx-auto max-w-[460px]">
                <p className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center text-label-lg text-text-strong-950">
                  <span>Nous sommes</span>
                  <input
                    className="inline-block w-[3.5ch] border-stroke-sub-300 border-b-2 bg-transparent text-center font-[family-name:var(--font-display)] text-feature-dark text-title-h4 italic outline-none transition-colors focus:border-feature-base"
                    id="people"
                    onChange={(e) => setPeople(e.target.value)}
                    placeholder="8"
                    type="number"
                    value={people}
                  />
                  <span>personnes</span>
                  <span>avec un salaire brut moyen de</span>
                  <input
                    className="inline-block w-[5.5ch] border-stroke-sub-300 border-b-2 bg-transparent text-center font-[family-name:var(--font-display)] text-feature-dark text-title-h4 italic outline-none transition-colors focus:border-feature-base"
                    id="salary"
                    onChange={(e) => setSalary(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
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
                  <span className="text-paragraph-xs text-text-sub-600">
                    Début de la réunion{" "}
                    <span className="text-text-soft-400">(optionnel)</span>
                  </span>
                  <input
                    className="bg-transparent text-right text-label-sm text-text-strong-950 outline-none"
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Maintenant"
                    type="time"
                    value={startTime}
                  />
                </div>

                <FancyButton.Root
                  className="mt-2 w-full"
                  disabled={!canStart}
                  onClick={handleStart}
                  size="medium"
                  type="button"
                  variant="neutral"
                >
                  <FancyButton.Icon as={RiPlayLine} />
                  Lancer la réunion
                </FancyButton.Root>
              </div>
            </div>

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
              <p
                className="mb-8 text-paragraph-sm text-text-soft-400"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
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
      <footer className="px-6 py-4 text-center">
        <p className="text-paragraph-xs text-text-soft-400">
          combien-tu-nous-coutes.com — aucune donnée collectée
        </p>
      </footer>
    </div>
  );
}
