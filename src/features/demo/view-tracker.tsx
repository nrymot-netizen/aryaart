"use client";

import { useEffect } from "react";
import { useDemo } from "@/features/demo/demo-provider";

export function ViewTracker({
  name,
  payload,
}: {
  name: string;
  payload?: Record<string, string | number | boolean>;
}) {
  const { dispatch, hydrated } = useDemo();
  const serialized = JSON.stringify(payload ?? {});
  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: "track-event", name, payload: serialized === "{}" ? undefined : JSON.parse(serialized) });
  }, [dispatch, hydrated, name, serialized]);
  return null;
}
