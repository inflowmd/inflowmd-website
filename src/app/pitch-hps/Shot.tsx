/**
 * One real capture, served as pre-optimized AVIF with a WebP fallback.
 * `ratio` is the capture's true pixel ratio, so the box is reserved before the
 * image arrives and nothing shifts. Ratios differ between captures and are
 * declared per asset — this page never claims they share a viewport.
 */
export default function Shot({
  base, widths, ratio, alt, sizes, priority = false,
}: {
  base: string; widths: readonly number[]; ratio: string; alt: string;
  sizes: string; priority?: boolean;
}) {
  const set = (ext: string) => widths.map((w) => `/pitch-hps/${base}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/pitch-hps/${base}-${widths[widths.length - 1]}.webp`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        style={{ aspectRatio: ratio }}
      />
    </picture>
  );
}
