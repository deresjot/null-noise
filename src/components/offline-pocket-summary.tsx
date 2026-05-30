"use client";

import { useEffect, useState } from "react";

import {
  listPocketEntries,
  type TitlePocketEntry,
  type TitlePocketKind,
} from "@/lib/title-pocket";

type PocketGroup = {
  items: TitlePocketEntry[];
  kind: TitlePocketKind;
  title: string;
};

function readOfflinePocketGroups(): PocketGroup[] {
  return [
    {
      kind: "remembered",
      title: "Für später gemerkt",
      items: listPocketEntries("remembered").slice(0, 4),
    },
    {
      kind: "seen",
      title: "Schon gesehen",
      items: listPocketEntries("seen").slice(0, 4),
    },
  ];
}

export function OfflinePocketSummary() {
  const [groups, setGroups] = useState<PocketGroup[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setGroups(readOfflinePocketGroups());
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const visibleGroups = groups.filter((group) => group.items.length > 0);

  return (
    <section
      className="panel offline-panel offline-pocket-static"
      aria-labelledby="offline-pocket-heading"
    >
      <h2 id="offline-pocket-heading">Lokaler Stand</h2>
      {visibleGroups.length ? (
        <>
          <p className="field-note">Lokale Titel aus diesem Browser:</p>
          <div className="offline-pocket-groups">
            {visibleGroups.map((group) => (
              <section className="offline-pocket-group" key={group.kind}>
                <h3>{group.title}</h3>
                <ul className="offline-pocket-list">
                  {group.items.map((entry) => (
                    <li key={`${group.kind}-${entry.key}`}>
                      <article className="offline-pocket-item">
                        <a href={entry.href.startsWith("/") ? entry.href : "/"}>{entry.title}</a>
                        <p className="field-note">{entry.meta}</p>
                        <p className="field-note">{entry.toneLabel}</p>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : (
        <p className="field-note">
          In diesem Browser ist noch nichts gemerkt oder als gesehen markiert.
        </p>
      )}
    </section>
  );
}
