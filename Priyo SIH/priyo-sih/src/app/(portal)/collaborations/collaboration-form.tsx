"use client";

import { useState } from "react";
import { proposeCollaboration } from "@/actions/collaborations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CollaborationForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const result = await proposeCollaboration({
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      category: String(formData.get("category") || "General"),
      domain: String(formData.get("domain") || "") || undefined,
    });
    setPending(false);
    if (result.error) return setError(result.error);
    setOpen(false);
  }

  if (!open) return <Button className="rounded-pill" onClick={() => setOpen(true)}>Propose New Collaboration</Button>;

  return (
    <form action={submit} className="w-full max-w-xl rounded-xl border border-hairline bg-surface-1 p-5 space-y-3">
      <h2 className="text-headline text-ink">Propose a collaboration</h2>
      <Input name="title" required minLength={5} maxLength={200} placeholder="Project title" />
      <Input name="category" required maxLength={100} placeholder="Category (e.g. Research)" />
      <Input name="domain" maxLength={100} placeholder="Domain (optional)" />
      <textarea name="description" required minLength={20} maxLength={5000} rows={5} className="w-full rounded-md border border-hairline bg-surface-1 p-3 text-body-sm" placeholder="Describe the proposed outcome, participants, and scope." />
      {error && <p className="text-body-sm text-semantic-error">{error}</p>}
      <div className="flex gap-2 justify-end"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit proposal"}</Button></div>
    </form>
  );
}
