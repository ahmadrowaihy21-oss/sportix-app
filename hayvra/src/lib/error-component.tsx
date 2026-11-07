import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-navy px-6 text-center text-ivory">
      <div>
        <p className="kicker" lang="en" dir="ltr">
          HAYVRA
        </p>
        <h1 className="mt-4 text-3xl font-light">The page could not be shown</h1>
        <p className="quiet mx-auto mt-4 max-w-md text-sm break-words">{errorMessage(error)}</p>
      </div>
    </main>
  );
}
