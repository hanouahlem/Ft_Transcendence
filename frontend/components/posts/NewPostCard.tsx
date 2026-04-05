"use client";

import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type NewPostCardProps = {
	content: string;
	previewUrl: string;
	selectedFileName: string;
	publishing: boolean;
	onPublish: () => void;
	onContentChange: (value: string) => void;
	onOpenFilePicker: () => void;
	onRemoveFile: () => void;
};

export function NewPostCard({
	content,
	previewUrl,
	selectedFileName,
	publishing,
	onPublish,
	onContentChange,
	onOpenFilePicker,
	onRemoveFile,
}: NewPostCardProps) {
	return (
		<section
			className="relative border border-white/20 bg-white p-6 pb-6 rotate-1"
			style={{ boxShadow: "8px 12px 30px rgba(26,26,26,0.12)" }}
		>
			<div className="archive-tape absolute -top-3 left-8 h-6 w-24 rotate-1 bg-field-accent" />
			<div className="archive-thread" />

			<div className="pl-10">
				<div className="mb-4 flex justify-between gap-3 border-b border-dashed border-field-label/30 pb-2 font-mono text-xs text-field-label">
					<span>NEW LOG [ENTRY: PENDING]</span>
					<span>DATE: --/--/----</span>
				</div>

				<textarea
					value={content}
					onChange={(event) => onContentChange(event.target.value)}
					placeholder="What have you observed today?"
					className="archive-input archive-lines min-h-[140px] w-full resize-none border-0 bg-transparent px-0 py-0 text-lg leading-7 text-field-ink"
					style={{ fontFamily: "var(--font-display)" }}
				/>

				{previewUrl ? (
					<div className="relative mt-6 w-[25%] rotate-[-2deg] bg-white p-2 pb-8 shadow-lg">
						<img
							src={previewUrl}
							alt="Selected upload preview"
							className="archive-photo max-h-[420px] w-full border border-field-label/20 object-cover"
						/>
						<div className="absolute bottom-2 right-3 font-mono text-[10px] text-field-label">
							{selectedFileName || "FILM ROLL 42"}
						</div>
						<Button
							type="button"
							variant="stamp"
							size="sm"
							onClick={onRemoveFile}
							className="absolute left-3 top-3"
						>
							Remove
						</Button>
					</div>
				) : null}

				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
					<button
						type="button"
						onClick={onOpenFilePicker}
						className="inline-flex items-center gap-2 font-mono text-xs text-field-label transition-colors hover:text-field-ink"
					>
						<ImageIcon className="h-4 w-4" />[ ADD SKETCH ]
					</button>
					<Button
						type="button"
						variant="stamp"
						onClick={onPublish}
						disabled={publishing}
						className="-rotate-2 border-field-accent px-4 py-1 text-sm"
					>
						{publishing ? "RECORDING..." : "RECORD ->"}
					</Button>
				</div>
			</div>
		</section>
	);
}
