export type Point = [number, number];

export type Moment = {
  t: number;
  ball: Point;
  me: Point;
  opponent: Point;
  caption: string;
  loft: number;
};

export type Category = "先稳住" | "拉开空档" | "改变节奏" | "把握机会";
export type Level = "入门" | "进阶";

export type Tactic = {
  id: string;
  name: string;
  duration: number;
  frames: Moment[];
  category?: Category;
  level?: Level;
  goal?: string;
  when?: string;
  cue?: string;
  mistake?: string;
  series?: string;
  youth?: boolean;
  excerpt?: boolean;
  previewDecisions?: [string, string, string];
};

export type TacticGuide = {
  why: string;
  recognize: string;
  avoid: string;
  decisions: [string, string, string];
  practice: string;
};

export type TacticExcerpt = {
  fromFrame?: number;
  toFrame?: number;
  name?: string;
  opening?: string;
  ending?: string;
  decisions?: [string, string, string];
};

export type CombinationStage = {
  tacticId: string;
  cue: string;
  transition: string;
  excerpt?: TacticExcerpt;
};

export type CombinationVariant = {
  name: string;
  trigger: string;
  response: string;
  tacticId: string;
  excerpt?: TacticExcerpt;
};

export type Combination = {
  id: string;
  name: string;
  category: Category;
  goal: string;
  when: string;
  series?: string;
  stages: CombinationStage[];
  variants: CombinationVariant[];
};
