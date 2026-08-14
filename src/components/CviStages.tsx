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
  /** The clinical colour ramp, blue through amber to red. */
  color: string;
}

export const CVI_STAGES: readonly CviStage[] = [
  { stage: 1, name: "Spider Veins", desc: "Small, visible veins beneath the skin", color: "#7db4f7" },
  { stage: 2, name: "Varicose Veins", desc: "Bulging, twisted veins causing discomfort", color: "#2D6CDF" },
  { stage: 3, name: "Skin Changes", desc: "Swelling, discoloration around ankles", color: "#f59e0b" },
  { stage: 4, name: "Venous Ulcers", desc: "Open wounds requiring immediate care", color: "#ef4444" },
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
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold mb-1"
              style={{ backgroundColor: item.color }}
            >
              {item.stage}
            </div>
            <p className="text-gray-900 text-[7px] font-semibold leading-tight mb-0.5">{item.name}</p>
            <p className="text-gray-400 text-[5.5px] leading-tight px-0.5">{item.desc}</p>
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
    <div className="flex w-full items-start">
      {CVI_STAGES.map((item, i) => {
        const lit = i < reached;
        return (
          <div key={item.stage} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center text-center">
              <div
                className="flex items-center justify-center rounded-full font-extrabold transition-all duration-700"
                style={{
                  width: "clamp(34px,5.4vmin,68px)",
                  height: "clamp(34px,5.4vmin,68px)",
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
                  fontSize: "clamp(13px,1.9vmin,26px)",
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
                className="flex items-center transition-colors duration-700"
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
