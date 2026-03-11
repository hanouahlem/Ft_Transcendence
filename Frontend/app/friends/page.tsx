export default function FriendsPage() {
  const friends = [
    { name: "Amine", status: "Online" },
    { name: "Yassir", status: "Offline" },
    { name: "Sami", status: "Online" },
    { name: "Ikram", status: "Away" },
  ];

  const requests = [
    { name: "Sarah" },
    { name: "Mehdi" },
  ];

  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="mt-2 text-sm text-white/60">
              Manage your friends, view requests, and stay connected with your community.
            </p>
          </div>

          <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
            Add friend
          </button>
        </div>

        {/* Search */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Search users
          </label>
          <input
            type="text"
            placeholder="Search by username..."
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orange-500/50"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Friends list */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Friends</h2>
              <span className="text-sm text-white/50">{friends.length} total</span>
            </div>

            <div className="space-y-4">
              {friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-2xl bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-white/10" />

                    <div>
                      <p className="text-base font-semibold text-white">{friend.name}</p>
                      <p
                        className={`text-sm ${
                          friend.status === "Online"
                            ? "text-green-400"
                            : friend.status === "Away"
                            ? "text-yellow-400"
                            : "text-white/40"
                        }`}
                      >
                        {friend.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                      Message
                    </button>
                    <button className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-orange-500/50 hover:text-white">
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-semibold">Friend Requests</h2>

            <div className="space-y-4">
              {requests.map((request, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-black/20 p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/10" />
                    <div>
                      <p className="font-medium text-white">{request.name}</p>
                      <p className="text-sm text-white/40">Wants to connect</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                      Accept
                    </button>
                    <button className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300/70">
                Community
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">
                Stay connected
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Build your network, chat with friends, and stay active in your social space.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}