"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyToOpportunity } from "@/actions/applications";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export function ApplyButton({
  opportunityId,
  disabled,
}: {
  opportunityId: string;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<
    "idle" | "form" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const handleSubmit = async () => {
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await applyToOpportunity({
        opportunityId,
        resumeUrl: resumeUrl || undefined,
        coverLetter: coverLetter || undefined,
      });

      if (res.error) {
        setStatus("error");
        setErrorMsg(res.error);
      } else {
        setStatus("success");
        setMatchScore(res.data?.match_score ?? null);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-semantic-success mx-auto" />
        <p className="text-body-sm text-ink font-medium">
          Application Submitted!
        </p>
        {matchScore !== null && (
          <p className="text-micro text-ink-muted">
            Match Score:{" "}
            <strong className="text-ink">{matchScore}%</strong>
          </p>
        )}
      </div>
    );
  }

  if (status === "idle") {
    return (
      <Button
        className="w-full rounded-pill"
        onClick={() => setStatus("form")}
        disabled={disabled}
      >
        <Send className="w-4 h-4 mr-2" />
        {disabled ? "Deadline Passed" : "Apply Now"}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {status === "error" && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-micro flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <div>
        <label className="text-micro text-ink-muted block mb-1">
          Resume URL (optional)
        </label>
        <Input
          placeholder="https://..."
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          className="text-body-sm"
        />
      </div>

      <div>
        <label className="text-micro text-ink-muted block mb-1">
          Cover Letter (optional)
        </label>
        <textarea
          className="w-full p-2.5 bg-surface-1 rounded-md text-ink border border-hairline text-body-sm focus:ring-1 focus:ring-accent-blue/20"
          rows={3}
          placeholder="Why are you a great fit..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      </div>

      <Button
        className="w-full rounded-pill"
        onClick={handleSubmit}
        disabled={status === "submitting"}
      >
        <Send className="w-4 h-4 mr-2" />
        {status === "submitting" ? "Submitting..." : "Submit Application"}
      </Button>
    </div>
  );
}
