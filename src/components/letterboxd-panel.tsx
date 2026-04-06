import type { LetterboxdFilmState } from "@/lib/letterboxd";

type LetterboxdPanelProps = {
  heading?: string;
  state: LetterboxdFilmState;
};

function formatAverageRating(value: number): string {
  return `${value.toFixed(1).replace(".", ",")} / 5`;
}

export function LetterboxdPanel({
  heading = "Bei Letterboxd",
  state,
}: LetterboxdPanelProps) {
  return (
    <section className="letterboxd-panel" aria-labelledby="letterboxd-heading">
      <div className="letterboxd-head">
        <h3 id="letterboxd-heading">{heading}</h3>
        <p className="field-note">Ein Zusatzblick von außen. Nicht Teil der null-noise-Einordnung.</p>
      </div>

      {state.kind === "success" ? (
        <>
          <p className="letterboxd-message">{state.message}</p>
          {state.averageRating !== null || state.top250Position !== null || state.filmName ? (
            <dl className="letterboxd-meta-grid">
              {state.filmName ? (
                <div>
                  <dt>Dort gelistet als</dt>
                  <dd>{state.filmName}</dd>
                </div>
              ) : null}
              {state.averageRating !== null ? (
                <div>
                  <dt>Durchschnitt</dt>
                  <dd>{formatAverageRating(state.averageRating)}</dd>
                </div>
              ) : null}
              {state.top250Position !== null ? (
                <div>
                  <dt>Top 250</dt>
                  <dd>#{state.top250Position}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </>
      ) : (
        <p className="field-note letterboxd-message">{state.message}</p>
      )}

      <p className="letterboxd-action">
        <a href={state.websiteUrl} rel="noreferrer" target="_blank">
          Bei Letterboxd öffnen
        </a>
      </p>
    </section>
  );
}
