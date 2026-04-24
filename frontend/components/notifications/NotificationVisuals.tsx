"use client";

import {
  AtIcon,
  Bookmark02Icon,
  Comment01Icon,
  FavouriteIcon,
  HeartbreakIcon,
  MessageMultiple01Icon,
  UserAdd01Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function getNotificationTone(type: string) {
  switch (type) {
    case "FOLLOW":
      return {
        iconWrap:
          "border-accent-blue/20 bg-accent-blue/100 text-paper shadow-[3px_4px_0_rgba(58,105,138,0.18)] rotate-2",
        tapeTone: "accent-blue" as const,
        tapeClass: "-top-3 right-8 h-4 w-16 -rotate-3",
        helperClass: "text-accent-blue",
      };
    case "FOLLOW_ACCEPT":
      return {
        iconWrap:
          "border-accent-green/20 bg-accent-green/100 text-paper shadow-[3px_4px_0_rgba(40,90,53,0.18)] -rotate-2",
        tapeTone: "accent-green" as const,
        tapeClass: "-top-3 left-1/2 h-5 w-20 -translate-x-1/2 rotate-1",
        helperClass: "text-accent-green",
      };
    case "COMMENT":
    case "COMMENT_LIKE":
      return {
        iconWrap:
          "border-accent-green/20 bg-accent-green/100 text-paper shadow-[3px_4px_0_rgba(40,90,53,0.18)] rotate-3",
        tapeTone: "paper-muted" as const,
        tapeClass: "-top-3 left-6 h-5 w-14 rotate-2",
        helperClass: "text-accent-green",
      };
    case "FAVORITE":
    case "COMMENT_FAVORITE":
      return {
        iconWrap:
          "border-accent-green/20 bg-accent-green/100 text-paper shadow-[3px_4px_0_rgba(40,90,53,0.18)] -rotate-2",
        tapeTone: "accent-green" as const,
        tapeClass: "-top-3 left-7 h-5 w-16 rotate-1",
        helperClass: "text-accent-green",
      };
    case "MENTION":
      return {
        iconWrap:
          "border-accent-green/20 bg-accent-green/100 text-paper shadow-[3px_4px_0_rgba(40,90,53,0.18)] rotate-3",
        tapeTone: "paper-muted" as const,
        tapeClass: "hidden",
        helperClass: "text-accent-green",
      };
    case "UNFOLLOW":
      return {
        iconWrap:
          "border-accent-red/20 bg-accent-red/100 text-paper shadow-[3px_4px_0_rgba(211,47,47,0.18)] -rotate-3",
        tapeTone: "accent-red" as const,
        tapeClass: "-top-3 left-8 h-4 w-16 rotate-3",
        helperClass: "text-label",
      };
    case "MESSAGE":
      return {
        iconWrap:
          "border-accent-blue/20 bg-accent-blue/80 text-paper shadow-[3px_4px_0_rgba(58,105,138,0.18)] rotate-6",
        tapeTone: "accent-blue" as const,
        tapeClass: "-top-3 left-8 h-4 w-16 -rotate-2",
        helperClass: "text-accent-blue",
      };
    case "LIKE":
    default:
      return {
        iconWrap:
          "border-accent-red/20 bg-accent-red/100 text-paper shadow-[3px_4px_0_rgba(211,47,47,0.18)] -rotate-3",
        tapeTone: "accent-red" as const,
        tapeClass: "-top-3 left-6 h-5 w-16 rotate-2",
        helperClass: "text-accent-red",
      };
  }
}

export function NotificationGlyph({ type }: { type: string }) {
  switch (type) {
    case "FOLLOW":
      return <HugeiconsIcon icon={UserAdd01Icon} size={20} strokeWidth={1.9} />;
    case "FOLLOW_ACCEPT":
      return <HugeiconsIcon icon={UserCheck01Icon} size={20} strokeWidth={1.9} />;
    case "UNFOLLOW":
      return <HugeiconsIcon icon={HeartbreakIcon} size={20} strokeWidth={1.9} />;
    case "COMMENT":
    case "COMMENT_LIKE":
      return <HugeiconsIcon icon={Comment01Icon} size={20} strokeWidth={1.9} />;
    case "FAVORITE":
    case "COMMENT_FAVORITE":
      return <HugeiconsIcon icon={Bookmark02Icon} size={20} strokeWidth={1.9} />;
    case "MENTION":
      return <HugeiconsIcon icon={AtIcon} size={20} strokeWidth={1.9} />;
    case "MESSAGE":
      return <HugeiconsIcon icon={MessageMultiple01Icon} size={20} strokeWidth={1.9} />;
    case "LIKE":
    default:
      return <HugeiconsIcon icon={FavouriteIcon} size={20} strokeWidth={1.9} />;
  }
}
