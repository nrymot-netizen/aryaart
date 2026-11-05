"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const AGE_ATTESTATION_KEY = "arya-age-attestation-v1";

export function AgeAttestation() {
  const [status, setStatus] = useState<"loading" | "open" | "ok" | "under13">("loading");

  useEffect(() => {
    const stored = window.localStorage.getItem(AGE_ATTESTATION_KEY);
    setStatus(stored === "13plus" ? "ok" : "open");
  }, []);

  if (status === "loading" || status === "ok") return null;

  if (status === "under13") {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-paper px-6" role="alertdialog" aria-labelledby="age-under-title">
        <div className="max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Arya Art</p>
          <h2 id="age-under-title" className="mt-3 font-[family-name:var(--font-display)] text-4xl">This demo is for ages 13 and up</h2>
          <p className="mt-4 text-sm leading-6 text-black/60">Arya does not offer an under-13 experience. This screen is not identity verification — it is a product rule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="w-full max-w-md rounded-4xl bg-paper p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Age notice</p>
        <h2 id="age-title" className="mt-2 font-[family-name:var(--font-display)] text-3xl">Are you 13 or older?</h2>
        <p className="mt-3 text-sm leading-6 text-black/60">Arya is 13+. This is not age verification, a parent portal, or a COPPA claim.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => {
              window.localStorage.setItem(AGE_ATTESTATION_KEY, "13plus");
              setStatus("ok");
            }}
          >
            I am 13 or older
          </Button>
          <Button variant="ghost" onClick={() => setStatus("under13")}>I am under 13</Button>
        </div>
      </div>
    </div>
  );
}
