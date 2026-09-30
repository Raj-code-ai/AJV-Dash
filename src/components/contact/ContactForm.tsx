"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/fetchers";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""),
    };

    setLoading(true);
    const res = await apiPost<{ message: string }>("/api/contact", payload);
    setLoading(false);

    if (res.success) {
      toast.success(res.data?.message || "Message sent successfully");
      form.reset();
    } else {
      toast.error(res.error || "Failed to send message");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Full name" required />
        <Input name="email" type="email" label="Email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="phone" label="Phone (optional)" />
        <Input name="subject" label="Subject" required />
      </div>
      <Textarea name="message" label="Message" required minLength={10} />
      <Button type="submit" loading={loading}>
        Send Message
      </Button>
    </form>
  );
}
