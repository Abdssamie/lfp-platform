import { LocalizedLink } from "@/components/localized-link";

export function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="text-muted-foreground text-sm">The page you were looking for doesn't exist.</p>
      <LocalizedLink to="/" className="text-primary underline-offset-4 hover:underline text-sm">
        Go back home
      </LocalizedLink>
    </div>
  );
}
