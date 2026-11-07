import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { NightField } from "@/components/hayvra/logo-stage";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HAYVRA — Intelligent Hospitality Platform" },
      {
        name: "description",
        content:
          "HAYVRA is a Saudi-born intelligent hospitality platform. It connects the guest journey with hotel operations, marketing, and rewards on top of the systems a property already uses, including Oracle OPERA where it is in place, without replacing them.",
      },
      { name: "theme-color", content: "#0B1420" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <html lang="en" dir="ltr" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <NightField />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="kicker" lang="en" dir="ltr">
          HAYVRA
        </p>
        <h1 className="mt-4 text-4xl font-light">This page does not exist</h1>
        <a className="btn btn-gold mt-8" href="/">
          Back to HAYVRA
        </a>
      </div>
    </main>
  );
}
