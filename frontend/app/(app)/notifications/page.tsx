"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import ArchiveFilters from "@/components/decor/ArchiveFilters";
import { LikeNotificationGroupCard } from "@/components/notifications/LikeNotificationGroupCard";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { NotificationsRail } from "@/components/notifications/NotificationsRail";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useAuth } from "@/context/AuthContext";
import { useInboxUnread } from "@/context/InboxUnreadContext";
import { useSocket } from "@/context/SocketContext";
import { useI18n } from "@/i18n/I18nProvider";
import {
  getNotifications,
  markNotificationAsRead,
  normalizeUploadedMediaPayload,
  type NotificationItem,
} from "@/lib/api";
import {
  buildNotificationLedgerItems,
  getNotificationLedgerSearchText,
  matchesNotificationLedgerFilters,
  type NotificationFilterState,
} from "@/lib/notification-utils";
import {
  SOCKET_EVENTS,
  type NotificationCreatedEvent,
  type NotificationReadEvent,
} from "@/lib/socket-events";

const DEFAULT_FILTERS: NotificationFilterState = {
  social: true,
  post: true,
  message: true,
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const { socket, isConnected } = useSocket();
  const { setUnreadNotificationsCount } = useInboxUnread();
  const { notifyError, notifySuccess } = useArchiveToasts();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(
    async (options: { notifyOnError?: boolean } = {}) => {
      if (!token) {
        return;
      }

      const { notifyOnError = true } = options;

      try {
        setLoading(true);
        setError(null);

        const result = await getNotifications(token);

        if (!result.ok) {
          throw new Error(result.message || t("notifications.errors.load"));
        }

        setNotifications(
          Array.isArray(result.data.allNotifs) ? result.data.allNotifs : [],
        );
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : t("notifications.errors.loadFallback");
        setError(message);

        if (notifyOnError) {
          notifyError(message);
        }
      } finally {
        setLoading(false);
      }
    },
    [notifyError, t, token],
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    void fetchNotifications();
  }, [fetchNotifications, token]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    setUnreadNotificationsCount(unreadCount);
  }, [loading, setUnreadNotificationsCount, unreadCount]);

  const handleNotificationCreatedEvent = useEffectEvent(
    ({ notification }: NotificationCreatedEvent) => {
      const normalizedNotification = normalizeUploadedMediaPayload(notification);

      setNotifications((current) => {
        if (current.some((entry) => entry.id === normalizedNotification.id)) {
          return current;
        }

        return [normalizedNotification, ...current];
      });
    },
  );

  const handleNotificationReadEvent = useEffectEvent(
    ({ notificationId }: NotificationReadEvent) => {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
  );

  const ledgerItems = useMemo(
    () => buildNotificationLedgerItems(notifications),
    [notifications],
  );

  const visibleLedgerItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return ledgerItems.filter((item) => {
      if (!matchesNotificationLedgerFilters(item, filters)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getNotificationLedgerSearchText(item).includes(normalizedSearch);
    });
  }, [filters, ledgerItems, searchValue]);

  const handleToggleFilter = (filter: keyof NotificationFilterState) => {
    setFilters((current) => {
      const next = {
        ...current,
        [filter]: !current[filter],
      };

      if (!next.social && !next.post && !next.message) {
        return current;
      }

      return next;
    });
  };

  const handleMarkNotificationsAsRead = async (notificationIds: number[]) => {
    if (!token) {
      return;
    }

    const targetIds = notificationIds.filter((notificationId) => {
      const target = notifications.find(
        (notification) => notification.id === notificationId,
      );

      return Boolean(target && !target.read);
    });

    if (targetIds.length === 0) {
      return;
    }

    const previousNotifications = notifications;

    try {
      setNotifications((current) =>
        current.map((notification) =>
          targetIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification,
        ),
      );

      const results = await Promise.all(
        targetIds.map((notificationId) =>
          markNotificationAsRead(notificationId, token),
        ),
      );

      const failure = results.find((result) => !result.ok);

      if (failure && !failure.ok) {
        throw new Error(
          failure.message || t("notifications.errors.markOne"),
        );
      }

      const updates = new Map<number, NotificationItem>();

      for (const result of results) {
        if (!result.ok || !result.data.notification) {
          continue;
        }

        updates.set(result.data.notification.id, result.data.notification);
      }

      setNotifications((current) =>
        current.map((notification) =>
          updates.get(notification.id) ?? notification,
        ),
      );
    } catch (markError) {
      setNotifications(previousNotifications);
      throw markError;
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await handleMarkNotificationsAsRead([notificationId]);
    } catch (markError) {
      notifyError(
        markError instanceof Error
          ? markError.message
          : t("notifications.errors.markOneFallback"),
      );
    }
  };

  const handleMarkGroupAsRead = async (notificationIds: number[]) => {
    try {
      await handleMarkNotificationsAsRead(notificationIds);
    } catch (markError) {
      notifyError(
        markError instanceof Error
          ? markError.message
          : t("notifications.errors.markOneFallback"),
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) {
      return;
    }

    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) {
      return;
    }

    try {
      setMarkingAll(true);
      await handleMarkNotificationsAsRead(unreadIds);

      notifySuccess(t("notifications.toasts.markAllSuccess"));
    } catch (markAllError) {
      notifyError(
        markAllError instanceof Error
          ? markAllError.message
          : t("notifications.errors.markAllFallback"),
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const hasFiltersApplied =
    searchValue.trim().length > 0 ||
    Object.values(filters).some((enabled) => !enabled);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleCreated = (payload: NotificationCreatedEvent) => {
      handleNotificationCreatedEvent(payload);
    };

    const handleRead = (payload: NotificationReadEvent) => {
      handleNotificationReadEvent(payload);
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleCreated);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, handleRead);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, handleCreated);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, handleRead);
    };
  }, [handleNotificationCreatedEvent, handleNotificationReadEvent, socket]);

  useEffect(() => {
    if (!token || !isConnected) {
      return;
    }

    void fetchNotifications({ notifyOnError: false });
  }, [fetchNotifications, isConnected, token]);

  return (
    <>
      <ArchiveFilters />

      <div className="flex items-start justify-center gap-8 xl:gap-10">
        <section className="min-w-0 w-full max-w-[800px]">
          <header className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="mt-5 font-display text-4xl font-black uppercase tracking-[-0.05em] text-ink sm:text-5xl">
                {t("notifications.pageTitle")}
              </h1>
            </div>
          </header>

          {error ? (
            <section className="mb-6 border border-accent-red/20 bg-paper px-5 py-4 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-red">
                {error}
              </p>
            </section>
          ) : null}

          {loading ? (
            <div className="flex flex-col gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <section
                  key={index}
                  className="border border-black/10 bg-paper px-5 py-6 shadow-[8px_12px_25px_rgba(26,26,26,0.12)]"
                >
                  <div className="h-3 w-32 bg-paper-muted" />
                  <div className="mt-4 h-4 w-3/4 bg-paper-muted" />
                  <div className="mt-3 h-4 w-1/2 bg-paper-muted" />
                </section>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <section className="border border-black/10 bg-paper px-6 py-8 shadow-[8px_12px_25px_rgba(26,26,26,0.12)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                {t("notifications.empty.noneTitle")}
              </p>
              <p className="mt-3 text-base italic leading-relaxed text-label">
                {t("notifications.empty.noneDescription")}
              </p>
            </section>
          ) : visibleLedgerItems.length === 0 ? (
            <section className="border border-black/10 bg-paper px-6 py-8 shadow-[8px_12px_25px_rgba(26,26,26,0.12)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                {t("notifications.empty.filteredTitle")}
              </p>
              <p className="mt-3 text-base italic leading-relaxed text-label">
                {t("notifications.empty.filteredDescription")}
              </p>
            </section>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                {/*
                  Translation note:
                  this summary line switches key based on UI state,
                  while counts are injected with params for each locale.
                */}
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  {hasFiltersApplied
                    ? t("notifications.summary.filtered", { count: visibleLedgerItems.length })
                    : t("notifications.summary.default", {
                      unread: unreadCount,
                      total: notifications.length,
                    })}
                </p>
                {hasFiltersApplied ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-blue">
                    {t("notifications.summary.localFilter")}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-8">
                {visibleLedgerItems.map((item, index) => (
                  item.kind === "like-group" ? (
                    <LikeNotificationGroupCard
                      key={item.id}
                      group={item}
                      index={index}
                      onMarkAsRead={handleMarkGroupAsRead}
                    />
                  ) : (
                    <NotificationCard
                      key={item.id}
                      notification={item.notification}
                      index={index}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  )
                ))}
              </div>
            </>
          )}

          <div className="mt-12 border-t border-dashed border-label pt-8 text-center font-mono text-sm text-label">
            {t("notifications.noMore")}
          </div>
        </section>

        <NotificationsRail
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          onToggleFilter={handleToggleFilter}
          totalCount={notifications.length}
          unreadCount={unreadCount}
          visibleCount={visibleLedgerItems.length}
          markingAll={markingAll}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </>
  );
}
