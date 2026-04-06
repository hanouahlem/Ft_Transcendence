"use client";

import BoringAvatar from "boring-avatars";
import * as React from "react";
import { Avatar as AvatarPrimitive } from "@ark-ui/react/avatar";
import { ARCHIVE_IDENTITY_COLORS } from "@/lib/identity-art";
import { cn } from "@/lib/utils";

type AvatarSize = "default" | "sm" | "lg";

type ArchiveAvatarContextValue = {
  name?: string;
};

const ArchiveAvatarContext = React.createContext<ArchiveAvatarContextValue>({});

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize;
  name?: string;
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "default", name, ...props }, ref) => {
    return (
      <ArchiveAvatarContext.Provider value={{ name }}>
        <AvatarPrimitive.Root
          ref={ref}
          data-slot="avatar"
          data-size={size}
          className={cn(
            "group/avatar relative flex size-8 shrink-0 select-none overflow-hidden rounded-full after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
            className,
          )}
          {...props}
        />
      </ArchiveAvatarContext.Provider>
    );
  },
);

Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => {
  const normalizedSrc =
    typeof props.src === "string" && props.src.trim() === ""
      ? undefined
      : props.src;

  if (!normalizedSrc) {
    return null;
  }

  return (
    <AvatarPrimitive.Image
      ref={ref}
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-[inherit] object-cover",
        className,
      )}
      {...props}
      src={normalizedSrc}
    />
  );
});

AvatarImage.displayName = "AvatarImage";

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  name?: string;
};

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, name, ...props }, ref) => {
    const context = React.useContext(ArchiveAvatarContext);
    const fallbackSeed =
      name ??
      context.name ??
      (typeof children === "string" ? children : "Archive avatar");

    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
          "relative flex size-full items-center justify-center overflow-hidden rounded-[inherit] bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
          className,
        )}
        {...props}
      >
        <BoringAvatar
          name={fallbackSeed}
          variant="beam"
          colors={ARCHIVE_IDENTITY_COLORS}
          size="100%"
          square
          className="size-full"
          aria-hidden="true"
        />
        {children ? <span className="sr-only">{children}</span> : null}
      </AvatarPrimitive.Fallback>
    );
  },
);

AvatarFallback.displayName = "AvatarFallback";

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
