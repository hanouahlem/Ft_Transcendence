"use client";

import * as React from "react";
import Link from "next/link";
import { HoverCard as ArkHoverCard } from "@ark-ui/react/hover-card";
import { Portal } from "@ark-ui/react/portal";
import { UserPreviewCard } from "@/components/users/UserPreviewCard";
import {
  getUserById,
  getUserFriends,
  getUserPosts,
} from "@/lib/api";
import { buildProfileHref } from "@/lib/user-preview";
import type { UserPreviewIdentity } from "@/lib/user-preview";
import { cn } from "@/lib/utils";

type UserIdentityLinkProps = {
  user: UserPreviewIdentity;
  children: React.ReactNode;
  className?: string;
  hoverCard?: boolean;
  contentClassName?: string;
  openDelay?: number;
  closeDelay?: number;
  positioning?: React.ComponentProps<typeof ArkHoverCard.Root>["positioning"];
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const userPreviewCache = new Map<number, UserPreviewIdentity>();
const userPreviewRequests = new Map<number, Promise<UserPreviewIdentity | null>>();
const enrichedUserPreviewIds = new Set<number>();

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

function mergeUserPreview(
  current: UserPreviewIdentity,
  incoming: Partial<UserPreviewIdentity>,
): UserPreviewIdentity {
  const next = { ...current };

  (
    Object.keys(incoming) as Array<keyof UserPreviewIdentity>
  ).forEach((key) => {
    const value = incoming[key];

    if (value !== undefined && value !== null) {
      next[key] = value;
    }
  });

  return next;
}

async function loadUserPreview(
  user: UserPreviewIdentity,
  token: string,
) {
  const existingRequest = userPreviewRequests.get(user.id);

  if (existingRequest) {
    return existingRequest;
  }

  const request = Promise.all([
    getUserById(user.id, token),
    getUserFriends(user.id, token),
    getUserPosts(user.id, token),
  ])
    .then(([profileResult, friendsResult, postsResult]) => {
      if (!profileResult.ok) {
        return null;
      }

      const totalLikes =
        postsResult.ok
          ? postsResult.data.reduce((sum, post) => sum + post.likesCount, 0)
          : user.totalLikes ?? 0;
      const totalComments =
        postsResult.ok
          ? postsResult.data.reduce((sum, post) => sum + post.commentsCount, 0)
          : user.totalComments ?? 0;

      const enrichedUser = mergeUserPreview(user, {
        ...profileResult.data,
        friendCount:
          friendsResult.ok ? friendsResult.data.length : user.friendCount ?? 0,
        postCount:
          postsResult.ok ? postsResult.data.length : user.postCount ?? 0,
        totalLikes,
        totalComments,
      });

      userPreviewCache.set(user.id, enrichedUser);
      enrichedUserPreviewIds.add(user.id);
      return enrichedUser;
    })
    .finally(() => {
      userPreviewRequests.delete(user.id);
    });

  userPreviewRequests.set(user.id, request);
  return request;
}

export function UserIdentityLink({
  user,
  children,
  className,
  hoverCard = true,
  contentClassName,
  openDelay = 250,
  closeDelay = 120,
  positioning,
  onClick,
}: UserIdentityLinkProps) {
  const href = buildProfileHref(user.username);
  const pointerIntentRef = React.useRef(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUser, setPreviewUser] = React.useState<UserPreviewIdentity>(() => {
    const cachedUser = userPreviewCache.get(user.id);
    return cachedUser ? mergeUserPreview(cachedUser, user) : user;
  });

  React.useEffect(() => {
    const cachedUser = userPreviewCache.get(user.id);
    const nextPreviewUser = cachedUser ? mergeUserPreview(cachedUser, user) : user;
    userPreviewCache.set(user.id, nextPreviewUser);
    setPreviewUser(nextPreviewUser);
  }, [user]);

  const handleOpenChange = React.useCallback(
    (details: { open: boolean }) => {
      if (!details.open) {
        pointerIntentRef.current = false;
        setIsOpen(false);
        return;
      }

      if (!pointerIntentRef.current) {
        return;
      }

      setIsOpen(true);

      const cachedUser = userPreviewCache.get(user.id);
      if (cachedUser) {
        setPreviewUser((currentPreviewUser) =>
          mergeUserPreview(currentPreviewUser, cachedUser),
        );
      }

      const token = getStoredToken();
      if (!token || enrichedUserPreviewIds.has(user.id)) {
        return;
      }

      void loadUserPreview(user, token).then((nextPreviewUser) => {
        if (!nextPreviewUser) {
          return;
        }

        setPreviewUser((currentPreviewUser) =>
          mergeUserPreview(currentPreviewUser, nextPreviewUser),
        );
      });
    },
    [user],
  );

  const trigger = (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      onPointerEnter={() => {
        pointerIntentRef.current = true;
      }}
      onPointerLeave={() => {
        pointerIntentRef.current = false;
      }}
    >
      {children}
    </Link>
  );

  if (!hoverCard) {
    return trigger;
  }

  return (
    <ArkHoverCard.Root
      open={isOpen}
      openDelay={openDelay}
      closeDelay={closeDelay}
      lazyMount
      unmountOnExit
      onOpenChange={handleOpenChange}
      positioning={{
        placement: "bottom-start",
        gutter: 12,
        ...positioning,
      }}
    >
      <ArkHoverCard.Trigger asChild>{trigger}</ArkHoverCard.Trigger>
      <Portal>
        <ArkHoverCard.Positioner className="fixed z-[2147483647] pointer-events-none">
          <ArkHoverCard.Content
            className={cn(
              "relative z-[2147483647] pointer-events-auto outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
              contentClassName,
            )}
          >
            <Link href={href} onClick={onClick} className="block">
              <UserPreviewCard user={previewUser} />
            </Link>
          </ArkHoverCard.Content>
        </ArkHoverCard.Positioner>
      </Portal>
    </ArkHoverCard.Root>
  );
}
