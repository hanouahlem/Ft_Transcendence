"use client";

import { Camera, Trash2, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
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

      <div className="flex flex-col items-start gap-3">
        <div className="relative w-full max-w-[220px]">
          <button
            type="button"
            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden border border-dashed border-label bg-stage transition hover:border-accent-orange disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${name} profile picture`}
                  className="archive-photo h-full w-full object-cover"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 text-center text-label transition group-hover:text-accent-orange">
                <Camera className="h-6 w-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                  [ Attach Photo ]
                </span>
              </div>
            )}
          </button>

          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-none bg-paper/90"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-label="Replace profile photo"
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-none bg-paper/90"
              onClick={onClear}
              disabled={disabled || !imageUrl}
              aria-label="Clear profile photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
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
