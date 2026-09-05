import { getPlacementDrives } from "@/queries/institution";
import { PlacementDrivesView } from "./placement-drives-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placement Drives | Institutional Portal",
  description: "View and manage campus recruitment drives and partner opportunities.",
};

export default async function PlacementDrivesPage() {
  const drives = await getPlacementDrives();

  return <PlacementDrivesView drives={drives} />;
}
