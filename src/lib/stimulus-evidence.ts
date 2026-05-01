import { normalizeSearchText } from "@/lib/search";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { RatingSampleSet, ScaleValue } from "@/lib/types";

export type StimulusAxis =
  | "audio_peaks"
  | "stimulus_density"
  | "visual_intensity"
  | "emotional_load"
  | "predictability"
  | "relief";

export type StimulusSource =
  | "tmdb"
  | "does_the_dog_die"
  | "common_sense_media"
  | "user_feedback"
  | "manual"
  | "local_seed";

export type StimulusDirection = "calming" | "mixed" | "intensifying";
export type StimulusConfidence = "weak" | "medium" | "strong";
export type StimulusTone = "calm" | "mixed" | "intense";
export type StimulusEvidenceStatus =
  | "Metadatenbasis"
  | "Mehrere Hinweise"
  | "Durch Rückmeldungen gestützt"
  | "Manuell geprüft";

export type StimulusEvidence = {
  axis: StimulusAxis;
  source: StimulusSource;
  direction: StimulusDirection;
  strength: 1 | 2 | 3;
  confidence: StimulusConfidence;
  signal: string;
  explanation: string;
};

export type StimulusEvidenceSummary = {
  tone: StimulusTone;
  confidence: StimulusConfidence;
  status: StimulusEvidenceStatus;
  reasons: string[];
  note: string;
  evidence: StimulusEvidence[];
};

export type EvidenceDebugSummary = {
  title: string;
  tendency: StimulusTone;
  confidence: StimulusConfidence;
  axes: Partial<
    Record<
      StimulusAxis,
      {
        direction: StimulusDirection;
        confidence: StimulusConfidence;
        signals: string[];
      }
    >
  >;
  reasons: string[];
  status: string;
};

export type OptionalEvidenceAdapterInput = {
  title: string;
  externalId?: string | null;
};

type EvidenceRule = {
  needles: string[];
  axis: StimulusAxis;
  direction: StimulusDirection;
  strength: 1 | 2 | 3;
  confidence: StimulusConfidence;
  signal: string;
  explanation: string;
};

type ExternalEvidenceEnv = Record<string, string | undefined>;

const confidenceWeight: Record<StimulusConfidence, number> = {
  weak: 1,
  medium: 2,
  strong: 3,
};

const tmdbGenreRules: EvidenceRule[] = [
  {
    needles: ["action"],
    axis: "stimulus_density",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Action",
    explanation: "Action ist nur ein grober Hinweis auf dichtere Reize.",
  },
  {
    needles: ["horror"],
    axis: "predictability",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Genre: Horror",
    explanation: "Horror spricht vorsichtig fuer mehr Anspannung oder Unvorhersehbarkeit.",
  },
  {
    needles: ["thriller"],
    axis: "predictability",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Thriller",
    explanation: "Thriller ist ein schwacher Hinweis auf Spannung.",
  },
  {
    needles: ["war", "krieg"],
    axis: "emotional_load",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Genre: Krieg",
    explanation: "Kriegskontext kann emotional und sensorisch belastender wirken.",
  },
  {
    needles: ["documentary", "dokumentarfilm"],
    axis: "predictability",
    direction: "calming",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Dokumentarfilm",
    explanation: "Dokumentarische Formen koennen berechenbarer sein, bleiben aber nicht automatisch ruhig.",
  },
  {
    needles: ["family", "familie", "romance", "romantik"],
    axis: "relief",
    direction: "calming",
    strength: 1,
    confidence: "weak",
    signal: "Genre: ruhigere Alltagserzaehlung",
    explanation: "Das Genre kann auf mildere oder entlastende Momente hindeuten.",
  },
];

const tmdbKeywordRules: EvidenceRule[] = [
  {
    needles: ["explosion", "gunfight", "shootout", "gunfire", "bomb", "alarm", "sirene"],
    axis: "audio_peaks",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: laute Spitzen",
    explanation: "Mehrere Metadatenhinweise sprechen fuer moegliche laute oder ploetzliche Spitzen.",
  },
  {
    needles: [
      "violence",
      "gewalt",
      "abuse",
      "grief",
      "death",
      "murder",
      "war",
      "addiction",
      "trauma",
      "suicide",
      "illness",
      "loss",
      "depression",
      "isolation",
      "shame",
    ],
    axis: "emotional_load",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: emotionale Last",
    explanation: "Die Metadaten deuten auf emotional schwerere Themen.",
  },
  {
    needles: [
      "chase",
      "survival",
      "escape",
      "hostage",
      "kidnapp",
      "panic",
      "battle",
      "combat",
      "relentless",
      "time pressure",
      "hectic",
      "frenetic",
    ],
    axis: "stimulus_density",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: Drucksituationen",
    explanation: "Drucksituationen koennen Tempo und Reizdichte erhoehen.",
  },
  {
    needles: ["jump scare", "jumpscare", "horror", "survival horror", "slasher", "stalking"],
    axis: "predictability",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: Schreckmomente",
    explanation: "Die Metadaten sprechen fuer weniger Vorhersehbarkeit.",
  },
  {
    needles: [
      "slow cinema",
      "quiet",
      "gentle",
      "stillness",
      "healing",
      "friendship",
      "contemplative",
      "meditative",
      "slice of life",
      "pastoral",
      "routine",
      "ordinary life",
      "peaceful",
      "tender",
    ],
    axis: "relief",
    direction: "calming",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: ruhige Form",
    explanation: "Mehrere Begriffe deuten auf eine ruhigere, entlastende Form.",
  },
  {
    needles: [
      "daily life",
      "nature",
      "travel",
      "portrait",
      "observational",
      "everyday",
      "minimal",
      "clear structure",
    ],
    axis: "predictability",
    direction: "calming",
    strength: 1,
    confidence: "weak",
    signal: "Keywords: beobachtender Kontext",
    explanation: "Beobachtende oder alltagsnahe Begriffe sind ein vorsichtiger Ruhehinweis.",
  },
  {
    needles: [
      "strobe",
      "strobing",
      "psychedelic",
      "hallucination",
      "fast cutting",
      "rapid editing",
      "flashing",
      "neon",
      "chaotic visuals",
      "kaleidoscopic",
      "multiverse",
      "comic book",
    ],
    axis: "visual_intensity",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: visuelle Dichte",
    explanation: "Es gibt Hinweise auf visuell dichte oder schnelle Bildreize.",
  },
];

const tmdbOverviewRules: EvidenceRule[] = [
  {
    needles: [
      "explosion",
      "alarm",
      "angriff",
      "attack",
      "verfolg",
      "chase",
      "panic",
      "chaos",
      "battle",
      "gunfight",
    ],
    axis: "audio_peaks",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Synopsis: Spitzen moeglich",
    explanation: "Die Synopsis enthaelt vorsichtige Hinweise auf Spitzen oder Druck.",
  },
  {
    needles: [
      "horror",
      "killer",
      "mord",
      "gewalt",
      "violent",
      "bedroh",
      "threat",
      "survival",
      "grief",
      "trauert",
      "verlust",
      "addiction",
      "suicide",
      "abuse",
      "trauma",
    ],
    axis: "emotional_load",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Synopsis: belastende Themen",
    explanation: "Die Synopsis deutet grob auf belastendere Inhalte.",
  },
  {
    needles: [
      "ruhig",
      "stille",
      "sanft",
      "quiet",
      "gentle",
      "nature",
      "natur",
      "beobacht",
      "routine",
      "alltag",
      "meditativ",
      "langsam",
    ],
    axis: "relief",
    direction: "calming",
    strength: 1,
    confidence: "weak",
    signal: "Synopsis: ruhigere Lesart",
    explanation: "Die Synopsis klingt eher nach zurueckhaltenderen Momenten.",
  },
  {
    needles: ["flashing", "strobe", "hallucination", "psychedelic", "chaotic", "fast cutting"],
    axis: "visual_intensity",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Synopsis: visuelle Dichte moeglich",
    explanation: "Die Synopsis deutet vorsichtig auf visuell dichte Momente.",
  },
];

function isEnabled(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() ?? "");
}

function ruleMatches(haystack: string, rule: EvidenceRule): boolean {
  return rule.needles.some((needle) => haystack.includes(normalizeSearchText(needle)));
}

function createEvidenceFromRules(input: {
  haystack: string;
  rules: EvidenceRule[];
  source: StimulusSource;
}): StimulusEvidence[] {
  return input.rules
    .filter((rule) => input.haystack && ruleMatches(input.haystack, rule))
    .map((rule) => ({
      axis: rule.axis,
      source: input.source,
      direction: rule.direction,
      strength: rule.strength,
      confidence: rule.confidence,
      signal: rule.signal,
      explanation: rule.explanation,
    }));
}

function strengthenRepeatedTmdbSignals(evidence: StimulusEvidence[]): StimulusEvidence[] {
  const countsByAxisDirection = evidence.reduce<Record<string, number>>((counts, item) => {
    const key = `${item.axis}:${item.direction}`;
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return evidence.map((item) => {
    const count = countsByAxisDirection[`${item.axis}:${item.direction}`] ?? 0;

    if (item.source !== "tmdb" || count < 2 || item.confidence !== "weak") {
      return item;
    }

    return {
      ...item,
      confidence: "medium",
      explanation: `${item.explanation} Mehrere Metadatenhinweise zeigen in dieselbe Richtung.`,
    };
  });
}

export function deriveTmdbStimulusEvidence(item: MetadataSpikeTitle): StimulusEvidence[] {
  const genreHaystack = normalizeSearchText(item.genres?.join(" ") ?? "");
  const keywordHaystack = normalizeSearchText(item.keywords?.join(" ") ?? "");
  const overviewHaystack = normalizeSearchText(
    [item.title, item.originalTitle, item.synopsis].filter(Boolean).join(" "),
  );
  const evidence = [
    ...createEvidenceFromRules({
      haystack: genreHaystack,
      rules: tmdbGenreRules,
      source: "tmdb",
    }),
    ...createEvidenceFromRules({
      haystack: keywordHaystack,
      rules: tmdbKeywordRules,
      source: "tmdb",
    }),
    ...createEvidenceFromRules({
      haystack: overviewHaystack,
      rules: tmdbOverviewRules,
      source: "tmdb",
    }),
  ];

  return strengthenRepeatedTmdbSignals(evidence);
}

export async function getDoesTheDogDieEvidence(input: {
  item: OptionalEvidenceAdapterInput;
  env?: ExternalEvidenceEnv;
}): Promise<StimulusEvidence[]> {
  const env = input.env ?? process.env;

  if (!isEnabled(env.ENABLE_DTTD_EVIDENCE) || !env.DOES_THE_DOG_DIE_API_KEY) {
    return [];
  }

  // Adapter boundary only: no production API call is made until access and terms are clarified.
  return [];
}

export async function getCommonSenseMediaEvidence(input: {
  item: OptionalEvidenceAdapterInput;
  env?: ExternalEvidenceEnv;
}): Promise<StimulusEvidence[]> {
  const env = input.env ?? process.env;

  if (!isEnabled(env.ENABLE_CSM_EVIDENCE) || !env.COMMON_SENSE_MEDIA_API_KEY) {
    return [];
  }

  // Adapter boundary only: Common Sense Media needs separate API/partnership and storage decisions.
  return [];
}

export function createUserFeedbackEvidence(input: {
  agreements: number;
  direction: StimulusDirection;
  axis?: StimulusAxis;
}): StimulusEvidence[] {
  if (input.agreements <= 0) {
    return [];
  }

  return [
    {
      axis: input.axis ?? "stimulus_density",
      source: "user_feedback",
      direction: input.direction,
      strength: input.agreements >= 3 ? 2 : 1,
      confidence: input.agreements >= 3 ? "medium" : "weak",
      signal: "Rueckmeldungen",
      explanation:
        input.agreements >= 3
          ? "Mehrere Rueckmeldungen zeigen vorsichtig in dieselbe Richtung."
          : "Eine einzelne Rueckmeldung bleibt nur ein schwacher Hinweis.",
    },
  ];
}

function getEvidenceValue(item: StimulusEvidence): number {
  const directionSign =
    item.direction === "calming" ? -1 : item.direction === "intensifying" ? 1 : 0;

  return directionSign * item.strength * confidenceWeight[item.confidence];
}

function resolveConfidence(evidence: StimulusEvidence[], absTotal: number): StimulusConfidence {
  if (!evidence.length || absTotal <= 2) {
    return "weak";
  }

  if (evidence.some((item) => item.confidence === "strong") || absTotal >= 8) {
    return "strong";
  }

  return "medium";
}

function resolveStatus(evidence: StimulusEvidence[]): StimulusEvidenceStatus {
  if (evidence.some((item) => item.source === "manual")) {
    return "Manuell geprüft";
  }

  if (evidence.some((item) => item.source === "user_feedback")) {
    return "Durch Rückmeldungen gestützt";
  }

  if (evidence.length >= 2) {
    return "Mehrere Hinweise";
  }

  return "Metadatenbasis";
}

function createSummaryNote(input: {
  tone: StimulusTone;
  confidence: StimulusConfidence;
  status: StimulusEvidenceStatus;
  reasons: string[];
}): string {
  const prefix = "Vorläufige Startbasis aus Metadaten.";

  if (!input.reasons.length || input.confidence === "weak") {
    return `${prefix} Bisher nur grob gelesen. Die Einschätzung bleibt vorläufig.`;
  }

  if (input.status === "Durch Rückmeldungen gestützt") {
    return `${prefix} Rückmeldungen stützen diese Richtung. Die Einschätzung bleibt offen für Korrekturen.`;
  }

  if (input.status === "Manuell geprüft") {
    return `${prefix} Manuell geprüfte Hinweise stützen diese Richtung. Trotzdem bleibt die Wirkung individuell.`;
  }

  if (input.tone === "intense") {
    return `${prefix} Mehrere Hinweise sprechen für eine intensivere Wirkung. Die Einschätzung bleibt vorläufig.`;
  }

  if (input.tone === "calm") {
    return `${prefix} Mehrere Hinweise sprechen für eine ruhigere Wirkung. Die Einschätzung bleibt vorläufig.`;
  }

  return `${prefix} Hinweise zeigen in unterschiedliche Richtungen. Die Einschätzung bleibt vorläufig.`;
}

function pickReasons(evidence: StimulusEvidence[]): string[] {
  const sorted = [...evidence].sort((left, right) => {
    const leftWeight = Math.abs(getEvidenceValue(left));
    const rightWeight = Math.abs(getEvidenceValue(right));
    return rightWeight - leftWeight;
  });
  const seen = new Set<string>();
  const reasons: string[] = [];

  for (const item of sorted) {
    if (seen.has(item.signal)) {
      continue;
    }

    seen.add(item.signal);
    reasons.push(item.explanation);

    if (reasons.length >= 3) {
      break;
    }
  }

  return reasons;
}

function resolveAxisDirection(evidence: StimulusEvidence[]): StimulusDirection {
  const calming = evidence.filter((item) => item.direction === "calming").length;
  const intensifying = evidence.filter((item) => item.direction === "intensifying").length;

  if (calming > 0 && intensifying > 0) {
    return "mixed";
  }

  if (intensifying > 0) {
    return "intensifying";
  }

  if (calming > 0) {
    return "calming";
  }

  return "mixed";
}

function resolveAxisConfidence(evidence: StimulusEvidence[]): StimulusConfidence {
  if (evidence.some((item) => item.confidence === "strong")) {
    return "strong";
  }

  if (evidence.some((item) => item.confidence === "medium") || evidence.length >= 2) {
    return "medium";
  }

  return "weak";
}

export function aggregateStimulusEvidence(evidence: StimulusEvidence[]): StimulusEvidenceSummary {
  const calming = evidence
    .filter((item) => item.direction === "calming")
    .reduce((total, item) => total + Math.abs(getEvidenceValue(item)), 0);
  const intensifying = evidence
    .filter((item) => item.direction === "intensifying")
    .reduce((total, item) => total + Math.abs(getEvidenceValue(item)), 0);
  const mixed = evidence
    .filter((item) => item.direction === "mixed")
    .reduce((total, item) => total + item.strength * confidenceWeight[item.confidence], 0);
  const net = intensifying - calming;
  const contradictory = calming > 0 && intensifying > 0;
  const tone: StimulusTone =
    !evidence.length || mixed > 0 || contradictory || Math.abs(net) < 2
      ? "mixed"
      : net > 0
        ? "intense"
        : "calm";
  const confidence = resolveConfidence(evidence, Math.max(calming, intensifying, mixed));
  const status = resolveStatus(evidence);
  const reasons = pickReasons(evidence);

  return {
    tone,
    confidence,
    status,
    reasons,
    note: createSummaryNote({ tone, confidence, status, reasons }),
    evidence,
  };
}

export function createEvidenceDebugSummary(
  title: string,
  evidence: StimulusEvidence[],
): EvidenceDebugSummary {
  const summary = aggregateStimulusEvidence(evidence);
  const axes = evidence.reduce<EvidenceDebugSummary["axes"]>((accumulator, item) => {
    const axisEvidence = evidence.filter((candidate) => candidate.axis === item.axis);
    accumulator[item.axis] = {
      direction: resolveAxisDirection(axisEvidence),
      confidence: resolveAxisConfidence(axisEvidence),
      signals: [...new Set(axisEvidence.map((candidate) => candidate.signal))],
    };
    return accumulator;
  }, {});

  return {
    title,
    tendency: summary.tone,
    confidence: summary.confidence,
    axes,
    reasons: summary.reasons,
    status: summary.note,
  };
}

export function createTmdbEvidenceDebugSummary(item: MetadataSpikeTitle): EvidenceDebugSummary {
  return createEvidenceDebugSummary(item.title, deriveTmdbStimulusEvidence(item));
}

export function createRatingSamplesFromEvidenceSummary(
  summary: StimulusEvidenceSummary,
): RatingSampleSet {
  if (summary.tone === "calm") {
    return {
      volumeLevel: [1],
      peakIntensity: [1],
      stimulusDensity: [1],
      soothingEffect: [3],
    };
  }

  if (summary.tone === "intense") {
    return {
      volumeLevel: [2],
      peakIntensity: [3],
      stimulusDensity: [3],
      soothingEffect: [1],
    };
  }

  return {
    volumeLevel: [2],
    peakIntensity: [2],
    stimulusDensity: [2],
    soothingEffect: [2],
  };
}

export function getScaleValueFromEvidenceTone(tone: StimulusTone): ScaleValue {
  if (tone === "calm") {
    return 1;
  }

  if (tone === "intense") {
    return 3;
  }

  return 2;
}
