import { record } from "./content";

/**
 * The one recurring practice record, in three states.
 *
 * It is the same component and the same facts every time it appears — the
 * reader is meant to follow one record through the page, not meet three
 * unrelated mock-ups. The name and contact details are obvious placeholders
 * so this can never be read as a real clinic, and the label above the card
 * says so in words on every instance.
 *
 * `lit` highlights one zone for the performance scene. It is presentational
 * only: nothing is added or removed from the card, so no information is ever
 * hidden behind a state the reader cannot reach.
 */
export type RecordZone = "identity" | "contact" | "care" | "next" | null;

export default function PracticeRecord({
  lit = null,
  showNextStep = false,
  nextStepLabel,
  questions,
  questionsLabel,
  affordanceNote,
}: {
  lit?: RecordZone;
  showNextStep?: boolean;
  nextStepLabel?: string;
  /** State C: the same record, carrying educational questions instead of
      its contact fields. The identity above them is unchanged, which is the
      whole reason this is one component and not three cards. */
  questions?: string[];
  questionsLabel?: string;
  affordanceNote?: string;
}) {
  return (
    <figure className="hv2-record" style={{ margin: 0 }}>
      <figcaption className="hv2-record-tag">{record.illustrationLabel}</figcaption>
      <div className="hv2-record-body">
        <div className="hv2-record-zone" data-lit={lit === "identity" ? "true" : undefined}>
          <div className="hv2-record-name">{record.name}</div>
          <div className="hv2-record-specialty" data-lit={lit === "care" ? "true" : undefined}>
            {record.specialty}
          </div>
        </div>

        {questions ? (
          <>
            <div className="hv2-q-label">{questionsLabel}</div>
            <ul className="hv2-q-list">
              {questions.map((q) => (
                <li key={q} className="hv2-q">
                  {q}
                </li>
              ))}
            </ul>
          </>
        ) : (
        <dl className="hv2-record-fields">
          <div className="hv2-field hv2-record-zone" data-lit={lit === "contact" ? "true" : undefined}>
            <dt>Address</dt>
            <dd>
              {record.street}
              <br />
              {record.city}
            </dd>
          </div>
          <div className="hv2-field">
            <dt>Phone</dt>
            <dd>{record.phone}</dd>
          </div>
          <div className="hv2-field">
            <dt>Hours</dt>
            <dd>{record.hours}</dd>
          </div>
          <div className="hv2-field">
            <dt>Website</dt>
            <dd>{record.site}</dd>
          </div>
        </dl>
        )}

        {showNextStep && (
          <div
            className="hv2-affordance hv2-record-zone"
            data-lit={lit === "next" ? "true" : undefined}
          >
            <span className="hv2-affordance-cue">{nextStepLabel}</span>
            {affordanceNote && <p className="hv2-caption">{affordanceNote}</p>}
          </div>
        )}
      </div>
    </figure>
  );
}
