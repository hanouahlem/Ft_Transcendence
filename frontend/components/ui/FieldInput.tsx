import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldInputProps = {
  type: "text" | "email" | "password";
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  action?: ReactNode;
  className?: string;
  inputClassName?: string;
};

export default function FieldInput({
  type,
  label,
  placeholder,
  value,
  onChange,
  required,
  action,
  className,
  inputClassName,
}: FieldInputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  return (
    <div className={cn("relative", className)}>
      <div className="absolute -top-3 left-1 right-1 z-10 flex items-center justify-between">
        <label
          htmlFor={inputId}
          className={cn(
            "bg-paper px-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
            focused ? "text-accent-orange" : "text-label",
          )}
        >
          {label}
        </label>
        {action}
      </div>

      <div
        className={cn(
          "border bg-white/40 p-2 transition-colors",
          focused ? "border-accent-orange/50" : "border-label/30",
        )}
      >
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className={cn(
            "archive-input w-full border-0 border-b-2 border-dotted border-label bg-transparent px-1 pt-3 pb-1 font-mono text-lg text-ink transition-colors placeholder:text-label/40 focus:border-accent-orange focus:bg-accent-orange/[0.02]",
            type === "password" && "tracking-[0.1em]",
            inputClassName,
          )}
        />
      </div>
    </div>
  );
}
