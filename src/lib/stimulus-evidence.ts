import { normalizeSearchText } from "@/lib/search";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { RatingSampleSet, ScaleValue } from "@/lib/types";

export type StimulusAxis =
  // Internal legacy keys stay stable; labels map to peaks_risk, hectic_density,
  // visual_risk, emotional_weight, surprise_risk and relief_signals.
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
export type SituationalFitState =
  | "passt eher"
  | "vielleicht"
  | "eher vorsichtig"
  | "zu wenig Hinweise";
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
  conflicts: string[];
  reliefSignals: string[];
  thinData: boolean;
  situationalFit: {
    label: string;
    state: SituationalFitState;
  }[];
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
    explanation: "Hinweis aus Genre: Action kann für mehr Tempo sprechen, bleibt aber schwache Evidenz.",
  },
  {
    needles: ["horror"],
    axis: "predictability",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Horror",
    explanation: "Hinweis aus Genre: Horror kann für Überraschung oder Anspannung sprechen, bleibt aber Genre-Evidenz.",
  },
  {
    needles: ["thriller"],
    axis: "predictability",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Thriller",
    explanation: "Hinweis aus Genre: Thriller ist nur ein schwacher Hinweis auf Spannung.",
  },
  {
    needles: ["war", "krieg"],
    axis: "emotional_load",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Krieg",
    explanation: "Hinweis aus Genre: Kriegskontext kann emotional schwerer liegen, reicht allein aber nicht für Sicherheit.",
  },
  {
    needles: ["documentary", "dokumentarfilm"],
    axis: "predictability",
    direction: "calming",
    strength: 1,
    confidence: "weak",
    signal: "Genre: Dokumentarfilm",
    explanation: "Hinweis aus Genre: Dokumentarische Formen können berechenbarer wirken, sind aber keine Entwarnung.",
  },
  {
    needles: ["family", "familie", "romance", "romantik"],
    axis: "relief",
    direction: "calming",
    strength: 1,
    confidence: "weak",
    signal: "Genre: ruhigere Alltagserzählung",
    explanation: "Hinweis aus Genre: Das kann auf mildere oder entlastende Momente hindeuten.",
  },
];

const tmdbKeywordRules: EvidenceRule[] = [
  {
    needles: ["explosion", "gunfight", "shootout", "gunfire", "bomb", "alarm", "sirene"],
    axis: "audio_peaks",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: mögliche Spitzen",
    explanation: "Hinweise aus Keywords: Es gibt Metadatenhinweise auf mögliche Spitzen. Keine Szenenprüfung.",
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
    explanation: "Hinweise aus Keywords: Die Metadaten deuten auf emotional schwerere Themen.",
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
    explanation: "Hinweise aus Keywords: Drucksituationen können für mehr Hektik oder Dichte sprechen.",
  },
  {
    needles: ["jump scare", "jumpscare", "horror", "survival horror", "slasher", "stalking"],
    axis: "predictability",
    direction: "intensifying",
    strength: 2,
    confidence: "medium",
    signal: "Keywords: Schreckmomente",
    explanation: "Hinweise aus Keywords: Die Metadaten sprechen für weniger Vorhersehbarkeit. Keine Szenenprüfung.",
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
    explanation: "Hinweise aus Keywords: Mehrere Begriffe deuten auf eine ruhigere, entlastende Form.",
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
    explanation: "Hinweise aus Keywords: Beobachtende oder alltagsnahe Begriffe sind ein vorsichtiger Ruhehinweis.",
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
    explanation: "Hinweise aus Keywords: Es gibt mögliche Hinweise auf visuelle Dichte. Keine Szenenprüfung.",
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
    signal: "Kurzbeschreibung: Spitzen möglich",
    explanation: "Hinweis aus Kurzbeschreibung: Es gibt vorsichtige Hinweise auf Spitzen oder Druck.",
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
    explanation: "Hinweis aus Kurzbeschreibung: Die Beschreibung deutet grob auf belastendere Themen.",
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
    signal: "Synopsis: ruhigere erste Einschätzung",
    explanation: "Hinweis aus Kurzbeschreibung: Die Beschreibung klingt eher nach zurückhaltenderen Momenten.",
  },
  {
    needles: ["flashing", "strobe", "hallucination", "psychedelic", "chaotic", "fast cutting"],
    axis: "visual_intensity",
    direction: "intensifying",
    strength: 1,
    confidence: "weak",
    signal: "Kurzbeschreibung: visuelle Dichte möglich",
    explanation: "Hinweis aus Kurzbeschreibung: Die Beschreibung deutet vorsichtig auf visuell dichte Momente.",
  },
];

function isEnabled(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() ?? "");
}

function ruleMatches(haystack: string, rule: EvidenceRule): boolean {
  return rule.needles.some((needle) => haystack.includes(normalizeSearchText(needle)));
}

function countRuleMatches(haystack: string, rule: EvidenceRule): number {
  return rule.needles.filter((needle) => haystack.includes(normalizeSearchText(needle))).length;
}

function createEvidenceFromRules(input: {
  haystack: string;
  rules: EvidenceRule[];
  source: StimulusSource;
}): StimulusEvidence[] {
  return input.rules
    .filter((rule) => input.haystack && ruleMatches(input.haystack, rule))
    .map((rule) => {
      const matchCount = countRuleMatches(input.haystack, rule);
      const canStrengthenKeyword = rule.signal.startsWith("Keywords:") && matchCount >= 2;

      return {
        axis: rule.axis,
        source: input.source,
        direction: rule.direction,
        strength:
          canStrengthenKeyword && rule.strength < 3
            ? ((rule.strength + 1) as 2 | 3)
            : rule.strength,
        confidence: canStrengthenKeyword && rule.confidence === "weak" ? "medium" : rule.confidence,
        signal: rule.signal,
        explanation: canStrengthenKeyword
          ? `${rule.explanation} Mehrere passende Keywords zeigen in dieselbe Richtung.`
          : rule.explanation,
      };
    });
}

function strengthenRepeatedTmdbSignals(evidence: StimulusEvidence[]): StimulusEvidence[] {
  const countsByAxisDirection = evidence.reduce<Record<string, number>>((counts, item) => {
    if (!item.signal.startsWith("Keywords:")) {
      return counts;
    }

    const key = `${item.axis}:${item.direction}`;
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return evidence.map((item) => {
    const count = countsByAxisDirection[`${item.axis}:${item.direction}`] ?? 0;

    if (
      item.source !== "tmdb" ||
      !item.signal.startsWith("Keywords:") ||
      count < 2 ||
      item.confidence !== "weak"
    ) {
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
      signal: "Rückmeldungen",
      explanation:
        input.agreements >= 3
          ? "Mehrere Rückmeldungen zeigen vorsichtig in dieselbe Richtung."
          : "Eine einzelne Rückmeldung bleibt nur ein schwacher Hinweis.",
    },
  ];
}

function getEvidenceValue(item: StimulusEvidence): number {
  const directionSign =
    item.direction === "calming" ? -1 : item.direction === "intensifying" ? 1 : 0;

  return directionSign * item.strength * confidenceWeight[item.confidence];
}

type AxisSummary = Partial<
  Record<
    StimulusAxis,
    {
      calming: number;
      intensifying: number;
      mixed: number;
      evidence: StimulusEvidence[];
    }
  >
>;

function createAxisSummary(evidence: StimulusEvidence[]): AxisSummary {
  return evidence.reduce<AxisSummary>((summary, item) => {
    const current = summary[item.axis] ?? {
      calming: 0,
      intensifying: 0,
      mixed: 0,
      evidence: [],
    };
    const value = Math.abs(getEvidenceValue(item));

    if (item.direction === "calming") {
      current.calming += value;
    } else if (item.direction === "intensifying") {
      current.intensifying += value;
    } else {
      current.mixed += item.strength * confidenceWeight[item.confidence];
    }

    current.evidence.push(item);
    summary[item.axis] = current;
    return summary;
  }, {});
}

function getAxisLoad(summary: AxisSummary, axis: StimulusAxis, direction: StimulusDirection): number {
  const axisSummary = summary[axis];

  if (!axisSummary) {
    return 0;
  }

  if (direction === "calming") {
    return axisSummary.calming;
  }

  if (direction === "intensifying") {
    return axisSummary.intensifying;
  }

  return axisSummary.mixed;
}

function getDominantAxisDirection(summary: AxisSummary, axis: StimulusAxis): StimulusDirection | null {
  const axisSummary = summary[axis];

  if (!axisSummary) {
    return null;
  }

  if (axisSummary.calming > 0 && axisSummary.intensifying > 0) {
    return "mixed";
  }

  if (axisSummary.intensifying > axisSummary.calming) {
    return "intensifying";
  }

  if (axisSummary.calming > axisSummary.intensifying) {
    return "calming";
  }

  return axisSummary.mixed > 0 ? "mixed" : null;
}

function isGenreOnlyEvidence(evidence: StimulusEvidence[]): boolean {
  return evidence.length > 0 && evidence.every((item) => item.signal.startsWith("Genre:"));
}

function hasMetadataBeyondGenre(evidence: StimulusEvidence[]): boolean {
  return evidence.some((item) => !item.signal.startsWith("Genre:"));
}

function hasConflict(axisSummary: AxisSummary): boolean {
  const hasStrongCalming =
    getAxisLoad(axisSummary, "relief", "calming") +
      getAxisLoad(axisSummary, "predictability", "calming") >=
    3;
  const hasIntensifying =
    getAxisLoad(axisSummary, "audio_peaks", "intensifying") > 0 ||
    getAxisLoad(axisSummary, "stimulus_density", "intensifying") > 0 ||
    getAxisLoad(axisSummary, "visual_intensity", "intensifying") > 0 ||
    getAxisLoad(axisSummary, "emotional_load", "intensifying") > 0 ||
    getAxisLoad(axisSummary, "predictability", "intensifying") > 0;

  return hasStrongCalming && hasIntensifying;
}

function resolveConflicts(axisSummary: AxisSummary): string[] {
  const conflicts: string[] = [];
  const hasRelief = getAxisLoad(axisSummary, "relief", "calming") > 0;
  const hasPredictable = getAxisLoad(axisSummary, "predictability", "calming") > 0;
  const hasSensory =
    getAxisLoad(axisSummary, "audio_peaks", "intensifying") > 0 ||
    getAxisLoad(axisSummary, "stimulus_density", "intensifying") > 0 ||
    getAxisLoad(axisSummary, "visual_intensity", "intensifying") > 0;
  const hasEmotional = getAxisLoad(axisSummary, "emotional_load", "intensifying") > 0;
  const hasSurprise = getAxisLoad(axisSummary, "predictability", "intensifying") > 0;

  if ((hasRelief || hasPredictable) && hasSensory) {
    conflicts.push("Ruhige oder klare Signale treffen auf sensorisch dichtere Hinweise.");
  }

  if ((hasRelief || hasPredictable) && hasEmotional) {
    conflicts.push("Entlastende Formsignale stehen neben emotional schwereren Themen.");
  }

  if (hasPredictable && hasSurprise) {
    conflicts.push("Vorhersehbarkeit und mögliche Überraschung sind beide angedeutet.");
  }

  return conflicts;
}

function resolveConfidence(input: {
  evidence: StimulusEvidence[];
  axisSummary: AxisSummary;
  tone: StimulusTone;
  thinData: boolean;
  conflicts: string[];
}): StimulusConfidence {
  if (!input.evidence.length || input.thinData || isGenreOnlyEvidence(input.evidence)) {
    return "weak";
  }

  if (input.tone === "mixed" && input.conflicts.length) {
    return "medium";
  }

  const strongestAxis = Math.max(
    ...Object.values(input.axisSummary).map((axis) =>
      Math.max(axis.calming, axis.intensifying, axis.mixed),
    ),
    0,
  );

  if (input.evidence.some((item) => item.confidence === "strong") || strongestAxis >= 8) {
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

  if (hasMetadataBeyondGenre(evidence) && evidence.length >= 2) {
    return "Mehrere Hinweise";
  }

  return "Metadatenbasis";
}

function createSummaryNote(input: {
  tone: StimulusTone;
  confidence: StimulusConfidence;
  status: StimulusEvidenceStatus;
  reasons: string[];
  situationalFit: StimulusEvidenceSummary["situationalFit"];
  conflicts: string[];
  thinData: boolean;
}): string {
  const dataLabel =
    input.confidence === "strong" ? "stark" : input.confidence === "medium" ? "mittel" : "schwach";
  const prefix =
    `Datenlage: ${dataLabel}. Einschätzung basiert auf Genre, Keywords und Kurzbeschreibung. Keine Szenenprüfung.`;
  const fitLine = input.situationalFit.length
    ? ` Situativ: ${input.situationalFit
        .slice(0, 3)
        .map((item) => `${item.label}: ${item.state}`)
        .join("; ")}.`
    : "";

  if (input.thinData || !input.reasons.length) {
    return `${prefix} Keine deutlichen Hinweise gefunden. Das ist keine Entwarnung.${fitLine}`;
  }

  if (input.status === "Durch Rückmeldungen gestützt") {
    return `${prefix} Rückmeldungen stützen diese Richtung. Die Einschätzung bleibt offen für Korrekturen.${fitLine}`;
  }

  if (input.status === "Manuell geprüft") {
    return `${prefix} Manuell geprüfte Hinweise stützen diese Richtung. Trotzdem bleibt die Wirkung individuell.${fitLine}`;
  }

  if (input.tone === "intense") {
    return `${prefix} Metadaten deuten auf eher vorsichtige Passung, wenn gerade wenig Reserve da ist.${fitLine}`;
  }

  if (input.tone === "calm") {
    return `${prefix} Metadaten deuten auf eher passende Momente, wenn du etwas Ruhigeres suchst.${fitLine}`;
  }

  if (input.conflicts.length) {
    return `${prefix} Hinweise zeigen in unterschiedliche Richtungen. Das bleibt eher vielleicht.${fitLine}`;
  }

  return `${prefix} Die Hinweise bleiben vorsichtig und nicht eindeutig. Das bleibt eher vielleicht.${fitLine}`;
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

function hasAxisDirection(
  evidence: StimulusEvidence[],
  axis: StimulusAxis,
  direction: StimulusDirection,
): boolean {
  return evidence.some((item) => item.axis === axis && item.direction === direction);
}

function createSituationalFit(
  evidence: StimulusEvidence[],
  tone: StimulusTone,
): StimulusEvidenceSummary["situationalFit"] {
  const hasPeakRisk = hasAxisDirection(evidence, "audio_peaks", "intensifying");
  const hasDensityRisk = hasAxisDirection(evidence, "stimulus_density", "intensifying");
  const hasEmotionalWeight = hasAxisDirection(evidence, "emotional_load", "intensifying");
  const hasReliefSignals = hasAxisDirection(evidence, "relief", "calming");
  const hasSurpriseRisk = hasAxisDirection(evidence, "predictability", "intensifying");

  return [
    {
      label: "Bitte keine Spitzen",
      state: hasPeakRisk ? "eher vorsichtig" : "zu wenig Hinweise",
    },
    {
      label: "Nicht zu hektisch",
      state: hasDensityRisk ? "eher vorsichtig" : hasReliefSignals ? "vielleicht" : "zu wenig Hinweise",
    },
    {
      label: "Emotional leicht",
      state: hasEmotionalWeight ? "eher vorsichtig" : tone === "calm" ? "passt eher" : "vielleicht",
    },
    {
      label: "Zum Runterkommen",
      state: hasReliefSignals ? "passt eher" : tone === "intense" ? "eher vorsichtig" : "vielleicht",
    },
    {
      label: "Etwas Spannung geht",
      state: hasSurpriseRisk || tone === "intense" ? "vielleicht" : "passt eher",
    },
  ];
}

export function aggregateStimulusEvidence(evidence: StimulusEvidence[]): StimulusEvidenceSummary {
  const axisSummary = createAxisSummary(evidence);
  const conflicts = resolveConflicts(axisSummary);
  const sensoryLoad =
    getAxisLoad(axisSummary, "audio_peaks", "intensifying") +
    getAxisLoad(axisSummary, "stimulus_density", "intensifying") +
    getAxisLoad(axisSummary, "visual_intensity", "intensifying");
  const emotionalLoad = getAxisLoad(axisSummary, "emotional_load", "intensifying");
  const surpriseLoad = getAxisLoad(axisSummary, "predictability", "intensifying");
  const reliefLoad = getAxisLoad(axisSummary, "relief", "calming");
  const predictabilityRelief = getAxisLoad(axisSummary, "predictability", "calming");
  const hasMixedAxis = Object.keys(axisSummary).some(
    (axis) => getDominantAxisDirection(axisSummary, axis as StimulusAxis) === "mixed",
  );
  const thinData =
    !evidence.length ||
    isGenreOnlyEvidence(evidence) ||
    (evidence.length < 2 && evidence.every((item) => item.confidence === "weak"));
  const tone: StimulusTone =
    thinData || hasMixedAxis || hasConflict(axisSummary) || conflicts.length
      ? "mixed"
      : sensoryLoad >= 4 || (sensoryLoad >= 3 && (emotionalLoad > 0 || surpriseLoad > 0))
        ? "intense"
        : reliefLoad + predictabilityRelief >= 4 && sensoryLoad === 0 && emotionalLoad === 0
          ? "calm"
          : emotionalLoad >= 3 && sensoryLoad === 0
            ? "mixed"
            : sensoryLoad + emotionalLoad + surpriseLoad > reliefLoad + predictabilityRelief
              ? "intense"
              : reliefLoad + predictabilityRelief > 0
                ? "calm"
                : "mixed";
  const confidence = resolveConfidence({ evidence, axisSummary, tone, thinData, conflicts });
  const status = resolveStatus(evidence);
  const reasons = pickReasons(evidence);
  const situationalFit = createSituationalFit(evidence, tone);
  const reliefSignals = evidence
    .filter((item) => item.direction === "calming")
    .map((item) => item.explanation);

  return {
    tone,
    confidence,
    status,
    reasons,
    note: createSummaryNote({ tone, confidence, status, reasons, situationalFit, conflicts, thinData }),
    conflicts,
    reliefSignals,
    thinData,
    situationalFit,
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
