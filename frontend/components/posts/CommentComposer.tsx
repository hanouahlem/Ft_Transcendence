"use client";

import { forwardRef } from "react";
import { Field } from "@ark-ui/react/field";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
	ref,
) {
	return (
		<section className="relative overflow-hidden border border-black/10 bg-field-paper-muted px-3 py-3">
			<div className="archive-thread hidden sm:block" />
			<div className="flex items-end gap-3 sm:pl-8">
				<Field.Root className="flex-1">
					<Field.Label className="sr-only">
						Add a comment to this post
					</Field.Label>
					<Field.Textarea
						ref={ref}
						autoresize
						value={value}
						onChange={(event) =>
							onChange(postId, event.target.value)
						}
						placeholder="Add a comment..."
						className="archive-input archive-lines min-h-11 w-full resize-none border-0 bg-transparent p-0 text-sm leading-6 text-field-ink"
					/>
				</Field.Root>

				<div className="shrink-0">
					<Button
						type="button"
						variant="bluesh"
						onClick={() => onSubmit(postId)}
						disabled={submitting}
						aria-label={
							submitting ? "Sending comment" : "Submit comment"
						}
					>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</section>
	);
});
