import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export function ProtectedAccountNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`rounded-3xl bg-mist text-black/65 ${compact ? "p-3 text-xs" : "p-5 text-sm leading-6"}`}><div className="flex items-start gap-3"><ShieldCheck size={compact ? 18 : 23} weight="fill" className="mt-0.5 shrink-0 text-plum" /><div><strong className="block text-ink">Protected teen account</strong>{!compact && <span>Project communication stays inside Arya. Personal contact information is restricted, and parent support may be required for commission actions.</span>}</div></div></div>;
}
