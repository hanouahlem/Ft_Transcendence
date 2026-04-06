"use client";

import BoringAvatar from "boring-avatars";
import { ARCHIVE_IDENTITY_COLORS } from "@/lib/identity-art";

type ProfileBannerProps = {
	name: string;
	className?: string;
};

export function ProfileBanner({ name, className }: ProfileBannerProps) {
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
