import { describe, expect, it } from "vitest";

import {
  createMetadataInferencePreview,
  deriveMetadataInferenceAssessment,
} from "./metadata-inference";

describe("metadata inference", () => {
  it("creates a cautious but non-neutral start basis when metadata signals conflict and intensity", () => {
    const assessment = deriveMetadataInferenceAssessment({
      externalSource: "tmdb",
      externalId: "tmdb:movie:991001",
      sourceId: 991001,
      title: "Feuerlinie",
      originalTitle: "Feuerlinie",
      mediaType: "movie",
      releaseYear: 2024,
      synopsis: "Ein Team gerät zwischen Sirenen, Verfolgung und Explosionen unter Druck.",
      posterPath: "/feuerlinie.jpg",
      genres: ["Action", "Thriller"],
    });

    expect(assessment.signalState).toBe("supported");
    expect(assessment.ratingSamples.volumeLevel[0]).toBeGreaterThanOrEqual(2);
    expect(assessment.ratingSamples.peakIntensity[0]).toBe(3);
    expect(assessment.ratingSamples.stimulusDensity[0]).toBeGreaterThanOrEqual(2);
    expect(assessment.ratingSamples.soothingEffect[0]).toBeLessThanOrEqual(2);
    expect(assessment.notes).toContain("eher vorsichtige Passung");
    expect(assessment.notes).toContain("Keine Szenenprüfung");
    expect(assessment.evidenceSummary.status).toBe("Mehrere Hinweise");
  });

  it("keeps very thin metadata close to a neutral start basis without pretending certainty", () => {
    const preview = createMetadataInferencePreview({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit ausserirdischen Besuchern.",
      posterPath: null,
    });

    expect(preview.signalState).toBe("thin");
    expect(preview.stimulusProfile.volumeLevel).toBe(2);
    expect(preview.stimulusProfile.peakIntensity).toBe(2);
    expect(preview.stimulusProfile.stimulusDensity).toBe(2);
    expect(preview.soothingEffect).toBe(2);
    expect(preview.notes).toContain("Keine deutlichen Hinweise gefunden");
    expect(preview.notes).toContain("keine Entwarnung");
  });

  it("uses mapped TMDb genres to create a usable first assessment even when the synopsis stays thin", () => {
    const preview = createMetadataInferencePreview({
      externalSource: "tmdb",
      externalId: "tmdb:movie:888001",
      sourceId: 888001,
      title: "Sturmfront",
      mediaType: "movie",
      releaseYear: 2025,
      synopsis: "Ein Einsatz gerät außer Kontrolle.",
      posterPath: null,
      genres: ["Action", "War"],
    });

    expect(preview.signalState).toBe("supported");
    expect(preview.stimulusProfile.volumeLevel).toBeGreaterThanOrEqual(2);
    expect(preview.stimulusProfile.peakIntensity).toBe(3);
    expect(preview.stimulusProfile.stimulusDensity).toBe(3);
    expect(preview.notes).toContain("eher vorsichtige Passung");
    expect(preview.notes).toContain("Keine Szenenprüfung");
  });
});
