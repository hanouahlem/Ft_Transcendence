"use client";

import { Camera } from "lucide-react";
import {
  Delete02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileUpload, useFileUpload } from "@ark-ui/react/file-upload";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const fileUpload = useFileUpload({
    maxFiles: 1,
    accept: ["image/*"],
    disabled,
  });
  const acceptedFile = fileUpload.acceptedFiles[0];

  useEffect(() => {
    if (!acceptedFile) {
      return;
    }

    onSelect(acceptedFile);
    fileUpload.clearFiles();
  }, [acceptedFile, fileUpload, onSelect]);

  return (
    <FileUpload.RootProvider value={fileUpload}>
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
        05. Visual Capture
      </span>

      <div className="flex flex-col items-start gap-3">
        <div className="relative w-full max-w-[220px]">
          <FileUpload.Dropzone
            disableClick
            className={cn(
              "group relative flex aspect-square w-full items-center justify-center overflow-hidden border border-dashed border-label bg-stage transition",
              "hover:border-accent-orange",
              disabled && "cursor-not-allowed opacity-60",
              fileUpload.dragging && "border-accent-orange bg-paper-muted",
            )}
            onClick={() => {
              if (!disabled) {
                fileUpload.openFilePicker();
              }
            }}
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
          </FileUpload.Dropzone>

          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-none bg-paper/90"
              onClick={(event) => {
                event.stopPropagation();
                if (!disabled) {
                  fileUpload.openFilePicker();
                }
              }}
              disabled={disabled}
              aria-label="Replace profile photo"
            >
              <HugeiconsIcon icon={Upload01Icon} size={14} strokeWidth={1.9} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-none bg-paper/90"
              onClick={(event) => {
                event.stopPropagation();
                fileUpload.clearFiles();
                onClear();
              }}
              disabled={disabled || !imageUrl}
              aria-label="Clear profile photo"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.9} />
            </Button>
          </div>
        </div>
      </div>

      <FileUpload.HiddenInput />
    </FileUpload.RootProvider>
  );
}
