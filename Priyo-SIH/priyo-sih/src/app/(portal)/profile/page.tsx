import React from "react";
import { getUserFullProfile } from "@/queries/profile";
import { ProfileEditor } from "./profile-editor";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Profile | SkillBridge",
  description: "View and edit your profile credentials, career goals, and organizational details.",
};

export default async function ProfilePage() {
  const profile = await getUserFullProfile();

  if (!profile) {
    redirect("/login");
  }

  return <ProfileEditor initialProfile={profile} />;
}
