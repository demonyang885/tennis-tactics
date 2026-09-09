import type { Combination, Tactic, TacticGuide } from "./types";

const requiredText = ["goal", "when", "cue", "mistake"] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`[tennis-content] ${message}`);
}

export function validateTennisLibrary(
  tactics: Tactic[],
  guides: Record<string, TacticGuide>,
  combinations: Combination[],
) {
  const tacticIds = new Set<string>();

  for (const tactic of tactics) {
    assert(!tacticIds.has(tactic.id), `duplicate tactic id: ${tactic.id}`);
    tacticIds.add(tactic.id);
    assert(tactic.duration >= 5 && tactic.duration <= 20, `${tactic.id} duration must be 5–20 seconds`);
    assert(tactic.name.trim().length >= 3, `${tactic.id}.name is incomplete`);
    assert(tactic.frames.length >= 3, `${tactic.id} needs at least three animation frames`);
    assert(tactic.frames[0].t === 0, `${tactic.id} must start at t=0`);
    assert(tactic.frames.at(-1)?.t === 1, `${tactic.id} must end at t=1`);

    requiredText.forEach((field) => {
      assert(typeof tactic[field] === "string" && tactic[field]!.trim().length >= 6, `${tactic.id}.${field} is incomplete`);
    });

    tactic.frames.forEach((moment, index) => {
      if (index > 0) assert(moment.t > tactic.frames[index - 1].t, `${tactic.id} frame times must increase`);
      for (const [label, point] of [["ball", moment.ball], ["me", moment.me], ["opponent", moment.opponent]] as const) {
        assert(point.every((value) => value >= 0 && value <= 1), `${tactic.id} ${label} coordinate is outside the court`);
      }
      assert(moment.caption.trim().length >= 6, `${tactic.id} frame ${index + 1} needs a useful caption`);
    });

    const guide = guides[tactic.id];
    assert(guide, `${tactic.id} has no tactical guide`);
    assert(guide.decisions.length === 3, `${tactic.id} guide must contain exactly three match decisions`);
    guide.decisions.forEach((decision, index) => {
      assert(decision.trim().length >= 10, `${tactic.id} decision ${index + 1} needs a clear action and signal`);
    });
    assert(guide.why.trim().length >= 16, `${tactic.id} guide needs a clear reason`);
    assert(guide.recognize.trim().length >= 16, `${tactic.id} guide needs a recognizable match signal`);
    assert(guide.avoid.trim().length >= 16, `${tactic.id} guide needs an adjustment condition`);
    assert(guide.practice.trim().length >= 20, `${tactic.id} guide needs a complete partner drill`);
  }

  const combinationIds = new Set<string>();
  for (const combination of combinations) {
    assert(!combinationIds.has(combination.id), `duplicate combination id: ${combination.id}`);
    combinationIds.add(combination.id);
    assert(combination.name.trim().length >= 4, `${combination.id}.name is incomplete`);
    assert(combination.goal.trim().length >= 12, `${combination.id}.goal is incomplete`);
    assert(combination.when.trim().length >= 12, `${combination.id}.when needs a recognizable match signal`);
    assert(combination.stages.length >= 2 && combination.stages.length <= 3, `${combination.id} needs two or three stages`);
    assert(combination.variants.length >= 2, `${combination.id} needs at least two opponent-response variants`);

    combination.stages.forEach((stage, index) => {
      assert(stage.cue.trim().length >= 12, `${combination.id} stage ${index + 1} needs an executable cue`);
      assert(stage.transition.trim().length >= 16, `${combination.id} stage ${index + 1} needs a transition signal`);
    });

    combination.variants.forEach((variant, index) => {
      assert(variant.name.trim().length >= 4, `${combination.id} variant ${index + 1} needs a useful name`);
      assert(variant.trigger.trim().length >= 12, `${combination.id} variant ${index + 1} needs an opponent signal`);
      assert(variant.response.trim().length >= 16, `${combination.id} variant ${index + 1} needs a complete response`);
    });

    [...combination.stages, ...combination.variants].forEach((entry) => {
      assert(tacticIds.has(entry.tacticId), `${combination.id} references missing tactic ${entry.tacticId}`);
      const tactic = tactics.find((item) => item.id === entry.tacticId)!;
      if (entry.excerpt) {
        const from = entry.excerpt.fromFrame ?? 0;
        const to = entry.excerpt.toFrame ?? tactic.frames.length - 1;
        assert(from >= 0 && to < tactic.frames.length && from < to, `${combination.id} has an invalid ${entry.tacticId} excerpt`);
        entry.excerpt.decisions?.forEach((decision, index) => {
          assert(decision.trim().length >= 10, `${combination.id} excerpt decision ${index + 1} is incomplete`);
        });
      }
    });
  }

  return {
    tactics: tactics.length,
    combinations: combinations.length,
    variants: combinations.reduce((total, combination) => total + combination.variants.length, 0),
  };
}
