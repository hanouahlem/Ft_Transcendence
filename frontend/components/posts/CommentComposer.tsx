"use client";

import { forwardRef } from "react";
import { ArchiveButton } from "@/components/archive/ArchiveButton";

type CommentComposerProps = {
  postId: number;
  value: string;
  submitting: boolean;
  onChange: (postId: number, value: string) => void;
  onSubmit: (postId: number) => Promise<void>;
};

export const CommentComposer = forwardRef<
  HTMLTextAreaElement,
  CommentComposerProps
>(function CommentComposer(
  { postId, value, submitting, onChange, onSubmit },
  ref
) {
  return (
    <section className="relative overflow-hidden border border-black/10 bg-field-paper-muted px-4 py-4">
      <div className="archive-thread hidden sm:block" />
      <div className="sm:pl-8">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-dashed border-black/20 pb-2 font-field-mono text-[10px] uppercase tracking-[0.18em] text-field-label">
          <span>Reply Log</span>
          <span>POST #{postId}</span>
        </div>

        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(postId, event.target.value)}
          placeholder="Add a note to this archive..."
          className="archive-input archive-lines min-h-[96px] w-full resize-none border-0 bg-transparent px-0 py-1 text-sm text-field-ink"
        />

        <div className="mt-4 flex justify-end">
          <ArchiveButton
            type="button"
            variant="ink"
            onClick={() => onSubmit(postId)}
            disabled={submitting}
          >
            {submitting ? "Sending" : "Comment"}
          </ArchiveButton>
        </div>
      </div>
    </section>
  );
});
