"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

export interface BookMentorshipInput {
  mentorId: string;
  menteeId?: string;
  topic: string;
  scheduledAt: string;
  durationMinutes?: number;
  meetingLink?: string;
  notes?: string;
}

/**
 * Book or schedule a 1-on-1 mentorship session.
 * Supports:
 * - A mentee (student or academician) booking with a mentor.
 * - An academician mentor scheduling a guidance session for a student.
 */
export async function bookMentorshipSession(
  input: BookMentorshipInput
): Promise<ActionResult<{ id: string; topic: string; scheduled_at: string }>> {
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

  if (!user) {
    return { error: "Please sign in to schedule a mentorship session." };
  }

  const admin = await createAdminClient();

  // Determine mentor and mentee
  let mentorId = input.mentorId;
  let menteeId = input.menteeId || user.id;

  // If user is scheduling for a student (menteeId provided and mentorId is current user or specified)
  if (input.menteeId && input.menteeId !== user.id) {
    // Current user is acting as the mentor scheduling for a mentee
    mentorId = user.id;
    menteeId = input.menteeId;
  }

  if (mentorId === menteeId) {
    return { error: "You cannot schedule a mentorship session with yourself." };
  }

  // Validate that both mentor and mentee exist
  const { data: participants, error: partErr } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .in("id", [mentorId, menteeId]);

  if (partErr || !participants || participants.length < 2) {
    return { error: "Unable to verify mentor or mentee profile. Please try again." };
  }

  // Generate meeting link if none provided
  const meetingId = `skillbridge-${Math.random().toString(36).substring(2, 9)}`;
  const finalMeetingLink =
    input.meetingLink?.trim() || `https://meet.jit.si/${meetingId}`;

  const duration = input.durationMinutes ? Math.min(Math.max(input.durationMinutes, 15), 180) : 45;

  const { data: newSession, error: insertError } = await admin
    .from("mentorship_sessions")
    .insert({
      mentor_id: mentorId,
      mentee_id: menteeId,
      topic: trimmedTopic,
      scheduled_at: scheduledDate.toISOString(),
      duration_minutes: duration,
      meeting_link: finalMeetingLink,
      notes: input.notes?.trim() || null,
      status: "scheduled",
    })
    .select("id, topic, scheduled_at")
    .single();

  if (insertError) {
    return { error: insertError.message || "Failed to book mentorship session." };
  }

  revalidatePath("/mentorship");
  revalidatePath("/dashboard");

  return { data: newSession };
}

/**
 * Update the status of a mentorship session (completed, cancelled, rescheduled).
 */
export async function updateMentorshipStatus(
  sessionId: string,
  status: "scheduled" | "completed" | "cancelled" | "rescheduled",
  notes?: string
): Promise<ActionResult<{ id: string; status: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // Verify participant
  const { data: session, error: fetchErr } = await admin
    .from("mentorship_sessions")
    .select("id, mentor_id, mentee_id, notes")
    .eq("id", sessionId)
    .maybeSingle();

  if (fetchErr || !session) {
    return { error: "Mentorship session not found." };
  }

  if (session.mentor_id !== user.id && session.mentee_id !== user.id) {
    return { error: "You are not authorized to update this mentorship session." };
  }

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (notes !== undefined) {
    updatePayload.notes = notes.trim();
  }

  const { error: updateErr } = await admin
    .from("mentorship_sessions")
    .update(updatePayload)
    .eq("id", sessionId);

  if (updateErr) {
    return { error: updateErr.message || "Failed to update session status." };
  }

  revalidatePath("/mentorship");
  revalidatePath("/dashboard");

  return { data: { id: sessionId, status } };
}

/**
 * Toggle consultancy / mentorship availability for academicians.
 */
export async function toggleConsultancyAvailability(
  isOpen: boolean
): Promise<ActionResult<{ open_for_consultancy: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // Check if academician details exist
  const { data: existing } = await admin
    .from("academician_details")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("academician_details")
      .update({
        open_for_consultancy: isOpen,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) return { error: error.message };
  } else {
    // Create record if doesn't exist
    const { error } = await admin
      .from("academician_details")
      .insert({
        user_id: user.id,
        department: "Faculty Department",
        designation: "Academician / Faculty",
        open_for_consultancy: isOpen,
      });

    if (error) return { error: error.message };
  }

  revalidatePath("/mentorship");
  revalidatePath("/dashboard");

  return { data: { open_for_consultancy: isOpen } };
}
