"use client";

import { Format } from "@ark-ui/react/format";
import { formatFeedTime } from "@/components/feed/feedUtils";

type RelativeTimeProps = {
	dateString: string;
	className?: string;
};

export function RelativeTime({ dateString, className }: RelativeTimeProps) {
	const date = new Date(dateString);

	return (
		<time
			dateTime={date.toISOString()}
			title={formatFeedTime(dateString)}
			className={className}
		>
			<Format.RelativeTime value={date} numeric="auto" style="short" />
		</time>
	);
}
