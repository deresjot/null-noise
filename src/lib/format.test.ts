import { describe, expect, it } from "vitest";

import { getCautionHints, getDecisionPresentation } from "./format";

describe("format decision helpers", () => {
  it("keeps quieter titles in a calm decision lane", () => {
    const decision = getDecisionPresentation({
      profile: {
        peakIntensity: 1,
        stimulusDensity: 1,
        volumeLevel: 1,
      },
      state: "seed",
    });

    expect(decision.tone).toBe("steady");
    expect(decision.title).toBe("Kann gut gehen.");
  });

  it("adds caution hints for denser, louder profiles", () => {
    const hints = getCautionHints({
      peakIntensity: 4,
      stimulusDensity: 3,
      volumeLevel: 3,
    });

    expect(hints).toContain("harte Spitzen ziehen hier merklich an");
    expect(hints).toContain("es bleibt über längere Strecken dicht");
  });
});
