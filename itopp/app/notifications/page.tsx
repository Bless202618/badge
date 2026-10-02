import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  const notes = await db.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Notifications</h1>
      <NotificationList
        items={notes.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          when: n.createdAt.toLocaleString(),
          unread: n.readAt === null,
        }))}
      />
    </main>
  );
}
