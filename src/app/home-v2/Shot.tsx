/**
 * One captured screen, served as pre-optimized AVIF with a WebP fallback.
 *
 * The variants are generated ahead of time into public/home-v2/ rather than
 * optimized at request time, so the bytes on the wire are known and can be
 * reported exactly. `ratio` comes from the source capture's real pixel
 * dimensions, so the box is reserved before the image arrives and nothing
 * shifts. Aspect ratios are never altered — no cropping, no stretching.
 */
export default function Shot({
  base,
  widths,
  ratio,
  alt,
  sizes,
  priority = false,
  className,
}: {
  base: string;
  widths: readonly number[];
  ratio: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const srcset = (ext: string) =>
    widths.map((w) => `/home-v2/${base}-${w}.${ext} ${w}w`).join(", ");
  const fallback = `/home-v2/${base}-${widths[widths.length - 1]}.webp`;

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        /* Empty alt means decorative; such an image must also be hidden from
           assistive tech rather than announced as an unlabelled graphic. */
        aria-hidden={alt === "" ? true : undefined}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        style={{ aspectRatio: ratio }}
      />
    </picture>
  );
}
