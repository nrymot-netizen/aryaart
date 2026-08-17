import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black disabled:bg-black/20",
  secondary: "bg-mist text-plum hover:bg-[#e7e0f5] disabled:text-black/30",
  ghost: "border border-black/10 bg-white text-ink hover:bg-black/[0.03] disabled:text-black/30",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 disabled:text-black/30",
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props} />;
}
