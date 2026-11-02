import { getArtist } from "@/data/mock-data";
import { demoPersonas } from "@/features/demo/demo-personas";
import type { AccountType } from "@/types";

export const CONTACT_BLOCK_MESSAGE =
  "Message not sent. Sharing personal contact information is restricted for protected teen accounts.";
export const CONTACT_REQUEST_MESSAGE =
  "Request not sent. Sharing personal contact information is restricted on protected accounts.";
export const PUBLIC_COPY_BLOCK_MESSAGE = "Don’t put contact details on a public piece.";

const contactPatterns = [
  { kind: "email", pattern: /\b[A-Z0-9._%+-]+\s*(?:@|\bat\b|\(at\))\s*[A-Z0-9.-]+\s*(?:\.|\bdot\b|\(dot\))\s*[A-Z]{2,}\b/i },
  { kind: "email", pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { kind: "phone number", pattern: /(?:\+?\d[\s().-]*){8,}/ },
  { kind: "social handle", pattern: /\b(?:discord|snapchat|instagram|telegram|whatsapp|signal|tiktok)\s*(?:is|:|@)\s*\S+/i },
  { kind: "social handle", pattern: /\b(?:ig|insta|snap|discord)\s*[:@]\s*\S+/i },
  { kind: "social handle", pattern: /(?:instagram\.com|snapchat\.com|t\.me|discord\.gg|wa\.me)\/\S+/i },
] as const;

export interface SafetyEvaluation {
  allowed: boolean;
  reason?: string;
  message?: string;
}

export function accountTypeForParticipant(id: string): AccountType {
  const persona = demoPersonas.find((item) => item.id === id);
  if (persona) return persona.accountType;
  return getArtist(id)?.accountType ?? "adult";
}

export function isProtectedThread(buyerAccountType: AccountType, artistAccountType: AccountType): boolean {
  return buyerAccountType === "protected-teen" || artistAccountType === "protected-teen";
}

export function orderIsProtectedThread(order: { buyerId: string; artistId: string }): boolean {
  return isProtectedThread(accountTypeForParticipant(order.buyerId), accountTypeForParticipant(order.artistId));
}

function loosen(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s*[\[(]?\s*(?:at)\s*[\])]?\s*/gi, "@")
    .replace(/\s*[\[(]?\s*(?:dot)\s*[\])]?\s*/gi, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function scan(text: string): (typeof contactPatterns)[number] | undefined {
  const variants = [text, loosen(text)];
  return contactPatterns.find(({ pattern }) => variants.some((value) => pattern.test(value)));
}

export function evaluateContactSharing(message: string, protectedThread: boolean): SafetyEvaluation {
  if (!protectedThread) return { allowed: true };
  const match = scan(message);
  if (!match) return { allowed: true };
  return { allowed: false, reason: match.kind, message: CONTACT_BLOCK_MESSAGE };
}

export function evaluatePublicCopy(fields: Array<string | undefined>): SafetyEvaluation {
  const match = scan(fields.filter(Boolean).join("\n"));
  if (!match) return { allowed: true };
  return { allowed: false, reason: match.kind, message: PUBLIC_COPY_BLOCK_MESSAGE };
}

export function evaluateContactFields(fields: Array<string | undefined>, protectedThread: boolean): SafetyEvaluation {
  if (!protectedThread) return { allowed: true };
  const match = scan(fields.filter(Boolean).join("\n"));
  if (!match) return { allowed: true };
  return { allowed: false, reason: match.kind, message: CONTACT_REQUEST_MESSAGE };
}
