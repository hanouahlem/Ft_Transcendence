"use client";

import { forwardRef } from "react";
import { SocialComposer } from "@/components/ui/SocialComposer";

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
		<SocialComposer
			ref={ref}
			value={value}
			submitting={submitting}
			onChange={(nextValue) => onChange(postId, nextValue)}
			onSubmit={() => onSubmit(postId)}
			placeholder="Add a comment..."
			label="Add a comment to this post"
			submitLabel={submitting ? "Sending comment" : "Submit comment"}
			rows={1}
			textareaClassName="min-h-8"
		/>
	);
});
