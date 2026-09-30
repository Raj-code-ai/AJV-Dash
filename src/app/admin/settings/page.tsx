"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiGet, apiPut } from "@/lib/fetchers";
import type { SiteSettings } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Skeleton from "@/components/ui/Skeleton";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Card, CardTitle } from "@/components/ui/Card";

type FormState = {
  universityName: string;
  departmentName: string;
  departmentLogoUrl: string;
  universityLogoUrl: string;
  departmentDescription: string;
  welcomeMessage: string;
  hodName: string;
  hodDesignation: string;
  hodPhotoUrl: string;
  hodMessage: string;
  aboutHistory: string;
  vision: string;
  mission: string;
  objectives: string;
  address: string;
  email: string;
  phone: string;
  officeHours: string;
  mapEmbedUrl: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  instagram: string;
  notesPortalUrl: string;
  questionPaperPortalUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  students: number;
  faculty: number;
  achievements: number;
  placements: number;
};

function fromSettings(s: SiteSettings): FormState {
  return {
    universityName: s.universityName || "",
    departmentName: s.departmentName || "",
    departmentLogoUrl: s.departmentLogoUrl || "",
    universityLogoUrl: s.universityLogoUrl || "",
    departmentDescription: s.departmentDescription || "",
    welcomeMessage: s.welcomeMessage || "",
    hodName: s.hodName || "",
    hodDesignation: s.hodDesignation || "",
    hodPhotoUrl: s.hodPhotoUrl || "",
    hodMessage: s.hodMessage || "",
    aboutHistory: s.aboutHistory || "",
    vision: s.vision || "",
    mission: s.mission || "",
    objectives: (s.objectives || []).join("\n"),
    address: s.address || "",
    email: s.email || "",
    phone: s.phone || "",
    officeHours: s.officeHours || "",
    mapEmbedUrl: s.mapEmbedUrl || "",
    facebook: s.socialLinks?.facebook || "",
    twitter: s.socialLinks?.twitter || "",
    linkedin: s.socialLinks?.linkedin || "",
    youtube: s.socialLinks?.youtube || "",
    instagram: s.socialLinks?.instagram || "",
    notesPortalUrl: s.notesPortalUrl || "",
    questionPaperPortalUrl: s.questionPaperPortalUrl || "",
    heroTitle: s.heroTitle || "",
    heroSubtitle: s.heroSubtitle || "",
    heroImageUrl: s.heroImageUrl || "",
    students: s.stats?.students || 0,
    faculty: s.stats?.faculty || 0,
    achievements: s.stats?.achievements || 0,
    placements: s.stats?.placements || 0,
  };
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await apiGet<SiteSettings>("/api/admin/settings");
      if (res.success && res.data) setForm(fromSettings(res.data));
      else toast.error(res.error || "Failed to load settings");
      setLoading(false);
    }
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;

    const payload = {
      universityName: form.universityName,
      departmentName: form.departmentName,
      departmentLogoUrl: form.departmentLogoUrl,
      universityLogoUrl: form.universityLogoUrl,
      departmentDescription: form.departmentDescription,
      welcomeMessage: form.welcomeMessage,
      hodName: form.hodName,
      hodDesignation: form.hodDesignation,
      hodPhotoUrl: form.hodPhotoUrl,
      hodMessage: form.hodMessage,
      aboutHistory: form.aboutHistory,
      vision: form.vision,
      mission: form.mission,
      objectives: form.objectives
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      address: form.address,
      email: form.email,
      phone: form.phone,
      officeHours: form.officeHours,
      mapEmbedUrl: form.mapEmbedUrl,
      socialLinks: {
        facebook: form.facebook,
        twitter: form.twitter,
        linkedin: form.linkedin,
        youtube: form.youtube,
        instagram: form.instagram,
      },
      notesPortalUrl: form.notesPortalUrl,
      questionPaperPortalUrl: form.questionPaperPortalUrl,
      heroTitle: form.heroTitle,
      heroSubtitle: form.heroSubtitle,
      heroImageUrl: form.heroImageUrl,
      stats: {
        students: Number(form.students) || 0,
        faculty: Number(form.faculty) || 0,
        achievements: Number(form.achievements) || 0,
        placements: Number(form.placements) || 0,
      },
    };

    setSaving(true);
    const res = await apiPut<SiteSettings>("/api/admin/settings", payload);
    setSaving(false);

    if (res.success && res.data) {
      toast.success("Settings saved — the public site will reflect these changes");
      setForm(fromSettings(res.data));
    } else {
      toast.error(res.error || "Failed to save");
    }
  }

  if (loading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-academic-navy dark:text-white">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Rebrand the CMS for any university or department. Super Admin only.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="space-y-4">
          <CardTitle>Identity & Branding</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="University name"
              required
              value={form.universityName}
              onChange={(e) => set("universityName", e.target.value)}
            />
            <Input
              label="Department name"
              required
              value={form.departmentName}
              onChange={(e) => set("departmentName", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="University logo URL"
            value={form.universityLogoUrl}
            onChange={(v) => set("universityLogoUrl", v)}
            folder="branding"
          />
          <ImageUploadField
            label="Department logo URL"
            value={form.departmentLogoUrl}
            onChange={(v) => set("departmentLogoUrl", v)}
            folder="branding"
          />
        </Card>

        <Card className="space-y-4">
          <CardTitle>Hero & Home</CardTitle>
          <Input
            label="Hero title"
            value={form.heroTitle}
            onChange={(e) => set("heroTitle", e.target.value)}
          />
          <Textarea
            label="Hero subtitle"
            value={form.heroSubtitle}
            onChange={(e) => set("heroSubtitle", e.target.value)}
          />
          <ImageUploadField
            label="Hero image URL"
            value={form.heroImageUrl}
            onChange={(v) => set("heroImageUrl", v)}
            folder="hero"
          />
          <Textarea
            label="Department description"
            value={form.departmentDescription}
            onChange={(e) => set("departmentDescription", e.target.value)}
          />
          <Textarea
            label="Welcome message"
            value={form.welcomeMessage}
            onChange={(e) => set("welcomeMessage", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Students"
              type="number"
              value={form.students}
              onChange={(e) => set("students", Number(e.target.value))}
            />
            <Input
              label="Faculty"
              type="number"
              value={form.faculty}
              onChange={(e) => set("faculty", Number(e.target.value))}
            />
            <Input
              label="Achievements"
              type="number"
              value={form.achievements}
              onChange={(e) => set("achievements", Number(e.target.value))}
            />
            <Input
              label="Placements %"
              type="number"
              value={form.placements}
              onChange={(e) => set("placements", Number(e.target.value))}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <CardTitle>HOD Message</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="HOD name"
              value={form.hodName}
              onChange={(e) => set("hodName", e.target.value)}
            />
            <Input
              label="HOD designation"
              value={form.hodDesignation}
              onChange={(e) => set("hodDesignation", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="HOD photo URL"
            value={form.hodPhotoUrl}
            onChange={(v) => set("hodPhotoUrl", v)}
            folder="faculty"
          />
          <Textarea
            label="HOD message"
            value={form.hodMessage}
            onChange={(e) => set("hodMessage", e.target.value)}
          />
        </Card>

        <Card className="space-y-4">
          <CardTitle>About Page</CardTitle>
          <Textarea
            label="History"
            value={form.aboutHistory}
            onChange={(e) => set("aboutHistory", e.target.value)}
          />
          <Textarea
            label="Vision"
            value={form.vision}
            onChange={(e) => set("vision", e.target.value)}
          />
          <Textarea
            label="Mission"
            value={form.mission}
            onChange={(e) => set("mission", e.target.value)}
          />
          <Textarea
            label="Objectives (one per line)"
            value={form.objectives}
            onChange={(e) => set("objectives", e.target.value)}
          />
        </Card>

        <Card className="space-y-4">
          <CardTitle>Contact & Social</CardTitle>
          <Textarea
            label="Address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <Input
            label="Office hours"
            value={form.officeHours}
            onChange={(e) => set("officeHours", e.target.value)}
          />
          <Input
            label="Map embed URL"
            value={form.mapEmbedUrl}
            onChange={(e) => set("mapEmbedUrl", e.target.value)}
            hint="Paste a Google Maps embed URL (iframe src)"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Facebook"
              value={form.facebook}
              onChange={(e) => set("facebook", e.target.value)}
            />
            <Input
              label="Twitter / X"
              value={form.twitter}
              onChange={(e) => set("twitter", e.target.value)}
            />
            <Input
              label="LinkedIn"
              value={form.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
            />
            <Input
              label="YouTube"
              value={form.youtube}
              onChange={(e) => set("youtube", e.target.value)}
            />
            <Input
              label="Instagram"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Resource Portal Links</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            These appear on the Resources page as external link cards only. No
            notes are stored in this CMS.
          </p>
          <Input
            label="Notes Portal URL"
            value={form.notesPortalUrl}
            onChange={(e) => set("notesPortalUrl", e.target.value)}
          />
          <Input
            label="Question Paper Repository URL"
            value={form.questionPaperPortalUrl}
            onChange={(e) => set("questionPaperPortalUrl", e.target.value)}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
