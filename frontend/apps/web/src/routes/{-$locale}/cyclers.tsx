import { createFileRoute } from "@tanstack/react-router";
import CyclersPage from "@/app/cyclers/page";

export const Route = createFileRoute("/{-$locale}/cyclers")({
  component: CyclersPage,
});
