"use client";

import { Camera, RefreshCcw, Trash2 } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { Button } from "@/components/ui/button";

type ProfilePhotoUploaderProps = {
  name: string;
  imageUrl?: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
};

export function ProfilePhotoUploader({
  name,
  imageUrl,
  disabled = false,
  onSelect,
  onClear,
}: ProfilePhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onSelect(file);
    event.target.value = "";
  };

  return (
    <div>
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
        05. Visual Capture
      </span>

      <div className="border border-dashed border-label/70 bg-stage/45 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            type="button"
            className="group flex w-full flex-col items-center justify-center gap-3 border border-dashed border-label/70 bg-paper-muted/70 px-4 py-6 transition hover:border-accent-orange hover:bg-paper-muted disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            {imageUrl ? (
              <ProfilePicture
                name={name}
                src={imageUrl}
                alt={`${name} profile picture`}
                size="lg"
                className="h-28 w-28 rotate-[-2deg]"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center border border-dashed border-label/70 bg-paper text-label transition group-hover:text-accent-orange">
                <Camera className="h-9 w-9" />
              </div>
            )}

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                {imageUrl ? "[ Replace Photo ]" : "[ Attach Photo ]"}
              </p>
              <p className="mt-1 text-sm text-label">
                PNG, JPG, WEBP field capture
              </p>
            </div>
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Replace
            </Button>
            <Button
              type="button"
              variant="stamp"
              size="sm"
              className="rounded-none"
              onClick={onClear}
              disabled={disabled || !imageUrl}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
