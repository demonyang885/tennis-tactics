import type { Combination, InteractiveRally, RallyNode, Tactic, TacticGuide } from "./types";

// 下一批完整战术从这里加入；内容标准与范例见 TACTIC_AUTHORING.md。
export const nextGuides: Record<string, TacticGuide> = {};
export const nextTactics: Tactic[] = [];
export const nextCombinations: Combination[] = [];
export const nextRallyNodes: RallyNode[] = [];
export const nextInteractiveRallies: InteractiveRally[] = [];
