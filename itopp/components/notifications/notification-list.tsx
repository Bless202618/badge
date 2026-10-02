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
        <Card key={n.id} className={n.unread ? "border-[#0B5FFF]" : ""}>
          <CardContent className="pt-4">
            <b>{n.title}</b>
            {n.body && <p className="text-sm text-[#374151]">{n.body}</p>}
            <p className="mt-1 text-xs text-[#6B7280]">{n.when}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
