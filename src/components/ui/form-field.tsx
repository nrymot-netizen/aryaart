import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function FormField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-bold">{label}</span>{hint && <span className="ml-2 text-xs text-black/45">{hint}</span>}<span className="mt-2 block">{children}</span>{error && <span className="mt-1.5 block text-sm font-semibold text-red-600" role="alert">{error}</span>}</label>;
}

const control = "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-plum focus:ring-4 focus:ring-plum/10 disabled:bg-black/[0.03]";
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={`${control} ${className}`} {...props} />; }
export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={`${control} min-h-28 resize-y ${className}`} {...props} />; }
export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={`${control} ${className}`} {...props} />; }
export function Checkbox({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`flex min-h-11 items-center gap-3 text-sm ${className}`}><input type="checkbox" className="size-4 rounded border-black/20 text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum" {...props} />{label}</label>;
}
