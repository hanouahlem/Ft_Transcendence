"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewPostCard } from "@/components/feed/NewPostCard";

type NewPostDialogProps = {
  open: boolean;
  content: string;
	previewUrl: string;
	selectedFileName: string;
	publishing: boolean;
	onClose: () => void;
	onPublish: () => void;
  onContentChange: (value: string) => void;
  onOpenFilePicker: () => void;
  onRemoveFile: () => void;
};

export function NewPostDialog({
  open,
	content,
	previewUrl,
	selectedFileName,
	publishing,
	onClose,
	onPublish,
  onContentChange,
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
            content={content}
            previewUrl={previewUrl}
						selectedFileName={selectedFileName}
						publishing={publishing}
						onPublish={onPublish}
						onContentChange={onContentChange}
						onOpenFilePicker={onOpenFilePicker}
						onRemoveFile={onRemoveFile}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
