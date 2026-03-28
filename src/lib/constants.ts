import type {
  AggregateSourceType,
  ConfidenceLevel,
  ScaleValue,
  StimulusScaleKey,
} from "@/lib/types";

export const siteName = "null-noise";
export const siteClaim = "Lass dich in deiner Freizeit nicht anschreien.";
export const siteDescription =
  "Öffentliche Beta für erklärte Reizprofile bei Filmen und Serien, damit sich ruhiger einschätzen lässt, was dich unnötig belasten könnte.";

export const scaleLabels: Record<
  ScaleValue,
  { short: string; description: string }
> = {
  0: {
    short: "sehr ruhig",
    description: "Kaum wahrnehmbar oder über lange Strecken sehr zurückhaltend.",
  },
  1: {
    short: "ruhig",
    description: "Eher leise oder nur punktuell belastend.",
  },
  2: {
    short: "mittel",
    description: "Merklich vorhanden, aber noch nicht durchgehend intensiv.",
  },
  3: {
    short: "intensiv",
    description: "Klar belastend oder über weite Strecken deutlich präsent.",
  },
  4: {
    short: "sehr intensiv",
    description: "Sehr dicht, sehr laut oder mit stark belastenden Spitzen.",
  },
};

export const confidenceLabels: Record<
  ConfidenceLevel,
  { short: string; description: string }
> = {
  niedrig: {
    short: "niedrig",
    description: "Bisher gibt es nur eine einzelne Einschätzung.",
  },
  mittel: {
    short: "mittel",
    description: "Es liegen einige Einschätzungen vor, die Basis ist aber noch klein.",
  },
  hoch: {
    short: "hoch",
    description: "Mehrere Einschätzungen stützen die aktuelle Einordnung.",
  },
};

export const soothingEffectLabels: Record<
  ScaleValue,
  { short: string; description: string }
> = {
  0: {
    short: "gar nicht beruhigend",
    description: "Wirkt insgesamt eher anspannend, aktivierend oder dysregulierend.",
  },
  1: {
    short: "eher nicht beruhigend",
    description: "Kann punktuell tragen, wird insgesamt aber eher nicht als regulierend erlebt.",
  },
  2: {
    short: "gemischt / neutral",
    description: "Wird weder klar als beruhigend noch klar als belastend eingeschätzt.",
  },
  3: {
    short: "eher beruhigend",
    description: "Kann trotz einzelner Reize subjektiv regulierend oder entlastend wirken.",
  },
  4: {
    short: "deutlich beruhigend",
    description: "Wird insgesamt klar als beruhigend oder regulierend eingeschätzt.",
  },
};

export const sourceTypeLabels: Record<AggregateSourceType, string> = {
  editorial_seed: "redaktioneller Startwert",
  provisional_seed: "vorläufige Startbasis",
  metadata_inference: "vorläufige Startbasis aus Metadaten",
  community_median: "anonyme Einschätzungen",
  mixed: "gemischter Stand",
};

export const stimulusDimensions: Array<{
  key: StimulusScaleKey;
  label: string;
  help: string;
  rangeLow: string;
  rangeHigh: string;
  valueLabels: Record<ScaleValue, string>;
}> = [
  {
    key: "volumeLevel",
    label: "Grundlautstärke",
    help: "Wie laut der Titel im normalen Grundniveau wirkt.",
    rangeLow: "leise",
    rangeHigh: "laut",
    valueLabels: {
      0: "sehr leise",
      1: "eher leise",
      2: "mittlere Lautstärke",
      3: "eher laut",
      4: "sehr laut",
    },
  },
  {
    key: "peakIntensity",
    label: "Plötzliche Spitzen",
    help: "Wie stark oder häufig abrupte Lautstärkesprünge auftreten.",
    rangeLow: "ruhig",
    rangeHigh: "intensiv",
    valueLabels: {
      0: "sehr ruhig",
      1: "eher ruhig",
      2: "mittlere Intensität",
      3: "eher intensiv",
      4: "sehr intensiv",
    },
  },
  {
    key: "stimulusDensity",
    label: "Belastungsdichte",
    help: "Wie dauerhaft oder dicht die akustische Belastung insgesamt bleibt.",
    rangeLow: "wenige Reize",
    rangeHigh: "dicht",
    valueLabels: {
      0: "sehr wenige Reize",
      1: "eher wenige Reize",
      2: "mittlere Dichte",
      3: "eher dicht",
      4: "sehr dicht",
    },
  },
];

export const featureHighlights = [
  "Kein Login-Zwang im MVP",
  "Erklärte Einschätzungen statt objektiv klingender Scheinwerte",
  "Ruhige, tastaturfreundliche Oberfläche",
  "Privacy by Design ohne Tracker oder Fingerprinting",
];
