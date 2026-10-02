"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportCompanyAction } from "@/lib/actions";
import { REPORT_REASONS } from "@/lib/options";

export function ReportDialog({
  companyId,
  postingId,
  companyName,
}: {
  companyId: string;
  postingId?: string;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await reportCompanyAction({
      companyId,
      postingId,
      reason,
      details,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Report received. Reviewed within 48 hours.");
    setOpen(false);
    setDetails("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-md border border-[#DC2626] px-3 py-1.5 text-sm font-semibold text-[#DC2626]">
        Report this company
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {companyName}</DialogTitle>
          <DialogDescription>
            Available at any stage. Reviewed within 48 hours — outcomes:
            investigation, suspension, or delisting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={reason} onValueChange={(v) => setReason(v ?? REPORT_REASONS[0])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="What happened? (optional but helpful)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <Button
            variant="destructive"
            className="w-full"
            disabled={busy}
            onClick={submit}
          >
            {busy ? "Sending…" : "Submit report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
