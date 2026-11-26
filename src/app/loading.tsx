/*
 * Shown while a page is still on its way (mostly when moving between pages).
 *
 * It takes up the screen's height in the normal page flow. Before, this was
 * the full-screen brand splash, which takes no room on the page, so while the
 * page streamed in the footer sat at the top of the screen and then jumped
 * down: speed tests counted that as a big layout shift (0.6 on desktop).
 * The brand splash itself now lives in components/layout/BrandSplash.tsx.
 */
export default function Loading() {
  return (
    <div className="relative min-h-screen bg-bg-page" aria-busy="true">
      <div className="absolute top-0 left-0 h-0.5 w-full bg-golden animate-progress" />
    </div>
  );
}
