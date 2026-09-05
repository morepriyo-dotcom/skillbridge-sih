"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { CollabStatus } from "@/types";

type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

/**
 * Propose a new collaboration project.
 * Validates inputs and prevents identical duplicate proposals by the same user.
 */
export async function proposeCollaboration(input: {
  title: string;
  description: string;
  category: string;
  domain?: string;
  industryId?: string;
  institutionId?: string;
}): Promise<ActionResult<{ id: string }>> {
  const trimmedTitle = input.title?.trim();
  const trimmedDesc = input.description?.trim();

  if (!trimmedTitle || trimmedTitle.length < 5) {
    return { error: "Collaboration title must be at least 5 characters long." };
  }

  if (!trimmedDesc || trimmedDesc.length < 20) {
    return { error: "Collaboration description must be at least 20 characters long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in to propose a collaboration." };

  const industryId: string | null = input.industryId || null;
  let institutionId: string | null = input.institutionId || null;

  // Best-effort lookup for linked institution or industry partner
  try {
    if (!institutionId) {
      const { data: academician } = await supabase
        .from("academician_details")
        .select("institution_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (academician?.institution_id) {
        institutionId = academician.institution_id;
      } else {
        const { data: student } = await supabase
          .from("student_details")
          .select("institution_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (student?.institution_id) {
          institutionId = student.institution_id;
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  // Redundancy check: check for duplicate proposal
  const { data: duplicateCollab } = await supabase
    .from("collaborations")
    .select("id")
    .eq("proposed_by", user.id)
    .eq("title", trimmedTitle)
    .in("status", ["proposed", "approved", "in_progress"])
    .maybeSingle();

  if (duplicateCollab) {
    return {
      error: "You have already proposed an active collaboration with this title.",
    };
  }

  // The public RLS policy intentionally has no INSERT access. Persist only
  // after the server has authenticated the caller and derived affiliation.
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("collaborations")
    .insert({
      title: trimmedTitle,
      description: trimmedDesc,
      category: input.category?.trim().slice(0, 100) || "General",
      domain: input.domain?.trim() || null,
      industry_id: industryId,
      institution_id: institutionId,
      proposed_by: user.id,
      status: "proposed" as CollabStatus,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/collaborations");
  revalidatePath("/dashboard");
  return { data };
}

/**
 * Update collaboration status.
 */
export async function updateCollaborationStatus(
  collaborationId: string,
  status: CollabStatus
): Promise<ActionResult> {
  if (!['proposed', 'approved', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return { error: "Invalid collaboration status." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("collaborations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", collaborationId);

  if (error) return { error: error.message };

  revalidatePath("/collaborations");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Schedule a mentorship session.
 * Prevents self-mentorship and invalid past dates.
 */
export async function scheduleMentorship(input: {
  mentorId: string;
  topic: string;
  scheduledAt: string;
  durationMinutes?: number;
  meetingLink?: string;
}): Promise<ActionResult<{ id: string }>> {
  const trimmedTopic = input.topic?.trim();
  if (!trimmedTopic || trimmedTopic.length < 3) {
    return { error: "Please provide a valid discussion topic (min 3 characters)." };
  }

  const scheduledDate = new Date(input.scheduledAt);
  if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    return { error: "Mentorship session must be scheduled for a future date and time." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in to schedule a mentorship session." };

  if (input.mentorId === user.id) {
    return { error: "You cannot schedule a mentorship session with yourself." };
  }

  // Check if session already booked with this mentor at this time
  const { data: existingSlot } = await supabase
    .from("mentorship_sessions")
    .select("id")
    .eq("mentor_id", input.mentorId)
    .eq("scheduled_at", input.scheduledAt)
    .in("status", ["scheduled", "confirmed"])
    .maybeSingle();

  if (existingSlot) {
    return { error: "This mentor already has a session scheduled for this exact time slot. Please select another time." };
  }

  const { data, error } = await supabase
    .from("mentorship_sessions")
    .insert({
      mentor_id: input.mentorId,
      mentee_id: user.id,
      topic: trimmedTopic,
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes || 60,
      meeting_link: input.meetingLink?.trim() || null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/mentorship");
  revalidatePath("/dashboard");
  return { data };
}
