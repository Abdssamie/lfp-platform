import { createFileRoute } from "@tanstack/react-router";
import StandardsPage from "@/app/standards/page";

export const Route = createFileRoute("/{-$locale}/standards")({
  component: StandardsPage,
});
