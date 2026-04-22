"use client";

import { Progress } from "@ark-ui/react/progress";
import { FileUpload, useFileUpload } from "@ark-ui/react/file-upload";
import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  ImageAdd02Icon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const MAX_POST_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ACCEPTED_POST_FILE_TYPES = ["image/*", "application/pdf"] as const;

function getRejectedFileMessage(error: string) {
  if (error === "TOO_MANY_FILES") {
    return "Only one attachment is allowed.";
  }

  if (error === "FILE_TOO_LARGE") {
    return "Files must be 10 MB or smaller.";
  }

  if (error === "FILE_INVALID_TYPE") {
    return "Only image and PDF files are allowed.";
  }

  return "Unable to attach that file.";
}

type NewPostCardProps = {
  initialContent?: string;
  publishing: boolean;
  onPublish: (content: string, file: File | null) => Promise<void>;
};

export function NewPostCard({
  initialContent = "",
  publishing,
  onPublish,
}: NewPostCardProps) {
  const [content, setContent] = useState(initialContent);
  const { t } = useI18n();
  const { notifyError } = useArchiveToasts();
  const fileUpload = useFileUpload({
    maxFiles: 1,
    accept: [...ACCEPTED_POST_FILE_TYPES],
    maxFileSize: MAX_POST_ATTACHMENT_SIZE,
    disabled: publishing,
    onFileReject: ({ files }) => {
      const firstRejection = files[0];
      const firstError = firstRejection?.errors[0];

      if (!firstError) {
        return;
      }

      notifyError(getRejectedFileMessage(firstError));
      fileUpload.clearRejectedFiles();
    },
  });

  const selectedFile = fileUpload.acceptedFiles[0] ?? null;
  const isPdf = selectedFile?.type === "application/pdf";
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile || isPdf) {
      setImagePreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setImagePreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [isPdf, selectedFile]);

  const previewLabel = (() => {
    if (!selectedFile) {
      return t("newPostCard.filmRoll");
    }

    if (isPdf) {
      return "FIELD DOSSIER";
    }

    return selectedFile.name || t("newPostCard.filmRoll");
  })();

  const handlePublish = async () => {
    try {
      await onPublish(content, selectedFile);
      setContent("");
      fileUpload.clearFiles();
    } catch {
      // The shared mutation hook already handles user-facing errors.
    }
  };

  return (
    <FileUpload.RootProvider value={fileUpload}>
      <FileUpload.Dropzone asChild disableClick>
        <section
          className={cn(
            "relative border border-white/20 bg-white p-6 pb-6 rotate-1 transition",
            publishing && "cursor-progress",
          )}
          style={{ boxShadow: "8px 12px 30px rgba(26,26,26,0.12)" }}
        >
          <div className="archive-tape absolute -top-3 left-8 h-6 w-24 rotate-1 bg-accent-red" />
          <div className="archive-thread" />

          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-ink/75 px-8 text-center opacity-0 transition",
              fileUpload.dragging && "opacity-100",
            )}
          >
            <div className="space-y-3 border border-dashed border-paper/60 bg-paper/10 px-8 py-6">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-paper">
                Drop Attachment Here
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/75">
                One file only: image or PDF, max 10 MB
              </p>
            </div>
          </div>

          <div className="pl-10">
            <div className="mb-4 flex justify-between gap-3 border-b border-dashed border-label/30 pb-2 font-mono text-xs text-label">
              <span>{t("newPostCard.title")}</span>
              <span>{t("newPostCard.date")}</span>
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("newPostCard.placeholder")}
              disabled={publishing}
              className="archive-input archive-lines min-h-[114px] w-full resize-none border-0 bg-transparent px-0 py-0 text-3xl leading-7 text-ink disabled:cursor-not-allowed disabled:opacity-70"
              style={{ fontFamily: "var(--font-display)" }}
            />

            {selectedFile ? (
              <FileUpload.ItemGroup className="mt-6">
                <FileUpload.Item file={selectedFile} className="block">
                  <div className="relative w-[25%] min-w-[220px] rotate-[-2deg] bg-white p-2 pb-8 shadow-lg">
                    {publishing ? (
                      <div className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-paper/90 shadow-[0_8px_18px_rgba(26,26,26,0.15)]">
                        <Progress.Root
                          value={null}
                          className="h-10 w-10"
                          aria-label="Uploading attachment"
                        >
                          <Progress.Circle className="h-10 w-10 text-accent-red">
                            <Progress.CircleTrack className="stroke-label/20" strokeWidth="10" />
                            <Progress.CircleRange className="stroke-current" strokeWidth="10" />
                          </Progress.Circle>
                        </Progress.Root>
                      </div>
                    ) : null}

                    {!isPdf && imagePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreviewUrl}
                        alt="Selected upload preview"
                        className="archive-photo max-h-30 w-full border border-label/20 object-cover"
                      />
                    ) : null}

                    <FileUpload.ItemPreview type="application/pdf">
                      <div className="flex min-h-[100px] flex-col justify-between border border-label/20 bg-paper-muted px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-label/25 bg-paper">
                            <HugeiconsIcon icon={Pdf01Icon} size={22} strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <FileUpload.ItemName className="block truncate font-display text-base text-ink" />
                            <FileUpload.ItemSizeText className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-label" />
                          </div>
                        </div>

                        <div className="mt-4 border-t border-dashed border-label/20 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                          PDF Attachment
                        </div>
                      </div>
                    </FileUpload.ItemPreview>

                    <div className="absolute bottom-2 right-3 max-w-[calc(100%-1.5rem)] truncate text-right font-mono text-[10px] text-label">
                      {previewLabel}
                    </div>
                    <Button
                      type="button"
                      variant="redsh"
                      size="sm"
                      onClick={() => fileUpload.clearFiles()}
                      className="absolute -left-3 -top-3 z-10 py-1 px-2 rounded-2xl"
                      disabled={publishing}
                      aria-label="Remove attachment"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.9} />
                    </Button>
                  </div>
                </FileUpload.Item>
              </FileUpload.ItemGroup>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
              <FileUpload.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 font-mono text-xs text-label transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={publishing}
                >
                  <HugeiconsIcon icon={ImageAdd02Icon} size={16} strokeWidth={1.9} />
                  {t("newPostCard.addFile")}
                </button>
              </FileUpload.Trigger>
              <Button
                type="button"
                variant="stamp"
                onClick={handlePublish}
                disabled={publishing}
                className="-rotate-2 border-accent-red px-4 py-1 text-sm"
              >
                {publishing ? t("newPostCard.recording") : t("newPostCard.record")}
              </Button>
            </div>
          </div>

          <FileUpload.HiddenInput />
        </section>
      </FileUpload.Dropzone>
    </FileUpload.RootProvider>
  );
}
