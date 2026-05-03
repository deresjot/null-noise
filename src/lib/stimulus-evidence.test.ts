import { describe, expect, it } from "vitest";

import {
  aggregateStimulusEvidence,
  createTmdbEvidenceDebugSummary,
  deriveTmdbStimulusEvidence,
  getCommonSenseMediaEvidence,
  getDoesTheDogDieEvidence,
  type StimulusEvidence,
} from "./stimulus-evidence";
import type { MetadataSpikeTitle } from "./metadata-spike";

function createEvidence(overrides: Partial<StimulusEvidence>): StimulusEvidence {
  return {
    axis: "stimulus_density",
    source: "tmdb",
    direction: "mixed",
    strength: 1,
    confidence: "weak",
    signal: "Testsignal",
    explanation: "Testhinweis.",
    ...overrides,
  };
}

function mockTitle(input: {
  title: string;
  synopsis: string;
  genres?: string[];
  keywords?: string[];
  mediaType?: "movie" | "series";
}): MetadataSpikeTitle {
  return {
    externalSource: "tmdb",
    externalId: `tmdb:${input.mediaType ?? "movie"}:${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    sourceId: Math.abs(input.title.split("").reduce((total, char) => total + char.charCodeAt(0), 0)),
    title: input.title,
    mediaType: input.mediaType ?? "movie",
    releaseYear: 2024,
    synopsis: input.synopsis,
    posterPath: null,
    genres: input.genres,
    keywords: input.keywords,
  };
}

describe("stimulus evidence", () => {
  it("maps TMDb genres and keywords into cautious evidence", () => {
    const evidence = deriveTmdbStimulusEvidence({
      externalSource: "tmdb",
      externalId: "tmdb:movie:991001",
      sourceId: 991001,
      title: "Feuerlinie",
      mediaType: "movie",
      releaseYear: 2024,
      synopsis: "Ein Team geraet unter Druck.",
      posterPath: null,
      genres: ["Action", "Thriller"],
      keywords: ["explosion", "gunfight", "chase"],
    });

    expect(evidence.some((item) => item.axis === "audio_peaks")).toBe(true);
    expect(evidence.some((item) => item.axis === "stimulus_density")).toBe(true);
    expect(evidence.every((item) => item.source === "tmdb")).toBe(true);
    expect(evidence.some((item) => item.confidence === "medium")).toBe(true);
  });

  it("keeps contradictory evidence mixed instead of forcing a direction", () => {
    const summary = aggregateStimulusEvidence([
      createEvidence({
        axis: "relief",
        direction: "calming",
        strength: 2,
        confidence: "medium",
        signal: "Ruhige Form",
        explanation: "Mehrere Hinweise sprechen für Ruhe.",
      }),
      createEvidence({
        axis: "audio_peaks",
        direction: "intensifying",
        strength: 2,
        confidence: "medium",
        signal: "Laute Spitzen",
        explanation: "Mehrere Hinweise sprechen für Spitzen.",
      }),
    ]);

    expect(summary.tone).toBe("mixed");
    expect(summary.note).toContain("unterschiedliche Richtungen");
  });

  it("keeps thin evidence weak and provisional", () => {
    const summary = aggregateStimulusEvidence([]);

    expect(summary.tone).toBe("mixed");
    expect(summary.confidence).toBe("weak");
    expect(summary.status).toBe("Metadatenbasis");
    expect(summary.note).toContain("Keine deutlichen Hinweise gefunden");
    expect(summary.note).toContain("keine Entwarnung");
  });

  it("resolves several strong intensifying signals as intense without exposing a score", () => {
    const summary = aggregateStimulusEvidence([
      createEvidence({
        axis: "audio_peaks",
        direction: "intensifying",
        strength: 3,
        confidence: "strong",
        signal: "Laute Spitzen",
        explanation: "Mehrere Hinweise sprechen für mögliche Spitzen.",
      }),
      createEvidence({
        axis: "emotional_load",
        direction: "intensifying",
        strength: 3,
        confidence: "medium",
        signal: "Emotionale Last",
        explanation: "Mehrere Hinweise sprechen für emotionale Last.",
      }),
    ]);

    expect(summary.tone).toBe("intense");
    expect(summary.confidence).toBe("strong");
    expect(summary.note).not.toMatch(/\d+%|score|ranking/i);
  });

  it("keeps optional Does the Dog Die evidence as noop without flag and key", async () => {
    await expect(
      getDoesTheDogDieEvidence({
        item: { title: "Arrival", externalId: "tmdb:movie:329865" },
        env: {},
      }),
    ).resolves.toEqual([]);
  });

  it("keeps optional Common Sense Media evidence as noop without flag and key", async () => {
    await expect(
      getCommonSenseMediaEvidence({
        item: { title: "Arrival", externalId: "tmdb:movie:329865" },
        env: {},
      }),
    ).resolves.toEqual([]);
  });

  describe("calibration fixtures", () => {
    const calmTitles = [
      mockTitle({
        title: "Paterson",
        synopsis: "Ein Fahrer folgt einer klaren Routine und beobachtet Alltag, Worte und stille Wege.",
        genres: ["Drama"],
        keywords: ["slice of life", "routine", "quiet", "poetry", "ordinary life"],
      }),
      mockTitle({
        title: "Perfect Days",
        synopsis: "Ein Mann lebt in ruhigen Routinen, liest, arbeitet und achtet auf kleine Naturmomente.",
        genres: ["Drama"],
        keywords: ["daily life", "routine", "quiet", "contemplative", "nature"],
      }),
      mockTitle({
        title: "Our Little Sister",
        synopsis: "Schwestern finden langsam einen gemeinsamen Alltag mit sanften Konflikten.",
        genres: ["Drama", "Family"],
        keywords: ["family", "gentle", "slice of life", "healing", "daily life"],
      }),
      mockTitle({
        title: "Columbus",
        synopsis: "Zwei Menschen gehen durch klare Raeume und sprechen leise ueber Umwege.",
        genres: ["Drama"],
        keywords: ["minimal", "contemplative", "architecture", "quiet", "clear structure"],
      }),
    ];

    const mixedTitles = [
      mockTitle({
        title: "Arrival",
        synopsis: "Ruhige Kontaktaufnahme trifft auf globale Unsicherheit und persoenliche Trauer.",
        genres: ["Drama", "Science Fiction"],
        keywords: ["contemplative", "grief", "alien contact", "military"],
      }),
      mockTitle({
        title: "Her",
        synopsis: "Eine leise Liebesgeschichte wird emotional einsam und bleibt technisch fremd.",
        genres: ["Romance", "Drama"],
        keywords: ["tender", "loneliness", "loss", "ordinary life"],
      }),
      mockTitle({
        title: "Spirited Away",
        synopsis: "Ein Kind findet magische Hilfe, erlebt aber auch Gefahr und wechselhafte Wesen.",
        genres: ["Animation", "Family", "Fantasy"],
        keywords: ["friendship", "danger", "spirit world", "survival"],
      }),
      mockTitle({
        title: "The Bear",
        synopsis: "Eine Kueche ist hektisch, eng und laut, daneben geht es um Familie und Trauer.",
        mediaType: "series",
        genres: ["Drama", "Comedy"],
        keywords: ["hectic", "panic", "grief", "family", "daily life"],
      }),
    ];

    const audioActionIntenseTitles = [
      mockTitle({
        title: "Mad Max: Fury Road",
        synopsis: "Eine lange Flucht mit Verfolgung, Explosionen und pausenlosem Druck.",
        genres: ["Action"],
        keywords: ["chase", "explosion", "battle", "relentless", "combat"],
      }),
      mockTitle({
        title: "Dunkirk",
        synopsis: "Soldaten warten unter Angriffen, Bomben und Zeitdruck auf Rettung.",
        genres: ["War", "Action"],
        keywords: ["war", "battle", "bomb", "survival", "time pressure"],
      }),
      mockTitle({
        title: "John Wick",
        synopsis: "Ein gehetzter Raecher bewegt sich durch Kaempfe und schnelle Verfolgungen.",
        genres: ["Action", "Thriller"],
        keywords: ["gunfight", "shootout", "chase", "combat"],
      }),
      mockTitle({
        title: "Tenet",
        synopsis: "Zeitdruck, Missionen und verschachtelte Action treiben die Handlung.",
        genres: ["Action", "Science Fiction"],
        keywords: ["explosion", "time pressure", "fast cutting", "mission", "chase"],
      }),
    ];

    const emotionalIntenseTitles = [
      mockTitle({
        title: "Requiem for a Dream",
        synopsis: "Abhaengigkeit, Verlust und zerfallende Hoffnung liegen schwer auf den Figuren.",
        genres: ["Drama"],
        keywords: ["addiction", "trauma", "depression", "hallucination"],
      }),
      mockTitle({
        title: "Manchester by the Sea",
        synopsis: "Ein Mann kehrt nach Verlust und Trauer in eine belastete Familie zurueck.",
        genres: ["Drama"],
        keywords: ["grief", "death", "loss", "family"],
      }),
      mockTitle({
        title: "The Whale",
        synopsis: "Krankheit, Scham und Isolation bestimmen eine sehr schwere Begegnung.",
        genres: ["Drama"],
        keywords: ["illness", "shame", "isolation", "trauma"],
      }),
      mockTitle({
        title: "Grave of the Fireflies",
        synopsis: "Kinder erleben Verlust, Hunger und Tod in einem Kriegskontext.",
        genres: ["Drama", "War"],
        keywords: ["grief", "death", "war", "children"],
      }),
    ];

    const visualIntenseTitles = [
      mockTitle({
        title: "Spider-Man: Into the Spider-Verse",
        synopsis: "Schnelle Comic-Bilder und Multiversum-Spruenge wechseln staendig die Form.",
        genres: ["Animation", "Action"],
        keywords: ["comic book", "fast cutting", "multiverse", "neon", "chaotic visuals"],
      }),
      mockTitle({
        title: "Enter the Void",
        synopsis: "Psychedelische Bilder, Halluzinationen und blinkende Raeume praegen die Form.",
        genres: ["Drama"],
        keywords: ["psychedelic", "hallucination", "strobe", "neon"],
      }),
      mockTitle({
        title: "Everything Everywhere All at Once",
        synopsis: "Chaotische Spruenge, schnelle Schnitte und Multiversum-Bilder verdichten sich.",
        genres: ["Action", "Comedy"],
        keywords: ["multiverse", "fast cutting", "chaotic visuals", "flashing"],
      }),
    ];

    it("keeps quiet profiles calm or mildly mixed with positive relief and predictability evidence", () => {
      for (const title of calmTitles) {
        const summary = createTmdbEvidenceDebugSummary(title);

        expect(["calm", "mixed"]).toContain(summary.tendency);
        expect(summary.tendency).not.toBe("intense");
        expect(summary.axes.relief?.direction).toBe("calming");
        expect(
          summary.axes.predictability?.direction === "calming" || summary.axes.relief?.confidence === "medium",
        ).toBe(true);
        expect(summary.status).not.toContain("eher vorsichtige Passung");
      }
    });

    it("keeps mixed profiles mixed and names ambivalence when calm form and heavier signals meet", () => {
      for (const title of mixedTitles) {
        const summary = createTmdbEvidenceDebugSummary(title);

        expect(summary.tendency).toBe("mixed");
        expect(summary.status).toContain("unterschiedliche Richtungen");
        expect(summary.reasons.length).toBeGreaterThan(1);
      }
    });

    it("separates audio and density intensive profiles from generic action genre", () => {
      for (const title of audioActionIntenseTitles) {
        const summary = createTmdbEvidenceDebugSummary(title);

        expect(summary.tendency).toBe("intense");
        expect(
          summary.axes.audio_peaks?.direction === "intensifying" ||
            summary.axes.stimulus_density?.direction === "intensifying" ||
            summary.axes.predictability?.direction === "intensifying",
        ).toBe(true);
        expect(summary.reasons.join(" ")).toMatch(/Spitzen|Druck|Dichte|Vorhersehbarkeit/i);
      }
    });

    it("marks emotionally intensive profiles without inventing audio peaks", () => {
      for (const title of emotionalIntenseTitles) {
        const summary = createTmdbEvidenceDebugSummary(title);

        expect(summary.tendency).toBe("intense");
        expect(summary.axes.emotional_load?.direction).toBe("intensifying");
        expect(summary.axes.audio_peaks).toBeUndefined();
        expect(summary.reasons.join(" ")).toMatch(/emotional|belastendere|schwerere/i);
      }
    });

    it("marks visually dense profiles through visual intensity, not only audio peaks", () => {
      for (const title of visualIntenseTitles) {
        const summary = createTmdbEvidenceDebugSummary(title);

        expect(summary.tendency).toBe("intense");
        expect(summary.axes.visual_intensity?.direction).toBe("intensifying");
        expect(summary.reasons.join(" ")).toMatch(/visuell|Dichte/i);
      }
    });

    it("keeps thin metadata weak, provisional and away from hard certainty", () => {
      const summary = createTmdbEvidenceDebugSummary(
        mockTitle({
          title: "Sparse Metadata",
          synopsis: "Eine knappe Beschreibung ohne klare Hinweise.",
        }),
      );

      expect(summary.tendency).toBe("mixed");
      expect(summary.confidence).toBe("weak");
      expect(summary.status).toContain("Keine deutlichen Hinweise gefunden");
      expect(summary.status).toContain("keine Entwarnung");
      expect(summary.status).not.toMatch(/\d+%|Score|Ranking/i);
    });
  });
});
