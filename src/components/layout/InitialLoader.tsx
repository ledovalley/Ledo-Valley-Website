import BrandSplash from "@/components/layout/BrandSplash";

/*
 * Brand splash on the first visit of a session.
 *
 * It runs on a fixed timer in plain CSS (see #lv-splash in globals.css):
 * shown for about 1.2 seconds, then fades out, whether or not the site's
 * JavaScript has loaded. Before, it waited for all the JavaScript, which on
 * a phone meant several seconds of splash and a poor speed score.
 *
 * Repeat pages in the same session skip it: a tiny script in <head>
 * (see layout.tsx) marks the visit before anything is drawn.
 *
 * The page is always rendered underneath, so search engines and link
 * previews see the real content. To switch the splash off, remove
 * <InitialLoader> from layout.tsx (keep its children).
 */
export default function InitialLoader({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div id="lv-splash" aria-hidden="true">
        <BrandSplash />
      </div>
    </>
  );
}
