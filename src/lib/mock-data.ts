import { createAggregatedAssessment } from "./profile";
import type { TitleRecord, TitleSeedRecord } from "./types";

export const mockTitleSeeds: TitleSeedRecord[] = [
  {
    external: {
      slug: "mondfenster",
      title: "Mondfenster",
      kind: "movie",
      year: 2024,
      synopsis:
        "Ein stilles Kammerspiel über zwei Geschwister, die nachts ein kleines Planetarium renovieren.",
      runtimeMinutes: 101,
      externalSource: "tmdb_seed",
      externalSourceId: "mv-001",
    },
    ratingSamples: {
      volumeLevel: [0, 0, 0, 1],
      peakIntensity: [1, 1, 0, 1],
      stimulusDensity: [0, 0, 0, 1],
      soothingEffect: [2, 2, 3, 2],
    },
    notes:
      "Sehr leise Grundstimmung mit langen stillen Passagen und nur einzelnen kurzen Peaks. Die Wirkung bleibt eher gesammelt als klar beruhigend.",
    contentFlags: ["Kurze Streit-Szene im letzten Drittel"],
    aggregation: {
      sourceType: "mixed",
      lastReviewedAt: "2026-03-18",
    },
  },
  {
    external: {
      slug: "hafen-ohne-eile",
      title: "Hafen ohne Eile",
      kind: "series",
      year: 2025,
      synopsis:
        "Eine ruhige Serie über Menschen, die in einem kleinen Nordseehafen Nachtschichten teilen.",
      externalSource: "tmdb_seed",
      externalSourceId: "sr-001",
    },
    ratingSamples: {
      volumeLevel: [1, 1, 1, 1, 0, 1, 1],
      peakIntensity: [1, 1, 1, 1, 0, 1, 2],
      stimulusDensity: [1, 1, 1, 1, 1, 1, 2],
      soothingEffect: [4, 4, 3, 4, 4, 4, 3],
    },
    notes:
      "Meist ruhige Hafenatmosphäre, wenige Werkstattgeräusche und seltene lautere Übergänge. Viele Einschätzungen beschreiben die Serie zugleich als deutlich regulierend.",
    contentFlags: ["Einzelne Maschinenstarts", "Meer und Wind als konstante Kulisse"],
    aggregation: {
      sourceType: "community_median",
      lastReviewedAt: "2026-03-20",
    },
  },
  {
    external: {
      slug: "nachtzug-nord",
      title: "Nachtzug Nord",
      kind: "series",
      year: 2023,
      synopsis:
        "Ein Ensemble-Drama in einem Nachtzug zwischen Kopenhagen und Tromsø mit ruhigen und angespannten Episoden.",
      externalSource: "tmdb_seed",
      externalSourceId: "sr-002",
    },
    ratingSamples: {
      volumeLevel: [2, 2, 1],
      peakIntensity: [2, 2, 3],
      stimulusDensity: [2, 3, 2],
      soothingEffect: [3, 3, 2],
    },
    notes:
      "Zuggeräusche, Durchsagen und enge Dialoge bleiben spürbar. Gleichzeitig wird der gleichmäßige Rhythmus oft als eher beruhigend beschrieben.",
    contentFlags: ["Mehrere Zugdurchsagen", "Dichte Bahnhofsgeräusche in Episode 3"],
    aggregation: {
      sourceType: "mixed",
      lastReviewedAt: "2026-03-15",
    },
  },
  {
    external: {
      slug: "zimmer-8",
      title: "Zimmer 8",
      kind: "movie",
      year: 2021,
      synopsis:
        "Ein reduzierter Mystery-Film in einem Hotel, der Spannung eher über Stille als über Schockeffekte aufbaut.",
      runtimeMinutes: 93,
      externalSource: "tmdb_seed",
      externalSourceId: "mv-002",
    },
    ratingSamples: {
      volumeLevel: [1, 1],
      peakIntensity: [2, 2],
      stimulusDensity: [1, 1],
      soothingEffect: [1, 1],
    },
    notes:
      "Die meiste Zeit ruhig, aber mit wenigen klar gesetzten Türschlägen und Schreckmomenten. Die Spannung wirkt eher wachhaltend als regulierend.",
    contentFlags: ["Zwei abrupte Türschläge", "Anhaltende Hotelatmosphäre mit Hall"],
    aggregation: {
      sourceType: "editorial_seed",
      lastReviewedAt: "2026-03-12",
    },
  },
  {
    external: {
      slug: "betonregen",
      title: "Betonregen",
      kind: "movie",
      year: 2022,
      synopsis:
        "Ein urbaner Action-Thriller mit Verfolgungsjagden, Einschlägen und vielen stark komprimierten Klanglagen.",
      runtimeMinutes: 118,
      externalSource: "tmdb_seed",
      externalSourceId: "mv-003",
    },
    ratingSamples: {
      volumeLevel: [4, 4, 4, 4, 3, 4, 4, 4],
      peakIntensity: [4, 4, 4, 3, 4, 4, 4, 4],
      stimulusDensity: [4, 4, 4, 4, 4, 3, 4, 4],
      soothingEffect: [0, 0, 1, 0, 0, 0, 0, 1],
    },
    notes:
      "Durchgehend laut, dicht und mit vielen klaren Spitzen. Für sensible Personen meist sehr belastend und kaum regulierend.",
    contentFlags: ["Mehrere Explosionen", "Verfolgungsjagden mit Sirenen", "Laute Streit-Szenen"],
    aggregation: {
      sourceType: "community_median",
      lastReviewedAt: "2026-03-21",
    },
  },
  {
    external: {
      slug: "scherbennacht",
      title: "Scherbennacht",
      kind: "series",
      year: 2026,
      synopsis:
        "Eine Crime-Miniserie mit abrupten Perspektivwechseln, sirenenlastigen Einsätzen und emotional lauten Dialogen.",
      externalSource: "tmdb_seed",
      externalSourceId: "sr-003",
    },
    ratingSamples: {
      volumeLevel: [3],
      peakIntensity: [4],
      stimulusDensity: [3],
      soothingEffect: [0],
    },
    notes:
      "Immer wieder laut und unruhig, die bisherige Datenbasis ist noch klein und die Wirkung wird eher nicht als regulierend erlebt.",
    contentFlags: ["Sirenen", "Intensive Streitgespräche", "Mehrere unerwartete Alarmtöne"],
    aggregation: {
      sourceType: "mixed",
      lastReviewedAt: "2026-03-19",
    },
  },
];

export const mockTitles: TitleRecord[] = mockTitleSeeds.map((title) => {
  const assessment = createAggregatedAssessment({
    ratings: title.ratingSamples,
    notes: title.notes,
    sourceType: title.aggregation.sourceType,
    lastReviewedAt: title.aggregation.lastReviewedAt,
  });

  return {
    external: title.external,
    stimulusProfile: assessment.stimulusProfile,
    soothingEffect: assessment.soothingEffect,
    contentFlags: title.contentFlags,
    aggregation: assessment.aggregation,
  };
});
