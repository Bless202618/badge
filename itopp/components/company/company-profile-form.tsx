"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/mock-store";

const schema = z.object({
  companyName: z.string().min(2, "Enter the company name"),
  cacNumber: z.string().min(3, "Enter the CAC registration number"),
  contactName: z.string().min(2, "Enter a contact person's name"),
  phone: z.string().min(7, "Enter a reachable phone number"),
  website: z.string().min(4, "Enter the company website or social page"),
});

type Values = z.infer<typeof schema>;

export function CompanyProfileForm() {
  const { currentUser, currentCompanyProfile, saveCompanyProfile } = useStore();
  const router = useRouter();
  const existing = currentCompanyProfile;
  const [doc, setDoc] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: existing?.companyName ?? "",
      cacNumber: existing?.cacNumber ?? "",
      contactName: existing?.contactName ?? "",
      phone: existing?.phone ?? "",
      website: existing?.website ?? "",
    },
  });

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          Please log in first, then complete your company profile.
        </CardContent>
      </Card>
    );
  }
  if (currentUser.role !== "company") {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          This page is for company accounts. Student accounts use the student
          profile page.
        </CardContent>
      </Card>
    );
  }

  function onSubmit(v: Values) {
    const docName = doc?.name ?? existing?.docName ?? "";
    if (!docName) {
      toast.error("Upload a CAC document or proof of legitimacy.");
      return;
    }
    saveCompanyProfile({
      userId: currentUser!.id,
      companyName: v.companyName.trim(),
      cacNumber: v.cacNumber.trim(),
      contactName: v.contactName.trim(),
      phone: v.phone.trim(),
      website: v.website.trim(),
      docName,
    });
    toast.success("Profile submitted. Waiting for verification.");
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company profile + verification documents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Company name</label>
            <Input {...register("companyName")} />
            {errors.companyName && <Err msg={errors.companyName.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">CAC number</label>
            <Input placeholder="RC123456" {...register("cacNumber")} />
            {errors.cacNumber && <Err msg={errors.cacNumber.message} />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Contact person</label>
              <Input {...register("contactName")} />
              {errors.contactName && <Err msg={errors.contactName.message} />}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Phone</label>
              <Input {...register("phone")} />
              {errors.phone && <Err msg={errors.phone.message} />}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Website or social page
            </label>
            <Input placeholder="https://…" {...register("website")} />
            {errors.website && <Err msg={errors.website.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              CAC certificate or legitimacy proof{" "}
              {existing?.docName && `(current: ${existing.docName})`}
            </label>
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" className="w-full">
            Submit for verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-semibold text-[#DC2626]">{msg}</p>;
}
