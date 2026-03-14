import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function NotificationsPage() {
  const notifications = [
    {
      type: "friend",
      title: "New friend request",
      message: "Sarah sent you a friend request.",
      time: "2 min ago",
      unread: true,
    },
    {
      type: "message",
      title: "New message",
      message: "Yassir sent you a new message.",
      time: "10 min ago",
      unread: true,
    },
    {
      type: "system",
      title: "Profile updated",
      message: "Your profile information has been updated successfully.",
      time: "1 hour ago",
      unread: false,
    },
    {
      type: "community",
      title: "New activity",
      message: "Amine accepted your friend request.",
      time: "Yesterday",
      unread: false,
    },
  ];

  return (
  <ProtectedRoute>
    <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-sm text-white/60">
              Stay updated with friend requests, messages, and account activity.
            </p>
          </div>

          <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
            Mark all as read
          </button>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Total</p>
            <p className="mt-2 text-3xl font-bold text-orange-400">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Unread</p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {notifications.filter((n) => n.unread).length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Read</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {notifications.filter((n) => !n.unread).length}
            </p>
          </div>
        </div>

        {/* Notification list */}
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`rounded-2xl border p-5 transition ${
                notification.unread
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${
                      notification.unread ? "bg-orange-400" : "bg-white/20"
                    }`}
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">
                        {notification.title}
                      </h2>

                      {notification.unread && (
                        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-semibold text-orange-300">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {notification.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <span className="text-xs text-white/40">{notification.time}</span>

                  <div className="flex gap-2">
                    <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15">
                      Open
                    </button>
                    <button className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-orange-500/50 hover:text-white">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </ProtectedRoute>
  );
}