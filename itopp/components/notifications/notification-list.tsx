"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markNotificationsReadAction } from "@/lib/actions";

export interface Notice {
  id: string;
  title: string;
  body: string | null;
  when: string;
  unread: boolean;
}

export function NotificationList({ items }: { items: Notice[] }) {
  const [busy, setBusy] = useState(false);

  async function markAll() {
    setBusy(true);
    const res = await markNotificationsReadAction();
    setBusy(false);
    if (!res.ok) toast.error(res.error);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#6B7280]">
        <b className="text-[#111827]">All quiet</b>
        <br />
        Status changes, new matches and report updates land here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" disabled={busy} onClick={markAll}>
          Mark all as read
        </Button>
      </div>
      {items.map((n) => (
        <Card
          key={n.id}
          className={n.unread ? "border-l-4 border-l-[#0C6B3C]" : ""}
        >
          <CardContent className="flex gap-3 pt-4">
            <span
              className={`mt-1 size-2.5 shrink-0 rounded-full ${
                n.unread ? "bg-[#0C6B3C]" : "bg-gray-200"
              }`}
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <b>{n.title}</b>
                <span className="shrink-0 text-xs text-[#64748B]">{n.when}</span>
              </div>
              {n.body && <p className="mt-0.5 text-sm text-[#374151]">{n.body}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
