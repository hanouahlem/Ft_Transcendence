"use client";

import BoringAvatar from "boring-avatars";
import { ARCHIVE_IDENTITY_COLORS } from "@/lib/identity-art";
import { cn } from "@/lib/utils";

type ProfileBannerProps = {
	name: string;
	src?: string | null;
	className?: string;
};

export function ProfileBanner({ name, src, className }: ProfileBannerProps) {
	if (src) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={src}
				alt=""
				aria-hidden="true"
				className={cn("object-cover", className)}
			/>
		);
	}

	return (
		<BoringAvatar
			name={name}
			variant="marble"
			colors={ARCHIVE_IDENTITY_COLORS}
			size={128}
			square
			preserveAspectRatio="xMidYMid slice"
			aria-hidden="true"
			className={className}
		/>
	);
}
