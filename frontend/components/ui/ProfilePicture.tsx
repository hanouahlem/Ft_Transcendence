"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ProfilePictureProps = {
  name: string;
  src?: string | null;
  alt?: string;
  size?: "default" | "sm" | "lg";
  withShadow?: boolean;
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function ProfilePicture({
  name,
  src,
  alt,
  size = "default",
  withShadow = true,
  className,
  frameClassName,
  imageClassName,
  fallbackClassName,
}: ProfilePictureProps) {
  return (
    <Avatar
      name={name}
      size={size}
      className={cn(
        "overflow-hidden rounded-none bg-paper p-0.5",
        withShadow && "shadow-[0_4px_12px_rgba(26,26,26,0.12)]",
        frameClassName,
        className,
      )}
    >
      <AvatarImage
        src={src ?? undefined}
        alt={alt ?? name}
        className={cn("object-cover", imageClassName)} //jai enleve la classe archive-photo
      />
      <AvatarFallback
        name={name}
        className={cn(
          "rounded-none bg-stage",
          fallbackClassName,
        )}
      />
    </Avatar>
  );
}
