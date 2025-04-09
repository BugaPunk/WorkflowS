import type { PageProps } from "$fresh/server.ts";

export default function App({ Component, url }: PageProps) {
  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = url.pathname;
    if (path === "/") return "Home - WorkflowS";
    // Convert path to title case (e.g., /about -> About)
    const title = path.split("/").pop() || "";
    return title.charAt(0).toUpperCase() + title.slice(1) + " - WorkflowS";
  };

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{getPageTitle()}</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body class="font-sans">
        <Component />
      </body>
    </html>
  );
}
