"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewPostCard } from "@/components/posts/NewPostCard";

type NewPostDialogProps = {
  open: boolean;
  initialContent?: string;
  publishing: boolean;
  onClose: () => void;
  onPublish: (content: string, file: File | null) => Promise<void>;
};

export function NewPostDialog({
  open,
  initialContent,
  publishing,
  onClose,
  onPublish,
}: NewPostDialogProps) {
  return (
    <Dialog
      open={open}
      lazyMount={false}
      unmountOnExit={false}
      closeOnEscape={!publishing}
      closeOnInteractOutside={!publishing}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !publishing) {
          onClose();
        }
      }}
    >
      <DialogContent className="overflow-visible p-0">
        <DialogTitle className="sr-only">Create a new post</DialogTitle>
        <DialogDescription className="sr-only">
          Compose a new feed post in the archive composer.
        </DialogDescription>

        <div className="max-h-[90vh] overflow-auto px-4 py-8">
          <NewPostCard
            initialContent={initialContent}
            publishing={publishing}
            onPublish={onPublish}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
