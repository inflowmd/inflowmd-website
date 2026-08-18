/**
 * The stages of venous disease, in one place.
 *
 * This lived inline inside the homepage's browser mockup. The pitch deck needs
 * the same progression at booth scale, and two copies of a clinical sequence
 * is exactly the kind of thing that drifts — one gets a stage renamed and the
 * other does not. The data is now shared; only the presentation differs.
 *
 * `mockup` renders the original markup verbatim, so the homepage is unchanged.
 * `stage` is the pitch-deck treatment: large, on navy, with a lime accent that
 * advances along the progression as the screen comes up.
 */

export interface CviStage {
  stage: number;
  name: string;
  desc: string;
  /** The clinical colour ramp, blue through teal and amber to red. */
  color: string;
  /** The practice's own progression photograph, paired as they pair them. */
  image: string;
}

/**
 * Five stages, matching the progression Center For Vein Care publishes. The
 * photographs are theirs, copied from that project and paired to the same
 * stages they pair them to.
 *
 * Stage 3's description is OURS, not the practice's — their own note marks the
 * copy for stages three to five as authored and awaiting sign-off, so this
 * stays descriptive of the stage name and claims nothing further. Stage 4's
 * wording lost the word "swelling" when stage 3 arrived; two consecutive
 * stages both leading on swelling read as a duplicate rather than a
 * progression.
 */
export const CVI_STAGES: readonly CviStage[] = [
  {
    stage: 1,
    name: "Spider Veins",
    desc: "Small, visible veins beneath the skin",
    color: "#7db4f7",
    image: "/cvi/stage-1-clear.webp",
  },
  {
    stage: 2,
    name: "Varicose Veins",
    desc: "Bulging, twisted veins causing discomfort",
    color: "#2D6CDF",
    image: "/cvi/stage-2-spider.webp",
  },
  {
    stage: 3,
    name: "Swelling of Legs and Ankles",
    desc: "Legs and ankles swell as pressure builds",
    color: "#0ea5a4",
    image: "/cvi/stage-3-reticular.webp",
  },
  {
    stage: 4,
    name: "Skin Changes",
    desc: "Discoloration and hardening around the ankles",
    color: "#f59e0b",
    image: "/cvi/stage-4-discoloration.webp",
  },
  {
    stage: 5,
    name: "Venous Ulcers",
    desc: "Open wounds requiring immediate care",
    color: "#ef4444",
    image: "/cvi/stage-5-trophic.webp",
  },
];

const LIME = "#84B83B";

function Arrow({ className, size }: { className: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** The homepage mockup treatment — unchanged from where it used to live. */
function MockupStages() {
  return (
    <div className="flex items-start gap-0">
      {CVI_STAGES.map((item, i) => (
        <div key={item.stage} className="flex items-start flex-1">
          <div className="flex flex-col items-center text-center flex-1">
            {/* Supporting imagery, deliberately tiny — the mockup is a
                thumbnail of a website, not the website. Lazy because the
                Showcase section sits well below the fold. */}
            <img
              src={item.image}
              alt=""
              aria-hidden
              loading="lazy"
              width={700}
              height={1000}
              className="mb-1 h-[26px] w-auto rounded-[2px] object-cover"
            />
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[6px] font-bold mb-1"
              style={{ backgroundColor: item.color }}
            >
              {item.stage}
            </div>
            <p className="text-gray-900 text-[6px] font-semibold leading-tight mb-0.5">{item.name}</p>
            <p className="text-gray-400 text-[5px] leading-tight px-0.5">{item.desc}</p>
          </div>
          {i < CVI_STAGES.length - 1 && (
            <div className="flex items-center pt-2.5 px-0.5 text-gray-300">
              <Arrow className="" size={8} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * The pitch treatment. `reached` is how far along the progression the lime
 * accent has travelled; the deck raises it one stage at a time on entry so the
 * sequence reads as a progression rather than as four labels.
 */
function StageStages({ reached }: { reached: number }) {
  return (
    <div className="pitch-stage-row flex w-full items-start">
      {CVI_STAGES.map((item, i) => {
        const lit = i < reached;
        return (
          <div key={item.stage} className="pitch-stage-item flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center text-center">
              {/* Supporting, not the focus: small enough that the progression
                  still reads as a sequence of stages rather than a gallery. */}
              <img
                src={item.image}
                alt=""
                aria-hidden
                width={700}
                height={1000}
                draggable={false}
                className="mb-[1.4vmin] w-auto rounded-[0.6vmin] object-cover transition-opacity duration-700"
                style={{ height: "clamp(56px,11vmin,150px)", opacity: lit ? 1 : 0.3 }}
              />
              <div
                className="flex items-center justify-center rounded-full font-extrabold transition-all duration-700"
                style={{
                  width: "clamp(28px,4.4vmin,56px)",
                  height: "clamp(28px,4.4vmin,56px)",
                  fontSize: "clamp(15px,2.2vmin,28px)",
                  // Unreached stages keep the clinical colour but sit back;
                  // the lime ring is what says "you are here".
                  background: item.color,
                  color: "#fff",
                  opacity: lit ? 1 : 0.28,
                  boxShadow: lit ? `0 0 0 clamp(3px,0.5vmin,6px) ${LIME}` : "none",
                  transform: lit ? "scale(1)" : "scale(0.9)",
                }}
              >
                {item.stage}
              </div>
              <p
                className="mt-[1.4vmin] font-bold leading-tight transition-opacity duration-700"
                style={{
                  fontSize: "clamp(12px,1.7vmin,24px)",
                  color: "#fff",
                  opacity: lit ? 1 : 0.35,
                }}
              >
                {item.name}
              </p>
              <p
                className="mt-[0.6vmin] max-w-[9em] leading-snug transition-opacity duration-700"
                style={{
                  fontSize: "clamp(10px,1.35vmin,18px)",
                  color: "rgba(255,255,255,0.55)",
                  opacity: lit ? 1 : 0.25,
                }}
              >
                {item.desc}
              </p>
            </div>
            {i < CVI_STAGES.length - 1 && (
              <div
                className="pitch-stage-arrow flex items-center transition-colors duration-700"
                style={{
                  paddingTop: "clamp(12px,2vmin,26px)",
                  color: i < reached - 1 ? LIME : "rgba(255,255,255,0.18)",
                }}
              >
                <Arrow className="" size={18} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CviStages({
  variant = "mockup",
  reached = CVI_STAGES.length,
}: {
  variant?: "mockup" | "stage";
  /** `stage` variant only: how many stages the lime accent has reached. */
  reached?: number;
}) {
  return variant === "mockup" ? <MockupStages /> : <StageStages reached={reached} />;
}
