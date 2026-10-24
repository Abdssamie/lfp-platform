import { createFileRoute } from "@tanstack/react-router";
import FormationPage from "@/app/formation/page";

export const Route = createFileRoute("/{-$locale}/formation")({
  component: FormationPage,
});
