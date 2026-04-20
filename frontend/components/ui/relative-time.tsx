"use client";

import { formatFeedTime } from "@/lib/feed-utils";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/I18nProvider";

type RelativeTimeProps = {
	dateString: string;
	className?: string;
};

function formatRelativeTimeValue(date: Date, locale: string) {
	const now = Date.now();
	const diffMs = date.getTime() - now;
	const absMs = Math.abs(diffMs);

	const units = [
		{ unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
		{ unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
		{ unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
		{ unit: "day", ms: 1000 * 60 * 60 * 24 },
		{ unit: "hour", ms: 1000 * 60 * 60 },
		{ unit: "minute", ms: 1000 * 60 },
		{ unit: "second", ms: 1000 },
	] as const;

	for (const { unit, ms } of units) {
		if (absMs >= ms || unit === "second") {
			const value = Math.round(diffMs / ms);
			return new Intl.RelativeTimeFormat(locale, {
				numeric: "auto",
				style: "short",
			}).format(value, unit);
		}
	}

	return "";
}

export function RelativeTime({ dateString, className }: RelativeTimeProps) {
	const date = new Date(dateString);
	const { locale } = useI18n();
	const absoluteTime = formatFeedTime(dateString, locale);
	const relativeTime = formatRelativeTimeValue(date, locale);

	return (
		<Tooltip content={absoluteTime}>
			<time
				dateTime={date.toISOString()}
				className={cn(
					"inline-flex items-center bg-stage px-1.5 py-0.5",
					className,
				)}
			>
				{relativeTime}
			</time>
		</Tooltip>
	);
}
