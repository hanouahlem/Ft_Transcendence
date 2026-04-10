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
  resetToken?: number;
	previewUrl: string;
	selectedFileName: string;
	publishing: boolean;
	onClose: () => void;
	onPublish: (content: string) => void;
  onOpenFilePicker: () => void;
  onRemoveFile: () => void;
};

export function NewPostDialog({
  open,
	initialContent,
  resetToken,
	previewUrl,
	selectedFileName,
	publishing,
	onClose,
	onPublish,
  onOpenFilePicker,
  onRemoveFile,
}: NewPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="overflow-visible p-0">
				<DialogTitle className="sr-only">Create a new post</DialogTitle>
				<DialogDescription className="sr-only">
					Compose a new feed post in the archive composer.
				</DialogDescription>

        <div className="max-h-[90vh] overflow-auto px-4 py-8">
          <NewPostCard
            key={resetToken}
            initialContent={initialContent}
            previewUrl={previewUrl}
						selectedFileName={selectedFileName}
						publishing={publishing}
						onPublish={onPublish}
						onOpenFilePicker={onOpenFilePicker}
						onRemoveFile={onRemoveFile}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
