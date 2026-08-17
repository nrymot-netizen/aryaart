const contactPatterns = [
  { kind: "email", pattern: /\b[A-Z0-9._%+-]+\s*(?:@|\bat\b)\s*[A-Z0-9.-]+\s*(?:\.|\bdot\b)\s*[A-Z]{2,}\b/i },
  { kind: "phone number", pattern: /(?:\+?\d[\s().-]*){8,}/ },
  { kind: "social handle", pattern: /\b(?:discord|snapchat|instagram|telegram|whatsapp)\s*(?:is|:|@)\s*\S+/i },
] as const;

export interface SafetyEvaluation {
  allowed: boolean;
  reason?: string;
  message?: string;
}

export function evaluateContactSharing(message: string, protectedAccount: boolean): SafetyEvaluation {
  if (!protectedAccount) return { allowed: true };
  const match = contactPatterns.find(({ pattern }) => pattern.test(message));
  if (!match) return { allowed: true };
  return {
    allowed: false,
    reason: match.kind,
    message: "Message not sent. Sharing personal contact information is restricted for protected teen accounts.",
  };
}
