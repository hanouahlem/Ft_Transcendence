"use client";

import { forwardRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
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
	const { t } = useI18n();

	return (
		<SocialComposer
			ref={ref}
			value={value}
			submitting={submitting}
			onChange={(nextValue) => onChange(postId, nextValue)}
			onSubmit={() => onSubmit(postId)}
			placeholder={t("postInteractions.composer.placeholder")}
			label={t("postInteractions.composer.label")}
			submitLabel={
				submitting
					? t("postInteractions.composer.sending")
					: t("postInteractions.composer.submit")
			}
			rows={1}
			textareaClassName="min-h-8"
		/>
	);
});
