import { ShieldCheck, Flag, Clock, Upload, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ToastDemo } from "@/components/design/toast-demo";

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t pt-6">
      <h2 className="text-xl font-bold">
        {n}. {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const swatches = [
  { name: "Primary / Trust", hex: "#0B5FFF" },
  { name: "Success", hex: "#16A34A" },
  { name: "Warning", hex: "#D97706" },
  { name: "Danger", hex: "#DC2626" },
  { name: "Ink", hex: "#111827" },
  { name: "Muted", hex: "#6B7280" },
];

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 bg-[#F9FAFB] px-4 py-10 text-[#111827]">
      <header>
        <h1 className="text-3xl font-extrabold">ITopp — Design System</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          v1 · Live style guide at <code>/design</code> · Every piece below is
          a real component used by the app.
        </p>
      </header>

      <Section n="1" title="Color tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map((s) => (
            <div
              key={s.hex}
              className="overflow-hidden rounded-lg border bg-white"
            >
              <div className="h-14" style={{ background: s.hex }} />
              <div className="p-2 text-sm">
                <b>{s.name}</b>
                <br />
                <code className="text-xs text-[#6B7280]">{s.hex}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section n="2" title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Apply now</Button>
          <Button variant="secondary">View details</Button>
          <Button variant="destructive">
            <Flag /> Report company
          </Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section n="3" title="Status badges (all 10 states)">
        <p className="mb-2 text-sm font-semibold text-[#6B7280]">
          VERIFICATION
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="verified" />
          <StatusBadge status="rejected" />
          <StatusBadge status="suspended" />
        </div>
        <p className="mb-2 mt-4 text-sm font-semibold text-[#6B7280]">
          APPLICATION
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="applied" />
          <StatusBadge status="shortlisted" />
          <StatusBadge status="accepted" />
          <StatusBadge status="rejected" />
          <StatusBadge status="withdrawn" />
          <StatusBadge status="closed" />
        </div>
      </Section>

      <Section n="4" title="Posting card (student feed)">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Frontend Intern — Lagos · 6 months</CardTitle>
              <StatusBadge status="verified" />
            </div>
            <CardDescription>
              TechCorp Ltd · Computer Science · Posted 2 days ago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 font-medium text-[#0B5FFF]">
                2/3 skills match
              </span>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 font-medium text-[#0B5FFF]">
                React
              </span>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 font-medium text-[#0B5FFF]">
                Git
              </span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[#6B7280]">
              <Clock className="size-4" /> Avg response: 3 days · Pending: 1 day
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button>Apply now</Button>
            <Button variant="secondary">Details</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section n="5" title="Tabs (Matched / Browse)">
        <Tabs defaultValue="matched">
          <TabsList>
            <TabsTrigger value="matched">Matched for you (4)</TabsTrigger>
            <TabsTrigger value="browse">Browse all</TabsTrigger>
          </TabsList>
          <TabsContent value="matched">
            <p className="text-sm">
              Top section: openings sorted by match score (department 40 +
              skills 40 + level 20).
            </p>
          </TabsContent>
          <TabsContent value="browse">
            <p className="text-sm">
              Bottom section: every opening with department, location, skills
              and duration filters.
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section n="6" title="Forms + file upload">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Full name
              </label>
              <Input defaultValue="Adaeze Okafor" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Department
              </label>
              <Select defaultValue="cs">
                <SelectTrigger>
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="se">Software Engineering</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Why are you a good fit?
              </label>
              <Textarea placeholder="Short answer for the company's screening question…" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                School ID / admission letter (max 5MB)
              </label>
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm text-[#6B7280]">
                <Upload className="size-4" /> Drag &amp; drop, or click to
                browse
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section n="7" title="Admin verification queue (table)">
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    <Building2 className="size-4 text-[#6B7280]" /> TechCorp Ltd
                  </span>
                </TableCell>
                <TableCell>Company · CAC 123456</TableCell>
                <TableCell>
                  <StatusBadge status="pending" />
                </TableCell>
                <TableCell>
                  <Button size="sm">Review</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    <User className="size-4 text-[#6B7280]" /> Adaeze Okafor
                  </span>
                </TableCell>
                <TableCell>Student · CS 400L</TableCell>
                <TableCell>
                  <StatusBadge status="verified" />
                </TableCell>
                <TableCell className="text-[#6B7280]">Done</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section n="8" title="Report dialog + toasts">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger className="rounded-md bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white">
              Report this company
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-[#16A34A]" /> Report
                  TechCorp Ltd
                </DialogTitle>
                <DialogDescription>
                  Reports are reviewed within 48 hours. Outcomes: investigation,
                  suspension, or delisting.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4">
          <ToastDemo />
        </div>
      </Section>

      <Section n="9" title="Avatar, loading, empty state">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>AO</AvatarFallback>
          </Avatar>
          <div className="w-48">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="mt-2 h-3.5" />
            <Skeleton className="mt-2 h-3.5 w-1/2" />
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-dashed bg-white p-8 text-center text-[#6B7280]">
          <b className="text-[#111827]">No matched openings yet</b>
          <br />
          Complete your profile (skills + CV) to unlock matches.
        </div>
      </Section>
    </main>
  );
}
