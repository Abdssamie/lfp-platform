import { createFileRoute } from "@tanstack/react-router";
import BTMSPage from "@/app/btms/page";

export const Route = createFileRoute("/{-$locale}/btms")({
  component: BTMSPage,
});
