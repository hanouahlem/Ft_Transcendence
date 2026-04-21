import { Field } from "@ark-ui/react/field";
import { PasswordInput } from "@ark-ui/react/password-input";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type FieldInputProps = {
  type: "text" | "email" | "password";
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  action?: ReactNode;
  errorText?: string;
  className?: string;
  inputClassName?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "required" | "className"
>;

export default function FieldInput({
  id,
  type,
  label,
  value,
  onChange,
  required,
  action,
  errorText,
  className,
  inputClassName,
  ...inputProps
}: FieldInputProps) {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const invalid = Boolean(errorText);
  const topRight = invalid ? (
    <Field.ErrorText className="bg-paper px-1 text-end font-mono text-[10px] uppercase tracking-[0.12em] text-accent-red">
      {errorText}
    </Field.ErrorText>
  ) : (
    action
  );

  return (
    <Field.Root
      invalid={invalid}
      className={cn("relative", className)}
      ids={{
        root: `${inputId}-field`,
        control: inputId,
        label: `${inputId}-label`,
        errorText: `${inputId}-error`,
      }}
    >
      <div className="absolute -top-3 z-10 flex items-center justify-between" style={{ insetInlineStart: "0.25rem", insetInlineEnd: "0.25rem" }}>
        <Field.Label
          className={cn(
            "bg-paper px-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
            invalid
              ? "text-accent-red"
              : focused
                ? "text-accent-red"
                : "text-label",
          )}
        >
          {label}
        </Field.Label>
        {topRight}
      </div>

      <div
        className={cn(
          "border bg-white/40 p-2 transition-colors",
          invalid
            ? "border-accent-red/50"
            : focused
              ? "border-accent-red/50"
              : "border-label/30",
        )}
      >
        {type === "password" ? (
          <PasswordInput.Root>
            <div className="relative">
              <PasswordInput.Input
                id={inputId}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required={required}
                {...inputProps}
                className={cn(
                  "archive-input w-full border-0 border-b-2 border-dotted border-label bg-transparent px-1 pt-3 pb-1 font-mono text-lg text-ink tracking-[0.1em] transition-colors placeholder:text-label/40 focus:border-accent-red focus:bg-accent-red/[0.02]",
                  invalid &&
                  "border-accent-red placeholder:text-accent-red/45 focus:border-accent-red focus:bg-accent-red/[0.02]",
                  inputClassName,
                )}
                style={{ paddingInlineEnd: "4.5rem" }}
              />
              <PasswordInput.VisibilityTrigger
                type="button"
                className="absolute top-1/2 -translate-y-1/2 bg-paper px-1 text-accent-red hover:text-ink"
                style={{ insetInlineEnd: 0 }}
              >
                <PasswordInput.Indicator
                  fallback={<HugeiconsIcon icon={ViewOffIcon} size={16} strokeWidth={1.9} />}
                >
                  <HugeiconsIcon icon={ViewIcon} size={16} strokeWidth={1.9} />
                </PasswordInput.Indicator>
              </PasswordInput.VisibilityTrigger>
            </div>
          </PasswordInput.Root>
        ) : (
          <Field.Input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required={required}
            {...inputProps}
            className={cn(
              "archive-input w-full border-0 border-b-2 border-dotted border-label bg-transparent px-1 pt-3 pb-1 font-mono text-lg text-ink transition-colors placeholder:text-label/40 focus:border-accent-red focus:bg-accent-red/[0.02]",
              invalid &&
              "border-accent-red placeholder:text-accent-red/45 focus:border-accent-red focus:bg-accent-red/[0.02]",
              inputClassName,
            )}
          />
        )}
      </div>
    </Field.Root>
  );
}
