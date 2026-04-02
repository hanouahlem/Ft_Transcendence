"use client";

import type { ChangeEvent, RefObject } from "react";
import { Image as ImageIcon, SendHorizonal, X } from "lucide-react";
import type { CurrentUser } from "@/lib/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getInitials } from "@/components/archive/archiveUtils";
import { ArchiveButton } from "@/components/archive/ArchiveButton";

type NewPostModalProps = {
  open: boolean;
  user: CurrentUser | null;
  content: string;
  previewUrl: string;
  selectedFileName: string;
  publishing: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onPublish: () => void;
  onContentChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenFilePicker: () => void;
  onRemoveFile: () => void;
};

export function NewPostModal({
  open,
  user,
  content,
  previewUrl,
  selectedFileName,
  publishing,
  fileInputRef,
  onClose,
  onPublish,
  onContentChange,
  onFileChange,
  onOpenFilePicker,
  onRemoveFile,
}: NewPostModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
      <article
        className="relative max-h-[90vh] w-full max-w-[860px] overflow-auto border border-white/20 bg-white p-0 rotate-1"
        style={{ boxShadow: "10px 16px 34px rgba(26,26,26,0.2)" }}
      >
        <div className="archive-tape absolute left-10 top-0 h-6 w-24 rotate-1 bg-field-accent" />
        <div className="archive-tape absolute right-14 top-1 h-4 w-[4.5rem] -rotate-3 bg-field-accent-blue" />

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-dashed border-black/20 pb-4">
            <div>
              <p className="font-field-mono text-xs text-field-label">
                NEW LOG [ENTRY: PENDING]
              </p>
              <h2 className="mt-2 font-field-display text-4xl font-black tracking-[-0.04em] text-field-ink">
                New Log Entry
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/10 bg-field-paper-muted p-2 text-field-label transition hover:bg-field-paper"
              aria-label="Close new post modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 rounded-none border border-black/20 bg-field-stage p-1 shadow-[2px_4px_0_rgba(26,26,26,0.18)]">
              <AvatarImage
                src={user?.avatar || ""}
                alt={user?.username || "Field User"}
                className="archive-photo object-cover"
              />
              <AvatarFallback className="rounded-none bg-field-stage font-field-display text-sm font-black text-field-ink">
                {getInitials(user?.username || "Field User")}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-4">
                <p className="font-semibold text-field-ink">
                  {user?.username || "Field User"}
                </p>
                <p className="font-field-mono text-[11px] uppercase tracking-[0.16em] text-field-label">
                  @{(user?.username || "observer").toLowerCase()}
                </p>
              </div>

              <div className="archive-paper relative overflow-hidden border border-black/10 bg-white px-4 py-4">
                <div className="archive-thread hidden sm:block" />
                <div className="sm:pl-8">
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-dashed border-black/20 pb-2 font-field-mono text-[10px] text-field-label">
                    <span>OBSERVATION LOG</span>
                    <span>DATE: --/--/----</span>
                  </div>

                  <textarea
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder="What have you observed today?"
                    className="archive-input archive-lines min-h-[180px] w-full resize-none border-0 bg-transparent px-0 py-1 text-lg text-field-ink"
                    style={{ fontFamily: "var(--font-field-display-source)" }}
                  />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />

              {previewUrl && (
                <div className="relative mt-6 w-[92%] rotate-[-2deg] overflow-hidden bg-white p-2 pb-8 shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Selected upload preview"
                    className="archive-photo max-h-[360px] w-full border border-black/10 object-cover"
                  />

                  <p className="absolute bottom-2 right-3 truncate font-field-mono text-[10px] text-field-label">
                    {selectedFileName || "FILM ROLL 42"}
                  </p>

                  <ArchiveButton
                    type="button"
                    variant="stamp"
                    size="sm"
                    onClick={onRemoveFile}
                    className="absolute left-3 top-3"
                  >
                    Remove
                  </ArchiveButton>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
                <button
                  type="button"
                  onClick={onOpenFilePicker}
                  className="inline-flex items-center gap-2 font-field-mono text-xs text-field-label transition-colors hover:text-field-ink"
                >
                  <ImageIcon className="h-4 w-4" />
                  [ ADD SKETCH ]
                </button>

                <ArchiveButton
                  type="button"
                  variant="stamp"
                  onClick={onPublish}
                  disabled={publishing}
                  className="-rotate-2 border-field-accent px-4 py-1 text-sm"
                >
                  <SendHorizonal className="h-4 w-4" />
                  {publishing ? "RECORDING..." : "RECORD ->"}
                </ArchiveButton>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
