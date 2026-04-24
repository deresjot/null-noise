import { createAggregatedAssessment } from "@/lib/profile";
import { normalizeSearchText } from "@/lib/search";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { RatingSampleSet, ScaleValue } from "@/lib/types";

type MetadataSeedSignal = "calm" | "intense";
type MetadataSeedAxis = "volumeLevel" | "peakIntensity" | "stimulusDensity" | "soothingEffect";
type MetadataSeedScores = Record<MetadataSeedAxis, number>;
type MetadataSeedSignalState = "thin" | "mixed" | "supported";
type MetadataSeedRule = {
  needles: string[];
  signal: MetadataSeedSignal;
  deltas: Partial<Record<MetadataSeedAxis, number>>;
};

type MetadataInferenceAssessment = {
  ratingSamples: RatingSampleSet;
  notes: string;
  signalState: MetadataSeedSignalState;
};

// Hinweis für spätere Iterationen:
// Altersfreigaben (z. B. FSK) sind kein Reizlast-Proxy und werden hier bewusst nicht als harter Treiber genutzt.

const metadataGenreRules: MetadataSeedRule[] = [
  {
    needles: ["action"],
    signal: "intense",
    deltas: {
      volumeLevel: 0.35,
      peakIntensity: 0.45,
      stimulusDensity: 0.35,
      soothingEffect: -0.1,
    },
  },
  {
    needles: ["horror"],
    signal: "intense",
    deltas: {
      peakIntensity: 0.7,
      stimulusDensity: 0.45,
      soothingEffect: -0.4,
    },
  },
  {
    needles: ["thriller"],
    signal: "intense",
    deltas: {
      peakIntensity: 0.4,
      stimulusDensity: 0.3,
      soothingEffect: -0.2,
    },
  },
  {
    needles: ["krieg", "war"],
    signal: "intense",
    deltas: {
      volumeLevel: 0.45,
      peakIntensity: 0.55,
      stimulusDensity: 0.55,
      soothingEffect: -0.35,
    },
  },
  {
    needles: ["krimi", "crime"],
    signal: "intense",
    deltas: {
      peakIntensity: 0.15,
      stimulusDensity: 0.25,
      soothingEffect: -0.15,
    },
  },
  {
    needles: ["mystery", "mysterium"],
    signal: "intense",
    deltas: {
      peakIntensity: 0.15,
      stimulusDensity: 0.2,
      soothingEffect: -0.1,
    },
  },
  {
    needles: ["documentary", "dokumentarfilm"],
    signal: "calm",
    deltas: {
      volumeLevel: -0.25,
      peakIntensity: -0.4,
      stimulusDensity: -0.3,
      soothingEffect: 0.2,
    },
  },
  {
    needles: ["family", "familie"],
    signal: "calm",
    deltas: {
      peakIntensity: -0.2,
      stimulusDensity: -0.2,
      soothingEffect: 0.15,
    },
  },
  {
    needles: ["animation"],
    signal: "calm",
    deltas: {
      peakIntensity: -0.1,
      stimulusDensity: -0.1,
      soothingEffect: 0.1,
    },
  },
  {
    needles: ["romance", "liebe", "romantik"],
    signal: "calm",
    deltas: {
      peakIntensity: -0.1,
      stimulusDensity: -0.15,
      soothingEffect: 0.15,
    },
  },
];

const metadataOverviewIntensityRules: MetadataSeedRule[] = [
  {
    needles: [
      "explosion",
      "explosionen",
      "sirene",
      "sirenen",
      "alarm",
      "angriff",
      "attack",
      "anschlag",
      "verfolg",
      "jagd",
      "survival",
      "uberleben",
      "terror",
      "panik",
      "panic",
      "chaos",
      "kampf",
      "chase",
      "scream",
      "explosive",
      "invasion",
      "bomb",
      "militar",
      "helicopter",
      "absturz",
      "crash",
      "gunfire",
      "shootout",
    ],
    signal: "intense",
    deltas: {
      volumeLevel: 0.25,
      peakIntensity: 0.55,
      stimulusDensity: 0.35,
      soothingEffect: -0.25,
    },
  },
  {
    needles: [
      "horror",
      "mord",
      "murder",
      "killer",
      "gewalt",
      "violent",
      "bedroh",
      "duster",
      "dystop",
      "spannung",
      "spannungs",
      "attacke",
      "danger",
      "threat",
      "pressure",
      "apokal",
      "katastroph",
      "disaster",
      "surviv",
      "escape",
    ],
    signal: "intense",
    deltas: {
      peakIntensity: 0.3,
      stimulusDensity: 0.3,
      soothingEffect: -0.3,
    },
  },
];

const metadataKeywordSignalRules: MetadataSeedRule[] = [
  {
    needles: [
      "hostage",
      "geisel",
      "heist",
      "uberfall",
      "raub",
      "mission",
      "rescue",
      "rettung",
      "investigation",
      "ermittl",
      "kidnapp",
      "rebell",
      "insurg",
      "collaps",
      "storm",
      "earthquake",
      "tsunami",
    ],
    signal: "intense",
    deltas: {
      volumeLevel: 0.15,
      peakIntensity: 0.35,
      stimulusDensity: 0.3,
      soothingEffect: -0.15,
    },
  },
  {
    needles: [
      "portrait",
      "alltag",
      "daily life",
      "coming-of-age",
      "freundschaft",
      "friendship",
      "retreat",
      "healing",
      "heilung",
      "wandern",
      "walk",
      "letters",
      "tagebuch",
      "slow",
      "stillness",
      "quietly",
    ],
    signal: "calm",
    deltas: {
      volumeLevel: -0.15,
      peakIntensity: -0.25,
      stimulusDensity: -0.2,
      soothingEffect: 0.15,
    },
  },
];

const metadataCalmingTextRules: MetadataSeedRule[] = [
  {
    needles: [
      "ruhig",
      "stille",
      "still",
      "sanft",
      "meditativ",
      "kontemplativ",
      "beobacht",
      "natur",
      "landschaft",
      "meer",
      "hafen",
      "wald",
      "reise",
      "reisen",
      "quiet",
      "gentle",
      "calm",
      "meditative",
      "contemplative",
      "nature",
      "travel",
      "reflective",
      "tender",
      "observational",
      "slow cinema",
    ],
    signal: "calm",
    deltas: {
      volumeLevel: -0.45,
      peakIntensity: -0.55,
      stimulusDensity: -0.35,
      soothingEffect: 0.35,
    },
  },
];

const metadataTextureTextRules: MetadataSeedRule[] = [
  {
    needles: ["laut", "noisy", "drone", "industrial", "hectic", "relentless"],
    signal: "intense",
    deltas: {
      volumeLevel: 0.3,
      stimulusDensity: 0.25,
    },
  },
  {
    needles: ["intim", "intimate", "leise", "soft", "minimal"],
    signal: "calm",
    deltas: {
      volumeLevel: -0.2,
      peakIntensity: -0.15,
      stimulusDensity: -0.15,
      soothingEffect: 0.1,
    },
  },
];

function createMetadataSeedScores(): MetadataSeedScores {
  return {
    volumeLevel: 0,
    peakIntensity: 0,
    stimulusDensity: 0,
    soothingEffect: 0,
  };
}

function matchesMetadataRule(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function applyMetadataRule(scores: MetadataSeedScores, rule: MetadataSeedRule): void {
  for (const [key, value] of Object.entries(rule.deltas) as Array<[MetadataSeedAxis, number]>) {
    scores[key] += value;
  }
}

function clampMetadataSeedValue(value: number): ScaleValue {
  return Math.min(3, Math.max(1, Math.round(value))) as ScaleValue;
}

function applyRuleGroup(input: {
  haystack: string;
  rules: MetadataSeedRule[];
  scores: MetadataSeedScores;
  signalCounts: Record<MetadataSeedSignal, number>;
}): number {
  let matches = 0;

  for (const rule of input.rules) {
    if (!input.haystack || !matchesMetadataRule(input.haystack, rule.needles)) {
      continue;
    }

    applyMetadataRule(input.scores, rule);
    input.signalCounts[rule.signal] += 1;
    matches += 1;
  }

  return matches;
}

function dampenMixedSignals(scores: MetadataSeedScores): MetadataSeedScores {
  return {
    volumeLevel: scores.volumeLevel * 0.8,
    peakIntensity: scores.peakIntensity * 0.8,
    stimulusDensity: scores.stimulusDensity * 0.8,
    soothingEffect: scores.soothingEffect * 0.7,
  };
}

function getMetadataSignalState(input: {
  calmMatches: number;
  intenseMatches: number;
  totalMatches: number;
}): MetadataSeedSignalState {
  if (!input.totalMatches) {
    return "thin";
  }

  if (input.calmMatches > 0 && input.intenseMatches > 0) {
    return "mixed";
  }

  return "supported";
}

function createMetadataNote(input: {
  signalState: MetadataSeedSignalState;
  calmMatches: number;
  intenseMatches: number;
}): string {
  const intro = "Vorläufige Startbasis aus Metadaten.";
  const outro =
    "Reizprofil und subjektive Wirkung werden erst durch anonyme Einschätzungen belastbarer.";

  if (input.signalState === "thin") {
    return `${intro} Die verfügbaren Metadaten bleiben noch dünn und ergeben nur eine neutrale erste Einordnung. ${outro}`;
  }

  if (input.signalState === "mixed") {
    return `${intro} Genres, Keywords oder Synopsis deuten zugleich auf ruhigere Momente und auf Konflikte oder Spitzen hin. ${outro}`;
  }

  if (input.intenseMatches > input.calmMatches) {
    return `${intro} Genres, Keywords oder Synopsis deuten eher auf Konflikte, Spitzen oder dichtere Reize hin. ${outro}`;
  }

  return `${intro} Genres, Keywords oder Synopsis deuten eher auf eine ruhigere, zurückhaltende Inszenierung hin. ${outro}`;
}

export function deriveMetadataInferenceAssessment(
  item: MetadataSpikeTitle,
): MetadataInferenceAssessment {
  const scores = createMetadataSeedScores();
  const signalCounts: Record<MetadataSeedSignal, number> = {
    calm: 0,
    intense: 0,
  };
  const synopsisHaystack = normalizeSearchText(
    [item.title, item.originalTitle, item.synopsis].filter(Boolean).join(" "),
  );
  const genreHaystack = normalizeSearchText(item.genres?.join(" ") ?? "");
  const keywordHaystack = normalizeSearchText(item.keywords?.join(" ") ?? "");
  const combinedTextHaystack = normalizeSearchText(
    [item.title, item.originalTitle, item.synopsis, item.keywords?.join(" ")]
      .filter(Boolean)
      .join(" "),
  );
  const totalMatches =
    applyRuleGroup({
      haystack: genreHaystack,
      rules: metadataGenreRules,
      scores,
      signalCounts,
    }) +
    applyRuleGroup({
      haystack: synopsisHaystack,
      rules: metadataOverviewIntensityRules,
      scores,
      signalCounts,
    }) +
    applyRuleGroup({
      haystack: keywordHaystack,
      rules: metadataKeywordSignalRules,
      scores,
      signalCounts,
    }) +
    applyRuleGroup({
      haystack: combinedTextHaystack,
      rules: metadataCalmingTextRules,
      scores,
      signalCounts,
    }) +
    applyRuleGroup({
      haystack: combinedTextHaystack,
      rules: metadataTextureTextRules,
      scores,
      signalCounts,
    });

  const signalState = getMetadataSignalState({
    calmMatches: signalCounts.calm,
    intenseMatches: signalCounts.intense,
    totalMatches,
  });
  const resolvedScores = signalState === "mixed" ? dampenMixedSignals(scores) : scores;

  return {
    ratingSamples: {
      volumeLevel: [clampMetadataSeedValue(2 + resolvedScores.volumeLevel)],
      peakIntensity: [clampMetadataSeedValue(2 + resolvedScores.peakIntensity)],
      stimulusDensity: [clampMetadataSeedValue(2 + resolvedScores.stimulusDensity)],
      soothingEffect: [clampMetadataSeedValue(2 + resolvedScores.soothingEffect)],
    },
    notes: createMetadataNote({
      signalState,
      calmMatches: signalCounts.calm,
      intenseMatches: signalCounts.intense,
    }),
    signalState,
  };
}

export function createMetadataInferencePreview(item: MetadataSpikeTitle) {
  const assessment = deriveMetadataInferenceAssessment(item);
  const aggregate = createAggregatedAssessment({
    ratings: assessment.ratingSamples,
    notes: assessment.notes,
    sourceType: "metadata_inference",
  });

  return {
    ...aggregate,
    notes: assessment.notes,
    signalState: assessment.signalState,
  };
}
