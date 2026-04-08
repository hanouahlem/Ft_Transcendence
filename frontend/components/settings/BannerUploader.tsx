"use client";

import { Trash2, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { NatureCanvas } from "@/components/layout/NatureCanvas";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { Button } from "@/components/ui/button";

type BannerUploaderProps = {
  name: string;
  imageUrl?: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
};

function ArchiveStar() {
  return (
    <svg
      viewBox="0 0 50 50"
      className="h-full w-full fill-none stroke-accent-orange"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
      <line x1="15" y1="15" x2="35" y2="35" />
      <line x1="15" y1="35" x2="35" y2="15" />
    </svg>
  );
}

export function BannerUploader({
  name,
  imageUrl,
  disabled = false,
  onSelect,
  onClear,
}: BannerUploaderProps) {
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
    <div className="relative">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
        06. Archive Banner
      </span>

      <div className="relative border border-black/15 bg-[#f5f2eb]">
        {!imageUrl ? <NatureCanvas embedded className="opacity-55" /> : null}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(26,26,26,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative h-64 overflow-hidden">
          {imageUrl ? (
            <ProfileBanner
              name={name}
              src={imageUrl}
              className="archive-photo h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-transparent px-6 text-center font-mono text-xs uppercase tracking-[0.14em] text-label/65">
              Initialize banner sketch or upload a new archive plate
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-none bg-paper/90"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-label="Replace banner"
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
              aria-label="Clear banner"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-label">
          <div className="h-4 w-4 opacity-60">
            <ArchiveStar />
          </div>
          Decorative archive header
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
