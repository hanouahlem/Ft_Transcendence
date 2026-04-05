"use client";

import { Format } from "@ark-ui/react/format";
import { formatFeedTime } from "@/lib/feed-utils";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

type RelativeTimeProps = {
	dateString: string;
	className?: string;
};

export function RelativeTime({ dateString, className }: RelativeTimeProps) {
	const date = new Date(dateString);
	const absoluteTime = formatFeedTime(dateString);

	return (
		<Tooltip content={absoluteTime}>
			<time
				dateTime={date.toISOString()}
				className={cn(
					"inline-flex items-center bg-field-stage px-1.5 py-0.5",
					className,
				)}
			>
				<Format.RelativeTime
					value={date}
					numeric="auto"
					style="short"
				/>
			</time>
		</Tooltip>
	);
}
