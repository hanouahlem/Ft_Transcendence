"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import type { ConversationItem, ConversationMessage, NotificationItem } from "@/lib/api";
import ArchiveStar from "@/components/decor/ArchiveStar";
import {
  getNotificationTone,
  NotificationGlyph,
} from "@/components/notifications/NotificationVisuals";
import { useI18n } from "@/i18n/I18nProvider";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { getNotificationCopy, formatNotificationTime, getNotificationHref } from "@/lib/notification-utils";
import { cn } from "@/lib/utils";

export const archiveToaster = createToaster({
  placement: "top",
  overlap: true,
  gap: 16,
  max: 4,
});

type NotificationToastMeta = {
  kind: "notification";
  notification: NotificationItem;
};

type MessageToastMeta = {
  kind: "message";
  conversation: ConversationItem;
  message: ConversationMessage;
};

type ArchiveToastMeta = NotificationToastMeta | MessageToastMeta;

function isNotificationToastMeta(meta: unknown): meta is NotificationToastMeta {
  return Boolean(
    meta &&
    typeof meta === "object" &&
    "kind" in meta &&
    "notification" in meta &&
    (meta as NotificationToastMeta).kind === "notification",
  );
}

function isMessageToastMeta(meta: unknown): meta is MessageToastMeta {
  return Boolean(
    meta &&
    typeof meta === "object" &&
    "kind" in meta &&
    "conversation" in meta &&
    "message" in meta &&
    (meta as MessageToastMeta).kind === "message",
  );
}

function formatMessageToastTime(value: string | null | undefined, locale: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationToastContent({
  notification,
  locale,
  t,
}: {
  notification: NotificationItem;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const tone = getNotificationTone(notification.type);
  const copy = getNotificationCopy(notification, t);
  const actorDisplayName =
    notification.actor.displayName?.trim() || notification.actor.username;
  const actorHandle = `@${notification.actor.username.toLowerCase()}`;

  return (
    <div className="archive-live-toast archive-live-toast-notification">
      {notification.type === "MENTION" ? (
        <div className="archive-live-toast-star">
          <ArchiveStar />
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "mt-1 flex h-11 w-11 shrink-0 items-center justify-center border",
            tone.iconWrap,
          )}
        >
          <NotificationGlyph type={notification.type} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[1.1rem] font-bold leading-none text-ink">
                  {actorDisplayName}
                </p>
                <p className="truncate font-mono text-[0.72rem] text-label">
                  {actorHandle}
                </p>
              </div>
            </div>

            <span className="shrink-0 bg-stage px-1.5 py-0.5 font-mono text-[10px] text-label">
              {formatNotificationTime(notification.createdAt, locale)}
            </span>
          </div>

          <p className="text-[1rem] leading-relaxed text-label">
            {copy.body}
            {copy.quote && copy.inlineQuote ? (
              <>
                {" "}
                <span className="font-serif italic text-ink">
                  &quot;{copy.quote}&quot;
                </span>
              </>
            ) : null}
          </p>

          {copy.quote && !copy.inlineQuote ? (
            <div className="mt-3 border-l-2 border-accent-green bg-stage/40 px-3 py-2 font-serif text-[1rem] italic leading-relaxed text-ink">
              &quot;{copy.quote}&quot;
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MessageToastContent({
  conversation,
  message,
  locale,
}: {
  conversation: ConversationItem;
  message: ConversationMessage;
  locale: string;
}) {
  const peerName =
    conversation.peer?.displayName?.trim() ||
    conversation.peer?.username ||
    message.sender.displayName?.trim() ||
    message.sender.username;

  return (
    <div className="archive-live-toast archive-live-toast-message">
      <div className="flex items-center gap-4">
        <ProfilePicture
          name={peerName}
          src={conversation.peer?.avatar ?? message.sender.avatar}
          size="lg"
          withShadow={false}
          className="shrink-0 self-start border border-label/25 bg-paper"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-ink">
                {peerName}
              </p>
            </div>

            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-label">
              {formatMessageToastTime(message.createdAt, locale)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 font-sans text-[0.95rem] leading-5 text-ink/80">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppToaster() {
  const router = useRouter();
  const { locale, t } = useI18n();

  return (
    <Toaster toaster={archiveToaster}>
      {(toast) => {
        const meta = toast.meta;
        const isNotificationToast = isNotificationToastMeta(meta);
        const isMessageToast = isMessageToastMeta(meta);
        const navigationHref = isNotificationToast
          ? getNotificationHref(meta.notification)
          : isMessageToast
            ? `/message?userId=${meta.conversation.peer?.id ?? meta.message.sender.id}`
            : null;

        const handleNavigate = () => {
          if (!navigationHref) {
            return;
          }

          archiveToaster.dismiss(toast.id);
          router.push(navigationHref);
        };

        const handleRootClick = () => {
          handleNavigate();
        };

        const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();
          handleNavigate();
        };

        const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
        };

        return (
          <Toast.Root
            key={toast.id}
            data-live-kind={(meta as ArchiveToastMeta | undefined)?.kind}
            data-live-notification-type={
              isNotificationToast
                ? meta.notification.type
                : undefined
            }
            role={navigationHref ? "button" : undefined}
            tabIndex={navigationHref ? 0 : undefined}
            onClick={navigationHref ? handleRootClick : undefined}
            onKeyDown={navigationHref ? handleRootKeyDown : undefined}
            className={navigationHref ? "cursor-pointer" : undefined}
          >
            {isNotificationToast ? (
              <NotificationToastContent notification={meta.notification} locale={locale} t={t} />
            ) : isMessageToast ? (
              <MessageToastContent
                conversation={meta.conversation}
                message={meta.message}
                locale={locale}
              />
            ) : (
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
              </div>
            )}

            {!isNotificationToast ? (
              <Toast.CloseTrigger
                aria-label={t("notifications.toastDismissAria")}
                onClick={handleCloseClick}
              >
                {t("notifications.toastDismiss")}
              </Toast.CloseTrigger>
            ) : null}
          </Toast.Root>
        );
      }}
    </Toaster>
  );
}
