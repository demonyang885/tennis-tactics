import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, InfoCircledIcon, Cross2Icon, ReaderIcon, PlayIcon, PauseIcon, ResetIcon, TrackNextIcon, TrackPreviousIcon } from "@radix-ui/react-icons";
import { BottomSheet, Carousel, FlowStack, MobileScroll, type FlowScreen } from "./mobile";

type Point = [number, number];
type Moment = { t: number; ball: Point; me: Point; opponent: Point; caption: string; loft: number };
type Category = "先稳住" | "拉开空档" | "改变节奏" | "把握机会";
type Level = "入门" | "进阶";
type Tactic = {
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
  youth?: boolean;
  excerpt?: boolean;
};
type TacticGuide = { why: string; recognize: string; avoid: string; decisions: string[]; practice: string };
const tacticGuides: Record<string, TacticGuide> = {
  "serve-plus-one": {
    "why": "发球先改变对手站位，下一拍就更容易找到较大的进攻空间。",
    "recognize": "你能稳定控制发球方向；接发者被带向一侧，回球留出准备时间。",
    "avoid": "接发又快又深、自己还没站稳时，先把下一拍回稳，不硬打预设空档。",
    "decisions": [
      "发球前选好大目标，想好下一拍的备选方向。",
      "发完及时准备，看接发的深浅和对手位置。",
      "短球打空档；深球先回深，再重新组织。"
    ],
    "practice": "同伴接发，你发完再打一拍，每侧试 6 次。观察是否发完就准备、下一拍随来球调整，不只看有没有直接得分。"
  },
  "return-middle": {
    "why": "深中路留出的左右进攻角度较小，也给接发者时间准备下一拍。",
    "recognize": "面对较快的追身或内角发球，需要先化解压力时。",
    "avoid": "外角发球已把你拉出场外时，不必硬改中路；顺来球回斜线也可。",
    "decisions": [
      "对手击球时准备启动，先判断方向。",
      "缩短准备动作，把球送向深中路大区域。",
      "接完立即调整站位，在对手下一次击球时稳住。"
    ],
    "practice": "同伴用可控速度交替发内角和追身球，接 8 球后换位。观察回球是否越过发球线，以及接完能否及时恢复准备姿势。"
  },
  "three-cross-one-line": {
    "why": "斜线有较长的飞行空间；先调动，再利用短球变线，选择更清楚。",
    "recognize": "你站位平衡，对手偏向一侧，来球变短且能在身前处理。",
    "avoid": "来球深、低或把你拉到场外时，继续相持；不用凑满三拍就变线。",
    "decisions": [
      "先打斜线大区域，观察对手和回球深度。",
      "没出现可控短球，就继续斜线或回深中路。",
      "短球到了再向前，变线留出边线余量。"
    ],
    "practice": "两人斜线对打，同伴偶尔回短球，你自行决定是否变线。试 8 个回合，观察变线前是否站稳，深球是否仍能耐心回稳。"
  },
  "defend-high-middle": {
    "why": "较高弧线延长飞行时间，深中路帮助你减少对手立即打开角度的机会。",
    "recognize": "被拉向边线、击球时间不足，当前目标是先恢复位置时。",
    "avoid": "对手已经贴网准备高压，或来球太低难以挑深时，别勉强送浅高球。",
    "decisions": [
      "先判断这一拍在防守，把目标放大。",
      "能控制时打高深中路，落点与底线留余量。",
      "利用飞行时间回到能兼顾两侧的位置，再看下一球。"
    ],
    "practice": "同伴交替喂向两侧，你回高深中路后准备下一球，做 6 组。观察回球是否给了回位时间，而不是要求每球都贴近底线。"
  },
  "big-target-pressure": {
    "why": "明确的大目标能减少临时犹豫，让关键分仍按熟悉的节奏执行。",
    "recognize": "比分紧张、连续失误，或你发现自己开始一味瞄边线时。",
    "avoid": "大目标不等于只把球轻推过网；遇到真正的短球，仍可主动向前。",
    "decisions": [
      "分与分之间呼气，选一个熟悉的大目标。",
      "击球时保留完整动作，先控制高度与深度。",
      "随来球切换攻守，打完准备下一拍。"
    ],
    "practice": "和同伴从平分开始打 6 分，每分开始前说出自己的大目标。观察落点选择与动作是否清楚，得失分后是否能重新准备。"
  },
  "body-serve": {
    "why": "让发球弹起后靠近接发者身体，可能压缩其挥拍空间，让回球更难充分展开。",
    "recognize": "你能控制发球落点，对手接发准备较大，或习惯预先侧身时。",
    "avoid": "对手已让出击球空间，或你无法稳定发进时，不靠加速硬追身体。",
    "decisions": [
      "先看接发站位，选斜对角发球区内的大目标。",
      "用熟悉动作发球，让弹跳方向靠近其接球位置。",
      "发完看实际回球，站稳处理下一拍。"
    ],
    "practice": "先在发球区摆标志碟练落点，再请同伴正常接发，每侧试 6 次。观察弹起后是否挤压准备空间，而不是把击中身体作为目标。"
  },
  "return-cross": {
    "why": "接外角发球时顺势回斜线，可利用对角线较长的场地空间。",
    "recognize": "发球来到外侧，你能控制拍面，把球送回斜线大区域。",
    "avoid": "被追身挤住或来球贴近中线时，不必强行拉斜线，可先回中路。",
    "decisions": [
      "先认出外角，及时移动并留出击球空间。",
      "借来球力量回斜线，目标离边线远一些。",
      "沿对手可回球的方向调整位置，准备下一拍。"
    ],
    "practice": "同伴连续发可控外角球，你接回斜线后再对打一拍，两侧各 6 次。观察是否借力控制住方向，接发后有没有停在场外。"
  },
  "approach-follow": {
    "why": "短球让你有机会在场内击球；进攻后向前补位，可缩短对手的反应时间。",
    "recognize": "你能提前到达短球、平衡击球，而且对手还在较后位置。",
    "avoid": "短球很低、身体前冲失控，或进攻球没形成压力时，不急着贴网封死。",
    "decisions": [
      "先到短球侧后方，选能控制的深区或空档。",
      "击球后向前补位，随球路覆盖对手的回球角度。",
      "对手击球时分腿准备，低截击先稳，高球再找空档。"
    ],
    "practice": "同伴喂一记短球后正常回球，你练进攻加第一拍截击，做 6 组。观察上网途中是否及时分腿，以及低球时有没有强行下压。"
  },
  "second-serve-target": {
    "why": "宽阔目标与熟悉的旋转、节奏搭配，帮助二发保留过网和入区的余量。",
    "recognize": "第二次发球，尤其是你需要重新找回发球节奏时。",
    "avoid": "不要为了求稳突然停拍轻推，也不要临场尝试还没掌握的旋转动作。",
    "decisions": [
      "沿用熟悉的发球准备，选斜对角区内的大目标。",
      "保持连贯挥拍，用能控制的高度和旋转入区。",
      "落地后及时准备，预期对手会主动接发。"
    ],
    "practice": "每侧单独练 6 次二发，使用熟悉动作和一个大目标。观察失误主要是下网还是出界，再和教练调整高度、落点或节奏。"
  },
  "attack-second-serve": {
    "why": "对可控的短二发提前击球，能减少对手准备时间，主动来自判断和站位。",
    "recognize": "二发较慢或偏浅，弹跳在你能控制的高度，向前后仍有击球空间。",
    "avoid": "二发深、跳得高或旋转明显时，先调整；不是所有二发都适合抢攻。",
    "decisions": [
      "根据二发的速度和弹跳调整接发位置。",
      "先到位，再用旋转把球送向深区大目标。",
      "回球变短才继续压进；被顶住就恢复相持。"
    ],
    "practice": "同伴混合发浅二发与深二发，你决定向前或调整，接 8 球后换位。观察是否根据实际来球选择，而不是每次都固定冲进场。"
  },
  "wrong-foot": {
    "why": "对手已向一侧回位时，打回刚离开的区域，可让其重新制动和转向。",
    "recognize": "对手被调到一侧后明显往中间跑，而你有时间稳定击球。",
    "avoid": "对手已经停稳、还留在原地，或你自己在勉强救球时，不硬打回头。",
    "decisions": [
      "先用可控的斜线把对手带向一侧。",
      "下一拍准备时看其脚步，而不只看空场。",
      "对手仍在回位就打回原侧；已停稳则选更大空档。"
    ],
    "practice": "同伴接过斜线后，随机回中或留在原侧，你再选落点，做 6 组。观察出手前是否读到移动方向，判断对了也不要求一拍结束。"
  },
  "backhand": {
    "why": "重复打向对手较难处理的一侧，可逐步拉偏站位，再利用另一侧空间。",
    "recognize": "你已观察到对手某一侧更容易回浅，且自己能稳定维持这条球路。",
    "avoid": "不要默认反手一定较弱；回球仍深、自己站位被动时，继续稳住。",
    "decisions": [
      "先观察哪一侧更难应对，再用深球施压。",
      "连续观察回球深浅，不按固定拍数换方向。",
      "等到短球和明显空档，再变线并及时补位。"
    ],
    "practice": "和同伴先练一侧相持，对方不定时回短球，你才改方向，做 6 组。观察变线依据是否清楚，再换边体验不同的强弱侧。"
  },
  "drop-pass": {
    "why": "小球把对手带到前场后，身旁会出现穿越路线，但仍需读其站位。",
    "recognize": "对手站后，你能平衡地放低短球；随后对手来到网前且留出侧向空间。",
    "avoid": "自己远离底线、来球很深或小球质量不够时，不硬做整套组合。",
    "decisions": [
      "有触球控制时放短，让对手向前移动。",
      "对手追球时准备其回球，不预先赌一侧。",
      "有空间就低穿身旁；被压迫时先打低，让对手多截一拍。"
    ],
    "practice": "同伴从后场喂球，你放短后继续打出这一分，轮换做 6 次。观察小球是否让对手低点触球，以及穿越前是否重新看过站位。"
  },
  "drop-lob": {
    "why": "先缩短对手与球网的距离，再把球送到其身后，改变其前后移动方向。",
    "recognize": "对手追小球后贴近网前，而你还有时间稳定控制挑高的弧线。",
    "avoid": "对手已退后等高压，或你只能挑出浅球时，不因预设套路硬挑。",
    "decisions": [
      "从可控来球放短，并准备下一拍。",
      "看对手是否继续压网，同时判断自己是否站稳。",
      "贴网才挑向身后深区；退后则重新选择空档。"
    ],
    "practice": "同伴追过小球后随机压网或退后，你决定挑高或回稳，做 6 组。观察挑球是否越过其可截击范围，并在底线内留出余量。"
  },
  "wide-middle": {
    "why": "调动后的深中路能减少对手再拉开角度的空间，也给你重新站稳的机会。",
    "recognize": "对手横向移动后正在调整，来球让你可以稳定控制深度。",
    "avoid": "没有合适来球时，不硬打连续大角度；中路浅球反而可能让对手进攻。",
    "decisions": [
      "站稳时用斜线角度调动，先留边线余量。",
      "对手回球后再判断，能控制才换另一侧。",
      "需要收住角度时打深中路，随后准备相持。"
    ],
    "practice": "同伴正常回球，你练一记角度球后再选深中路或继续斜线，做 8 回合。观察中路球是否足够深、是否帮助你恢复位置。"
  },
  "front-back": {
    "why": "前后调动不只改变对手位置，也要求你跟进短回球，再覆盖其下一拍。",
    "recognize": "小球带出短回球，你能进入场内；对手停在网前，身后有较大空间。",
    "avoid": "对手追上后打得很深，或你向前过猛还没站稳时，先处理来球。",
    "decisions": [
      "放短后观察对手触球，准备向前接短回球。",
      "进入场内先调整小步，看对手是否仍在网前。",
      "身后开放就挑深，随后补位并准备截击或回球。"
    ],
    "practice": "同伴追小球后交替回短与回深，你调整前后站位并选下一拍，做 6 组。观察是否读到回球深浅，避免放完小球一直站在底线。"
  },
  "moonball": {
    "why": "连续高深球改变击球高度和节奏，让双方有更多时间调整位置。",
    "recognize": "对手偏好平快节奏，且你能把较高弧线稳定送到后场时。",
    "avoid": "只打高却总落在发球区，或对手已进场抢高点时，要调整深度和路线。",
    "decisions": [
      "选后场大区域，用可控弧线增加过网余量。",
      "打完及时回位，同时看对手是否开始前压。",
      "等到短球再向前，来球仍深就耐心相持。"
    ],
    "practice": "两人底线对打，你交替使用常规弧线与高深球，练 8 回合。观察高球落点是否仍在后场、自己是否利用了飞行时间回位。"
  },
  "serve-volley": {
    "why": "发球后向前推进，把下一次击球点提前，向对手施加时间压力。",
    "recognize": "你已练过发球后的移动和第一拍截击，可用一次有准备的变化。",
    "avoid": "不要等看到软接发才开始跑；也不要为了赶到网前，在对手击球时仍全速冲。",
    "decisions": [
      "发球前决定尝试上网，选能控制的发球方向。",
      "发后推进，在对手接触球时分腿准备。",
      "第一拍低截击先稳住；高球再打空档并继续补位。"
    ],
    "practice": "同伴正常接发，你练发球加第一拍截击，每侧做 4 次。观察分腿时机和低球选择；接发穿越或挑高也照常处理，不预设得分。"
  }
};
const M: Point = [.5, .94];
const O: Point = [.5, .08];
const frame = (t: number, ball: Point, me: Point, opponent: Point, caption: string, loft = 0): Moment => ({ t, ball, me, opponent, caption, loft });
const legacyTactics: Tactic[] = [
  { id: "wrong-foot", name: "打回头球", duration: 10, frames: [
    frame(0, [.5,.9], M, O, "准备：观察对手的位置"),
    frame(.2, [.16,.09], [.5,.87], [.17,.08], "① 斜线调动，把对手拉向一侧"),
    frame(.4, [.69,.88], [.69,.92], [.28,.08], "② 对手回球，开始向中间回位"),
    frame(.52, [.69,.88], [.69,.92], [.49,.08], "③ 看准回位方向，再打回原来一侧"),
    frame(.79, [.16,.07], [.6,.85], [.37,.08], "④ 打回头球，让对手急停折返"),
    frame(1, [.14,.03], [.5,.84], [.24,.09], "抓住回位方向，仍要准备下一拍"),
  ]},
  { id: "backhand", name: "压弱侧，再打空档", duration: 8, frames: [
    frame(0, [.5,.9], M, O, "准备：先连续压向同一侧"),
    frame(.17, [.8,.1], [.47,.92], [.8,.08], "① 压向已观察到的较弱一侧"),
    frame(.33, [.3,.89], [.3,.94], [.75,.08], "② 稳住落点，等待回球"),
    frame(.49, [.83,.08], [.33,.91], [.83,.07], "③ 继续压弱侧，观察回球"),
    frame(.64, [.52,.86], [.52,.9], [.79,.08], "④ 对手回球，另一侧出现空档"),
    frame(.9, [.16,.08], [.52,.87], [.56,.09], "⑤ 来球可控，再变线打空档"),
    frame(1, [.15,.03], [.5,.85], [.43,.1], "有短球才变线，打完及时补位"),
  ]},
  { id: "drop-pass", name: "小球+穿越", duration: 10, frames: [
    frame(0, [.5,.86], [.5,.91], O, "准备：短球吸引对手上网"),
    frame(.24, [.3,.43], [.5,.89], [.4,.21], "① 放小球，让球落在网前", .2),
    frame(.38, [.3,.43], [.5,.84], [.3,.42], "② 对手向前追球"),
    frame(.57, [.65,.79], [.65,.84], [.35,.43], "③ 对手回球，准备穿越"),
    frame(.84, [.79,.09], [.63,.8], [.5,.42], "④ 瞄准身旁空档，打出穿越球"),
    frame(1, [.81,.03], [.6,.78], [.61,.35], "身旁有空间，再选择穿越"),
  ]},
  { id: "drop-lob", name: "小球+挑高", duration: 10, frames: [
    frame(0, [.5,.86], [.5,.92], O, "准备：用短球引出后场空间"),
    frame(.23, [.25,.43], [.5,.89], [.4,.19], "① 放短球，吸引对手上网", .2),
    frame(.38, [.25,.43], [.5,.85], [.25,.42], "② 对手向前救球"),
    frame(.54, [.68,.8], [.68,.85], [.29,.42], "③ 对手回球，观察身后空档"),
    frame(.87, [.72,.08], [.62,.82], [.49,.27], "④ 挑高越过对手，落向后场", 1),
    frame(1, [.72,.04], [.55,.8], [.62,.19], "越过网前对手后，继续准备"),
  ]},
  { id: "wide-middle", name: "大角度调动后打中路深球", duration: 12, frames: [
    frame(0, [.5,.89], M, O, "准备：先把对手拉出中路"),
    frame(.16, [.19,.2], [.5,.91], [.19,.19], "① 大角度斜线，拉开对手"),
    frame(.3, [.77,.86], [.77,.91], [.21,.13], "② 移动到位，准备再次调动"),
    frame(.47, [.81,.19], [.73,.88], [.81,.18], "③ 打向另一侧，让对手横向奔跑"),
    frame(.62, [.34,.85], [.34,.9], [.8,.14], "④ 对手回球，开始回位"),
    frame(.86, [.5,.05], [.4,.85], [.63,.14], "⑤ 打中路深球，压住回位节奏"),
    frame(1, [.5,.02], [.5,.84], [.57,.08], "深中路收住角度，准备相持"),
  ]},
  { id: "front-back", name: "前后调动：跟进与补位", duration: 12, frames: [
    frame(0, [.5,.91], [.5,.94], [.5,.08], "① 放小球，调动对手上网"),
    frame(.25, [.5,.44], [.5,.94], [.5,.23], "① 小球落在网前，对手开始前冲", .2),
    frame(.39, [.5,.44], [.5,.94], [.5,.44], "② 对手赶到网前，勉强回球"),
    frame(.56, [.5,.62], [.5,.64], [.5,.42], "③ 我方上前，挑球打向对手身后"),
    frame(.87, [.5,.025], [.5,.59], [.5,.2], "④ 挑向底线，对手转身回追", 1),
    frame(1, [.5,.025], [.5,.59], [.5,.175], "跟进短回球，挑高后继续补位"),
  ]},
  { id: "moonball", name: "高深球改变节奏", duration: 12, frames: [
    frame(0, [.5,.91], M, O, "准备：保持深度与耐心"),
    frame(.15, [.2,.05], [.46,.94], [.2,.08], "① 高弧线深球，压向底线", 1),
    frame(.3, [.73,.91], [.73,.95], [.3,.08], "② 稳定接回，等待机会", .8),
    frame(.46, [.79,.05], [.64,.93], [.79,.08], "③ 换一侧继续打深", 1),
    frame(.61, [.26,.91], [.26,.95], [.63,.08], "④ 充分回位，保持回合", .8),
    frame(.8, [.19,.05], [.4,.93], [.2,.08], "⑤ 连续高球，让对手持续调整", 1),
    frame(1, [.63,.84], [.61,.92], [.3,.08], "利用高深球回位，继续寻找短球", .5),
  ]},
  { id: "serve-volley", name: "发球上网", duration: 10, frames: [
    frame(0, [.64,.96], [.64,.98], [.23,.06], "① 发球后立即向网前推进"),
    frame(.25, [.26,.3], [.58,.79], [.25,.15], "① 发球进入斜对角发球区"),
    frame(.5, [.55,.58], [.55,.63], [.28,.17], "② 对手接发，我方上网截击"),
    frame(.82, [.82,.26], [.58,.6], [.48,.23], "③ 截击打向另一侧空档"),
    frame(1, [.81,.15], [.56,.6], [.63,.27], "第一拍截击后，继续覆盖空档"),
  ]},
];

const legacyDetails: Record<string, Pick<Tactic, "category" | "level" | "goal" | "when" | "cue" | "mistake">> = {
  "wrong-foot": { category:"拉开空档", level:"进阶", goal:"抓住对手回位的方向，打回刚离开的区域。", when:"对手被拉到边线、正在往中间跑时。", cue:"先看对手脚步，再决定回头。", mistake:"只看空档不看对手，太早变线。" },
  backhand: { category:"拉开空档", level:"入门", goal:"连续压住一侧，再打向另一侧空档。", when:"对手某一侧回球较短，或回位偏慢时。", cue:"先找弱侧，等短球再打空档。", mistake:"第一拍还没打深就急着变线。" },
  "drop-pass": { category:"把握机会", level:"进阶", goal:"用小球吸引对手上网，再从身旁穿越。", when:"对手站得较后，而且向前移动不够快时。", cue:"对手真的上来，才打穿越。", mistake:"小球太高，让对手轻松进攻。" },
  "drop-lob": { category:"改变节奏", level:"进阶", goal:"先把对手引到网前，再挑到身后。", when:"对手贴近球网、重心仍向前时。", cue:"挑得高、落得深，比打得快更重要。", mistake:"挑球太平，留给对手高压球。" },
  "wide-middle": { category:"拉开空档", level:"进阶", goal:"先左右调动，最后用深中路限制回位。", when:"对手跑动范围大，但回位常走直线时。", cue:"调动后打深中路，收住角度再准备。", mistake:"每一拍都追求边线，失误率太高。" },
  "front-back": { category:"改变节奏", level:"进阶", goal:"用短球和挑高制造前后跑动。", when:"对手习惯守在底线，而且启动较慢时。", cue:"短球要低，挑高要过头。", mistake:"连续使用同一组合，被对手提前判断。" },
  moonball: { category:"先稳住", level:"入门", goal:"用高而深的球争取回位时间，增加回合稳定性。", when:"自己被拉出场外，或需要恢复节奏时。", cue:"高过对手肩膀，落在底线前。", mistake:"只打高不打深，让对手站进场内进攻。" },
  "serve-volley": { category:"把握机会", level:"进阶", goal:"发球后快速上网，用第一拍截击争取主动。", when:"已练过发后移动与截击，可预先决定尝试时。", cue:"先分腿垫步，再决定截击方向。", mistake:"只顾往前冲，接触球时身体仍在跑。" },
};

const youthTactics: Tactic[] = [
  { id:"serve-plus-one", name:"发球+1：先开场", duration:8, category:"拉开空档", level:"入门", youth:true,
    goal:"发球先拉开对手，下一拍打向较大的空档。", when:"一发进球率稳定，希望主动开始这一分时。", cue:"发球前就想好下一拍的大方向。", mistake:"发完球只看落点，没有及时准备下一拍。",
    frames:[frame(0,[.64,.96],[.64,.98],[.3,.07],"① 先发外角，把对手带离中间"),frame(.24,[.28,.3],[.55,.88],[.28,.2],"① 发球拉开对手，马上准备下一拍"),frame(.45,[.61,.82],[.62,.86],[.34,.19],"② 对手接回，中路出现较大空档"),frame(.76,[.62,.08],[.59,.82],[.46,.17],"③ 用发球后的第一拍打向空档"),frame(1,[.63,.04],[.52,.83],[.52,.12],"完成！发球和下一拍是一套战术")] },
  { id:"body-serve", name:"追身发球，压缩挥拍", duration:7, category:"先稳住", level:"入门", youth:true,
    goal:"用追身发球压缩对手挥拍空间，准备下一拍。", when:"对手接发站位很靠近边线，或挥拍幅度较大时。", cue:"目标放大到身体周围，不追求压线。", mistake:"只追求速度，忽略进球率。",
    frames:[frame(0,[.35,.96],[.35,.98],[.55,.08],"① 瞄准对手身体附近的大目标"),frame(.3,[.54,.3],[.43,.87],[.54,.18],"① 追身发球，让对手难以完整挥拍"),frame(.55,[.47,.75],[.47,.84],[.53,.18],"② 接发角度变小，我方先站稳中路"),frame(.82,[.36,.12],[.49,.81],[.43,.16],"③ 下一拍打深，继续保持主动"),frame(1,[.35,.06],[.5,.82],[.4,.12],"发完及时准备，观察实际接发")] },
  { id:"second-serve-target", name:"二发打大目标", duration:7, category:"先稳住", level:"入门", youth:true,
    goal:"二发选择宽阔区域，用旋转和高度先把球发进。", when:"第二发球，或关键分需要降低双误风险时。", cue:"保持熟悉节奏，给过网与落点留余量。", mistake:"紧张时突然改动作，反而失去节奏。",
    frames:[frame(0,[.64,.96],[.64,.98],[.34,.08],"① 二发选择斜线的大目标"),frame(.34,[.31,.31],[.57,.89],[.33,.18],"① 留足过网高度，先把球发进"),frame(.56,[.61,.82],[.61,.87],[.36,.18],"② 对手接回，回到稳定相持"),frame(.84,[.43,.08],[.55,.84],[.43,.12],"③ 下一拍继续打深，不急着冒险"),frame(1,[.43,.05],[.52,.84],[.45,.1],"完成！关键分先确保二发进场",.3)] },
  { id:"return-middle", name:"接发深回中路", duration:8, category:"先稳住", level:"入门", youth:true,
    goal:"把接发球送深至中路，减少对手下一拍角度。", when:"面对快发球，或自己接发被压迫时。", cue:"缩短挥拍，先过网、再打深。", mistake:"被动球仍瞄准边线，白送失误。",
    frames:[frame(0,[.34,.05],[.6,.92],[.34,.04],"① 对手发球，我方先做分腿垫步"),frame(.3,[.72,.69],[.7,.79],[.4,.15],"① 缩短挥拍，把接发挡回深区"),frame(.61,[.5,.08],[.62,.82],[.47,.1],"② 深回中路，限制对手的角度"),frame(.83,[.45,.73],[.48,.83],[.47,.1],"③ 迅速回位，准备进入相持"),frame(1,[.45,.8],[.5,.86],[.48,.1],"完成！先化解发球，再寻找机会")] },
  { id:"return-cross", name:"接发斜线先控球", duration:8, category:"拉开空档", level:"入门", youth:true,
    goal:"沿较长的斜线路线接发，安全地把对手带向一侧。", when:"对手发球速度适中，而且自己站位稳定时。", cue:"斜线空间大，先让球多飞一段。", mistake:"抢得太早，身体还没站稳就发力。",
    frames:[frame(0,[.7,.05],[.27,.92],[.7,.04],"① 判断来球，先稳住身体"),frame(.29,[.3,.72],[.29,.79],[.63,.16],"① 借力接发，瞄准斜线大区域"),frame(.6,[.77,.09],[.38,.84],[.76,.1],"② 斜线回深，把对手带到边线"),frame(.82,[.48,.78],[.5,.84],[.7,.12],"③ 接发后回位，准备下一拍"),frame(1,[.49,.82],[.5,.87],[.67,.12],"完成！用安全斜线开始这一分")] },
  { id:"attack-second-serve", name:"二发抢进场", duration:8, category:"把握机会", level:"进阶", youth:true,
    goal:"识别较短的二发，向前站一步，用深球取得主动。", when:"对手二发较慢、落点偏浅，而且自己判断清楚时。", cue:"先判断弹跳，再到位打深。", mistake:"每次二发都猛攻，没有根据落点判断。",
    frames:[frame(0,[.38,.08],[.53,.82],[.38,.05],"① 识别较慢二发，站进底线一步"),frame(.3,[.62,.67],[.61,.7],[.4,.14],"① 提前到位，击球点放在身体前方"),frame(.58,[.23,.07],[.59,.72],[.24,.1],"② 打深至大目标，先取得主动"),frame(.8,[.62,.7],[.62,.74],[.37,.11],"③ 对手回短，继续向前压迫"),frame(1,[.82,.15],[.59,.66],[.48,.16],"完成！抢攻来自站位和判断")] },
  { id:"three-cross-one-line", name:"斜线调动再变线", duration:11, category:"拉开空档", level:"进阶", youth:true,
    goal:"先用稳定斜线建立节奏，等短球再变直线。", when:"双方底线相持，对手被带出边线并回球变短时。", cue:"没等到短球，就继续走斜线。", mistake:"为了照套路，遇到深球也强行变线。",
    frames:[frame(0,[.7,.86],[.7,.92],[.74,.08],"① 先用斜线建立稳定回合"),frame(.18,[.24,.1],[.64,.9],[.25,.1],"① 第一拍斜线，留足安全空间"),frame(.36,[.72,.84],[.72,.9],[.32,.1],"② 对手回球，观察深度"),frame(.54,[.2,.12],[.65,.88],[.22,.13],"③ 继续斜线，把对手带向一侧"),frame(.7,[.65,.7],[.65,.78],[.3,.14],"④ 等到短球，站进场内"),frame(.92,[.72,.08],[.62,.72],[.43,.16],"⑤ 再变直线，打向开放场地"),frame(1,[.75,.04],[.58,.72],[.5,.15],"完成！短球才是变线信号")] },
  { id:"approach-follow", name:"短球进攻随球上网", duration:9, category:"把握机会", level:"进阶", youth:true,
    goal:"遇到短球先打深，再沿球路向前，准备截击。", when:"来球落在发球线附近，而且击球点高于球网时。", cue:"打一拍、跟一步，接近网前要分腿。", mistake:"击完球站在原地，错过上网机会。",
    frames:[frame(0,[.51,.62],[.51,.8],[.48,.08],"① 识别短球，向前移动"),frame(.22,[.51,.62],[.51,.65],[.48,.1],"① 在身体前方击球，目标打深"),frame(.48,[.77,.08],[.6,.57],[.76,.1],"② 沿球路向前，不从场地中间冲"),frame(.66,[.56,.53],[.56,.58],[.68,.13],"③ 对手回球时做分腿垫步"),frame(.88,[.19,.18],[.53,.52],[.53,.18],"④ 把截击送向另一侧大空档"),frame(1,[.16,.12],[.5,.51],[.57,.2],"完成！进攻球与上网连在一起")] },
  { id:"defend-high-middle", name:"防守高深回中", duration:9, category:"先稳住", level:"入门", youth:true,
    goal:"被拉出场外时，用高深中路争取回位。", when:"跑动中勉强击球，身体失去平衡时。", cue:"先打高深球，再回到能兼顾两侧的位置。", mistake:"防守时仍追求制胜分，来不及回位。",
    frames:[frame(0,[.86,.79],[.84,.82],[.2,.08],"① 被拉到场外，先承认这一拍在防守"),frame(.29,[.5,.06],[.71,.8],[.3,.09],"① 高深回中，增加球在空中的时间",1),frame(.54,[.52,.06],[.57,.87],[.42,.1],"② 利用飞行时间，快速回到中间"),frame(.75,[.48,.77],[.5,.89],[.47,.1],"③ 站稳后再处理下一拍"),frame(1,[.5,.82],[.5,.91],[.48,.1],"完成！先脱困，再重新组织进攻",.4)] },
  { id:"big-target-pressure", name:"关键分打大目标", duration:8, category:"先稳住", level:"入门", youth:true,
    goal:"比分紧张时，把落点放大到斜线或深中路。", when:"30-30、平分、破发点，或连续失误以后。", cue:"先呼吸，再选一个大目标。", mistake:"因为怕输而缩手，或突然追求边线。",
    frames:[frame(0,[.51,.84],[.51,.91],[.48,.09],"关键分：先呼吸，再选一个大目标"),frame(.25,[.72,.14],[.51,.89],[.71,.13],"① 斜线大区域，远离边线"),frame(.47,[.3,.82],[.3,.91],[.65,.11],"② 回位后继续打深，不急着加速"),frame(.7,[.5,.08],[.4,.88],[.5,.1],"③ 中路深球，让对手先冒险"),frame(.9,[.57,.8],[.57,.88],[.49,.11],"④ 回位准备，继续执行大目标"),frame(1,[.57,.8],[.57,.88],[.49,.11],"关键分继续判断，不预设结果")] },
];

const youthFeatureOrder = ["serve-plus-one", "return-middle", "three-cross-one-line", "defend-high-middle", "big-target-pressure", "body-serve", "return-cross", "approach-follow", "second-serve-target", "attack-second-serve"];
const orderedYouthTactics = youthFeatureOrder.map(id => youthTactics.find(tactic => tactic.id === id)!);
const tactics: Tactic[] = [
  ...orderedYouthTactics,
  ...legacyTactics.map(tactic => ({ ...tactic, ...legacyDetails[tactic.id] })),
];
type Combination = { id:string; name:string; category:Category; goal:string; when:string; stages:{tacticId:string; cue:string; transition:string}[]; variants:{name:string; trigger:string; response:string; tacticId:string}[] };
const combinations: Combination[] = [
  {
    "id": "serve-open-finish",
    "name": "发球后抢先手",
    "category": "拉开空档",
    "goal": "用发球争取可控的下一拍，出现短球时再向前接管。",
    "when": "轮到自己发球，能稳定控制发球方向，并已练过短球上网。",
    "stages": [
      {
        "tacticId": "serve-plus-one",
        "cue": "发球先带开对手，下一拍看实际回球。",
        "transition": "接发回短且你能平衡到位，就进入短球上网；接发很深时先留在底线相持。"
      },
      {
        "tacticId": "approach-follow",
        "cue": "到位处理短球，向前补位并准备第一拍截击。",
        "transition": "对手击球时分腿准备；低截击先稳住，高球有空间再主动处理。"
      }
    ],
    "variants": [
      {
        "name": "换成追身发球",
        "trigger": "发球前发现对手习惯大幅挥拍，且你能控制相应落点。",
        "response": "把起手发球改向能压缩其挥拍空间的目标；发完仍看回球深浅，再决定相持或上网。",
        "tacticId": "body-serve"
      },
      {
        "name": "预先选择发球上网",
        "trigger": "这一分尚未发球，你已练过发后移动和第一拍截击，想尝试一次上网变化。",
        "response": "发球前决定上网，发后立即推进，接发时分腿准备；之后直接处理截击与挑高球。",
        "tacticId": "serve-volley"
      }
    ]
  },
  {
    "id": "return-build-approach",
    "name": "接发稳住再上网",
    "category": "先稳住",
    "goal": "先化解发球，再用斜线找到真正适合进攻的短球。",
    "when": "准备接发，尤其面对较快的内角或追身发球，希望清楚地进入这一分。",
    "stages": [
      {
        "tacticId": "return-middle",
        "cue": "缩短准备，把接发送向深中路大区域。",
        "transition": "接发后恢复平衡，下一球可控再建立斜线；仍被压迫时继续优先回稳。"
      },
      {
        "tacticId": "three-cross-one-line",
        "cue": "用稳定斜线相持，每拍观察回球深度。",
        "transition": "出现能提前到位的短球才向前；没有短球就继续相持，不按拍数硬变线。"
      },
      {
        "tacticId": "approach-follow",
        "cue": "处理短球后随球补位，准备网前下一拍。",
        "transition": "第一拍截击按高度选择：低球先稳，高球有空间再打向空档。"
      }
    ],
    "variants": [
      {
        "name": "外角接发顺斜线",
        "trigger": "起手接发来到外侧，把你带向边线。",
        "response": "把第一阶段改为顺势回斜线，留足边线余量；接完回位，再根据下一球建立相持。",
        "tacticId": "return-cross"
      },
      {
        "name": "可控二发提前接",
        "trigger": "起手面对偏浅的二发，弹跳高度可控，向前后仍能平衡击球。",
        "response": "向前到位，用旋转打向深区大目标；回球变短才继续压进，被顶住就回到相持。",
        "tacticId": "attack-second-serve"
      }
    ]
  },
  {
    "id": "pressure-read-recovery",
    "name": "压住弱侧再打回头",
    "category": "拉开空档",
    "goal": "先改变对手站位，再根据其回位方向选择落点。",
    "when": "已进入底线相持，你观察到对手某一侧更容易回浅，自己也能稳定维持球路。",
    "stages": [
      {
        "tacticId": "backhand",
        "cue": "用可控深球压向较弱一侧，每拍重新看来球。",
        "transition": "对手被带开并明显向中间回位，而你能站稳击球时，再考虑回头球。"
      },
      {
        "tacticId": "wrong-foot",
        "cue": "看准回位脚步，把球送回对手刚离开的区域。",
        "transition": "打完立即准备下一拍；对手已停稳或你被来球顶住时，继续选较大的安全目标。"
      }
    ],
    "variants": [
      {
        "name": "对手停稳就收回中路",
        "trigger": "对手已完成回位，回头球的转向机会消失，而你能控制深度。",
        "response": "改打深中路，减少对手再次打开角度的空间，随后重新组织。",
        "tacticId": "wide-middle"
      },
      {
        "name": "弱侧不明显先走斜线",
        "trigger": "相持中发现两侧都能稳定回深，暂时没有清楚的弱侧。",
        "response": "改用熟悉的斜线大目标建立节奏，等可控短球和明显空档再变线。",
        "tacticId": "three-cross-one-line"
      }
    ]
  },
  {
    "id": "defend-reset-attack",
    "name": "防守脱困再进攻",
    "category": "先稳住",
    "goal": "先争取回位时间，恢复平衡后再寻找向前的机会。",
    "when": "底线回合中被拉向一侧，对手仍在后场，这一拍需要先防守。",
    "stages": [
      {
        "tacticId": "defend-high-middle",
        "cue": "用可控的高深中路争取时间，及时调整位置。",
        "transition": "恢复到能兼顾两侧的站位，而且下一球可控，才从防守转入相持。"
      },
      {
        "tacticId": "three-cross-one-line",
        "cue": "重建稳定斜线，观察对手何时回短。",
        "transition": "能提前到位并平衡处理短球时再向前；回球仍深就继续耐心相持。"
      },
      {
        "tacticId": "approach-follow",
        "cue": "短球打向可控目标，跟进并准备截击。",
        "transition": "根据对手回球高度与方向补位，保持准备，不预设这一拍结束。"
      }
    ],
    "variants": [
      {
        "name": "还需调整就延续高深球",
        "trigger": "第一拍已脱困，但节奏仍乱；对手留在底线，且你能控制高球深度。",
        "response": "暂时用高深球延长调整时间，观察对手是否前压，再决定恢复常规相持。",
        "tacticId": "moonball"
      },
      {
        "name": "调动后先收住角度",
        "trigger": "恢复相持后已把对手带向一侧，但下一球还不适合向前进攻。",
        "response": "用深中路收住对手可用的回球角度，站稳后继续观察新的短球。",
        "tacticId": "wide-middle"
      }
    ]
  },
  {
    "id": "deep-short-net-choice",
    "name": "压深后引上网",
    "category": "改变节奏",
    "goal": "先把对手留在后场，再用小球改变距离，按网前站位选择下一拍。",
    "when": "已在底线相持，对手站得较后；你有时间到位，也能控制低短球。",
    "stages": [
      {
        "tacticId": "backhand",
        "cue": "用可控深球施压，观察对手是否持续守在后场。",
        "transition": "出现能平衡处理的来球、对手仍站后时，可放短改变前后距离；来球深重就继续相持。"
      },
      {
        "tacticId": "drop-pass",
        "cue": "小球带对手向前，接着看其站位再选身旁空档。",
        "transition": "有空间且来球可控才穿越；没有侧向空间时，看能否挑向身后或先回低球。"
      }
    ],
    "variants": [
      {
        "name": "对手贴网就挑身后",
        "trigger": "小球之后对手继续贴网，而你已站稳，有时间控制挑高。",
        "response": "把下一拍改为挑向身后深区，给底线留余量，然后准备对手可能的回球。",
        "tacticId": "drop-lob"
      },
      {
        "name": "短回球就跟进处理",
        "trigger": "对手追小球后的回球也很短，需要你进入场内接球。",
        "response": "及时向前并用小步调整，先站稳，再根据对手位置选择身旁或身后空间。",
        "tacticId": "front-back"
      }
    ]
  },
  {
    "id": "pressure-point-clear-plan",
    "name": "关键分稳中找机会",
    "category": "把握机会",
    "goal": "关键分保持清楚的落点计划，也保留处理真实进攻机会的主动性。",
    "when": "面对 30-30、平分、破发点或连续失误，希望用熟悉的选择组织这一分。",
    "stages": [
      {
        "tacticId": "big-target-pressure",
        "cue": "分开始前呼气，选一个熟悉的大目标。",
        "transition": "完成发球或接发、进入可控的底线回合后，沿选定大方向建立相持。"
      },
      {
        "tacticId": "three-cross-one-line",
        "cue": "用完整动作打斜线，逐拍读深浅，不急着追边线。",
        "transition": "真正的短球出现、你能提前到位时才向前；其余来球继续按大目标处理。"
      },
      {
        "tacticId": "approach-follow",
        "cue": "抓住可控短球，进攻后补位准备下一拍。",
        "transition": "低截击保持余量；对手还能回球就继续准备，分结束后重新开始自己的节奏。"
      }
    ],
    "variants": [
      {
        "name": "轮到二发先守住节奏",
        "trigger": "这一分尚未进入相持，轮到自己的第二次发球。",
        "response": "沿用熟悉的二发动作，选择发球区内的大目标；发完准备接发回球，再决定相持或进攻。",
        "tacticId": "second-serve-target"
      },
      {
        "name": "被拉开先恢复位置",
        "trigger": "进入回合后被拉向场外，身体不平衡，而对手仍在后场。",
        "response": "先回可控的高深中路，争取回位时间；恢复平衡后再执行斜线相持。",
        "tacticId": "defend-high-middle"
      }
    ]
  }
];
const categories = ["全部", "先稳住", "拉开空档", "改变节奏", "把握机会"] as const;
type CategoryFilter = typeof categories[number];

function tacticMeta(tactic: Tactic) {
  return {
    category: tactic.category ?? "先稳住",
    level: tactic.level ?? "入门",
    goal: tactic.goal ?? "先看清来球和对手位置，再选择安全落点。",
    when: tactic.when ?? "站位稳定、看清场上空间时。",
    cue: tactic.cue ?? "先站稳，再击球。",
    mistake: tactic.mistake ?? "还没到位就急着发力。",
  };
}
function AppHeader({ title, back, menu }: { title: string; back?: () => void; menu?: () => void }) {
  return <div className={`tennis-header ${back ? "detail-header" : "list-header"}`}>
    {back && <button className="header-back" aria-label="返回上一页" onClick={back}><ChevronLeftIcon /></button>}
    <div className="header-title"><h1>{title}</h1>{!back && <p>青少年单打 · 看懂球路，学会选择</p>}</div>
    {menu && <button className="header-info" aria-label="演示说明" onClick={menu}><InfoCircledIcon /></button>}
  </div>;
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPoint = (a: Point, b: Point, t: number): Point => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
function currentPose(tactic: Tactic, seconds: number) {
  const fraction = Math.min(1, Math.max(0, seconds / tactic.duration));
  let index = tactic.frames.findIndex(f => f.t >= fraction);
  if (index <= 0) index = 1;
  const a = tactic.frames[index - 1], b = tactic.frames[index];
  const t = Math.max(0, Math.min(1, (fraction - a.t) / (b.t - a.t)));
  const ease = t * t * (3 - 2 * t);
  return { ball: mixPoint(a.ball,b.ball,t), me: mixPoint(a.me,b.me,ease), opponent: mixPoint(a.opponent,b.opponent,ease), height: Math.sin(t * Math.PI) * b.loft, caption: fraction === 0 ? tactic.frames[0].caption : b.caption, index, segmentProgress:t, fraction };
}
function Court({ tactic, elapsed }: { tactic: Tactic; elapsed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null), holderRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ tactic, elapsed });latest.current = { tactic, elapsed };
  const drawRef = useRef<() => void>(() => {});
  useEffect(() => {
    const canvas = canvasRef.current, holder = holderRef.current;
    if (!canvas || !holder) return;
    const draw = () => {
      const { tactic: selected, elapsed: time } = latest.current;
      const width = holder.clientWidth, height = holder.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 3);
      if (canvas.width !== Math.round(width*dpr) || canvas.height !== Math.round(height*dpr)) { canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); }
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);ctx.clearRect(0,0,width,height);
      const courtH = Math.max(100, Math.min(height-78, width*.74*2.14)), courtW = courtH / 2.14, x = (width-courtW)/2, y = 41;
      const px = (p: Point): Point => [x+p[0]*courtW,y+p[1]*courtH];
      const line = (a: Point,b: Point,color="rgba(255,255,255,.9)",thickness=1.6) => {ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.moveTo(...px(a));ctx.lineTo(...px(b));ctx.stroke();};
      ctx.fillStyle="#246447";ctx.fillRect(x,y,courtW,courtH);ctx.strokeStyle="#f5f5f0";ctx.lineWidth=1.8;ctx.strokeRect(x,y,courtW,courtH);
      line([.125,0],[.125,1]);line([.875,0],[.875,1]);line([.125,.23],[.875,.23]);line([.125,.77],[.875,.77]);line([.5,.23],[.5,.77]);
      line([-.023,.5],[1.023,.5],"#929a92",4);line([-.019,.492],[-.019,.508],"#626766",5);line([1.019,.492],[1.019,.508],"#626766",5);
      const pose = currentPose(selected,time);
      const previous=selected.frames[pose.index-1], target=selected.frames[pose.index];
      const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
      const hitterColor=(moment:Moment,alpha:number)=>distance(moment.ball,moment.me)<=distance(moment.ball,moment.opponent)?`rgba(88,177,255,${alpha})`:`rgba(255,101,116,${alpha})`;
      const history=selected.frames.slice(0,pose.index).map(item=>item.ball);
      if(history.length>1){ctx.save();ctx.beginPath();ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="rgba(207,255,92,.22)";ctx.lineWidth=1.6;history.forEach((point,index)=>{const [hx,hy]=px(point);if(index===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy);});ctx.stroke();ctx.restore();}
      if(time>0)line(previous.ball,pose.ball,"rgba(209,255,82,.78)",3);
      selected.frames.slice(1,pose.index).forEach(item=>{const [nx,ny]=px(item.ball);ctx.beginPath();ctx.arc(nx,ny,3.2,0,Math.PI*2);ctx.fillStyle=hitterColor(item,.78);ctx.fill();ctx.lineWidth=1.2;ctx.strokeStyle="rgba(255,255,255,.72)";ctx.stroke();});
      if(pose.fraction<.999 && pose.segmentProgress<.999){const [tx,ty]=px(target.ball),pulse=12+(Math.sin(time*6)+1)*3;ctx.beginPath();ctx.arc(tx,ty,pulse,0,Math.PI*2);ctx.fillStyle="rgba(209,255,113,.09)";ctx.fill();ctx.strokeStyle="rgba(221,255,142,.78)";ctx.lineWidth=1.8;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(tx,ty,3,0,Math.PI*2);ctx.fillStyle="rgba(214,255,118,.9)";ctx.fill();}
      const hitPulse=Math.max(0,1-pose.segmentProgress/.22);if(hitPulse>0&&time>0){const [hitX,hitY]=px(previous.ball);ctx.beginPath();ctx.arc(hitX,hitY,5+hitPulse*8,0,Math.PI*2);ctx.strokeStyle=hitterColor(previous,hitPulse*.82);ctx.lineWidth=2.4;ctx.stroke();}
      if(time>0&&pose.segmentProgress>=.999){const [nodeX,nodeY]=px(pose.ball);ctx.beginPath();ctx.arc(nodeX,nodeY,7,0,Math.PI*2);ctx.strokeStyle=hitterColor(target,.88);ctx.lineWidth=2;ctx.stroke();}
      if(time>0){for(let i=6;i>=1;i--){const freshness=(7-i)/6,u=Math.max(0,pose.segmentProgress-i*.035),trailPoint=mixPoint(previous.ball,target.ball,u),[trailX,trailY]=px(trailPoint);ctx.beginPath();ctx.arc(trailX,trailY,1.2+freshness*1.6,0,Math.PI*2);ctx.fillStyle=`rgba(193,255,0,${.035+freshness*.17})`;ctx.fill();}}
      const player = (p: Point,color: string,label: string) => {const [cx,cy] = px(p);ctx.beginPath();ctx.arc(cx,cy,9.5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=1.7;ctx.strokeStyle="#fff";ctx.stroke();ctx.font='12px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle="#f3f5ec";ctx.fillText(label,cx,cy+13);};
      player(pose.opponent,"#c8182b","对手");player(pose.me,"#216caf","我方");
      const [ballX, ballY] = px(pose.ball);
      if(pose.height > .1) {ctx.beginPath();ctx.ellipse(ballX+4,ballY+5,3,1.5,0,0,Math.PI*2);ctx.fillStyle="rgba(0,0,0,.25)";ctx.fill();}
      ctx.beginPath();ctx.arc(ballX,ballY-pose.height*7,4+pose.height*2,0,Math.PI*2);ctx.fillStyle="#c1ff00";ctx.fill();
    };
    drawRef.current=draw;const resize=new ResizeObserver(draw);resize.observe(holder);draw();return () => resize.disconnect();
  }, []);
  useEffect(() => {drawRef.current();},[tactic,elapsed]);
  const pose=currentPose(tactic,elapsed);
  const displayCaption=pose.caption;
  const totalSteps=tactic.frames.length-1,currentStep=Math.min(totalSteps,pose.index);
  const completedSteps=pose.segmentProgress>=.999?currentStep:currentStep-1;
  return <div className="court-display"><div ref={holderRef} className="court-stage" data-testid="court-stage">
    <canvas ref={canvasRef} role="img" aria-label={`${tactic.name}，红色为对手，蓝色为我方，黄色为网球，亮色线为已经完成的球路，圆环为下一关键位置`}/>
    <div className="stage-progress" aria-label={`当前第 ${currentStep} 步，共 ${totalSteps} 步`}><span>步骤 {currentStep}/{totalSteps}</span><div>{Array.from({length:totalSteps},(_,index)=><i key={index} className={index<completedSteps?"is-complete":index===currentStep-1?"is-active":""}/>)}</div><span className="stage-hint">{tactic.excerpt?"组合片段":"球路示意"}</span></div>
    </div>
    <div className={`stage-caption ${elapsed>=tactic.duration ? "is-finished" : ""}`} aria-live="polite" aria-atomic="true"><span>{displayCaption}</span></div>
  </div>;
}
function TacticExplanation({ tactic }: { tactic: Tactic }) {
  const meta=tacticMeta(tactic), guide=tacticGuides[tactic.id];
  const [expanded,setExpanded]=useState<string | null>("decisions");
  const sections=[
    { id:"decisions", title:"三个临场选择", content:<ol className="guide-steps">{guide.decisions.map((decision,index)=><li key={decision}><span>{index+1}</span><p>{decision}</p></li>)}</ol> },
    { id:"why", title:"为什么这样打", content:<p>{guide.why}</p> },
    { id:"adjust", title:"什么时候要调整", content:<><p>{guide.avoid}</p><div className="guide-mistake"><strong>常见失误</strong><p>{meta.mistake}</p></div></> },
    { id:"practice", title:"和同伴练一练", content:<><p>{guide.practice}</p><small>次数可按能力调整，重点看选择和准备。</small></> },
  ];
  return <div className="guide-panel">
    <div className="guide-summary"><span>这一招的目标</span><p>{meta.goal}</p></div>
    <div className="guide-situation"><h3>什么时候用</h3><p>{guide.recognize}</p></div>
    <div className="guide-cue-card"><span>记住这一句</span><p>{meta.cue}</p></div>
    <div className="guide-sections">{sections.map(section=>{const open=expanded===section.id;return <section className="guide-section" key={section.id}>
      <button aria-expanded={open} aria-controls={`guide-${tactic.id}-${section.id}`} onClick={()=>setExpanded(open?null:section.id)}><span>{section.title}</span><ChevronDownIcon className={open?"is-open":""}/></button>
      <div id={`guide-${tactic.id}-${section.id}`} className="guide-section-content" hidden={!open}>{section.content}</div>
    </section>;})}</div>
    <p className="guide-safety">动画演示一种来球情况，实际要随球调整；战术不保证得分。适合已能全场对打的球员，球场与目标可由教练按能力调整。</p>
  </div>;
}
function TacticPlayer({ tactic, contextLabel }: { tactic: Tactic; contextLabel?:string }) {
  const [elapsed,setElapsed]=useState(0), [playing,setPlaying]=useState(false), [speed,setSpeed]=useState(1), [settings,setSettings]=useState(false);
  const meta = tacticMeta(tactic);
  useEffect(() => {
    if(!playing) return;let animation=0,previous=performance.now();
    const tick=(now: number) => {const delta=Math.min((now-previous)/1000,.1)*speed;previous=now;setElapsed(old => Math.min(tactic.duration,old+delta));animation=requestAnimationFrame(tick);};
    animation=requestAnimationFrame(tick);return () => cancelAnimationFrame(animation);
  },[playing,speed,tactic.duration]);
  useEffect(() => {if(elapsed>=tactic.duration)setPlaying(false);},[elapsed,tactic.duration]);
  const toggle=() => {if(elapsed>=tactic.duration)setElapsed(0);setPlaying(p=>!p);};
  const next=() => {setPlaying(false);const step=tactic.frames.find(f=>f.t*tactic.duration>elapsed+.001);setElapsed(step?step.t*tactic.duration:tactic.duration);};
  const previous=() => {setPlaying(false);const step=[...tactic.frames].reverse().find(f=>f.t*tactic.duration<elapsed-.001);setElapsed(step?step.t*tactic.duration:0);};
  return <div className="player-screen"><Court tactic={tactic} elapsed={elapsed}/>{contextLabel&&<div className="court-context">{contextLabel}</div>}<div className="playback-controls">
    <div className="timeline-row"><span>{elapsed.toFixed(1)}s</span><input aria-label="播放进度" type="range" min="0" max={tactic.duration} step="0.01" value={elapsed} onChange={e=>{setPlaying(false);setElapsed(Number(e.target.value));}}/><span>{tactic.duration}s</span></div>
    <div className="playback-buttons"><button className="speed-button" aria-label={`播放速度 ${speed} 倍`} onClick={()=>setSpeed(s=>s===1?.5:s===.5?.25:1)}><strong>{speed}×</strong><span>{speed===1?"标准":"慢速"}</span></button><button aria-label="上一步" disabled={elapsed<=0} onClick={previous}><TrackPreviousIcon/><span>上一步</span></button><button className="play-button" aria-label={playing?"暂停":elapsed>=tactic.duration?"重播":"播放"} onClick={toggle}>{playing?<PauseIcon/>:elapsed>=tactic.duration?<ResetIcon/>:<PlayIcon/>}<span>{playing?"暂停":elapsed>=tactic.duration?"重播":"播放"}</span></button><button aria-label="下一步" disabled={elapsed>=tactic.duration} onClick={next}><TrackNextIcon/><span>下一步</span></button><button aria-label="从头重播" onClick={()=>{setElapsed(0);setPlaying(true);}}><ResetIcon/><span>重来</span></button></div>
    <button className="guide-entry" aria-label="打开战术讲解" onClick={()=>{setPlaying(false);setSettings(true);}}><ReaderIcon/><span><strong>战术讲解</strong><small>使用时机 · 临场选择 · 练习方法</small></span><ChevronRightIcon/></button>
    </div><BottomSheet open={settings} onOpenChange={setSettings} title={tactic.name} description={`${meta.category} · ${meta.level} · 战术讲解`} snap={.9}>
      <button className="guide-close" aria-label="关闭战术讲解" onClick={()=>setSettings(false)}><Cross2Icon/></button>
      <TacticExplanation tactic={tactic}/>
      <button className="sheet-done" onClick={()=>setSettings(false)}>回到动画</button>
    </BottomSheet></div>;
}

function combinationExample(id:string):Tactic {
  const source=tactics.find(tactic=>tactic.id===id)!;
  const focus:Record<string,{from:number;to?:number;name:string;opening:string;ending?:string}>={
    backhand:{from:0,to:4,name:"深球压弱侧，观察回球",opening:"先用深球施压，观察对手",ending:"看清回球，再选择下一招"},
    "three-cross-one-line":{from:0,to:4,name:"斜线相持，等待短球",opening:"先建立斜线，逐拍看深浅",ending:"可控短球出现，准备向前"},
    "wrong-foot":{from:2,name:"看准回位，再打回头",opening:"已把对手带开，先看回位脚步"},
    "wide-middle":{from:4,name:"调动后，深中路收住角度",opening:"对手正在回位，选择深中路"},
    "drop-pass":{from:0,to:3,name:"小球引上前，观察网前位置",opening:"有时间到位，先用小球改变距离",ending:"看对手站位，再选穿越或挑高"},
    "drop-lob":{from:2,name:"对手贴网，挑向身后",opening:"对手已到网前，先准备回球"},
    "front-back":{from:2,name:"短回球：跟进与补位",opening:"对手已追到小球，观察回球深浅"},
  };
  const selected=focus[id];if(!selected)return source;
  const frames=source.frames.slice(selected.from,(selected.to??source.frames.length-1)+1);
  const from=frames[0].t,span=frames[frames.length-1].t-from;
  return {...source,name:selected.name,excerpt:true,duration:Math.round(Math.max(6,source.duration*span)*10)/10,
    frames:frames.map((moment,index)=>({...moment,t:(moment.t-from)/span,caption:index===0?selected.opening:index===frames.length-1&&selected.ending?selected.ending:moment.caption}))};
}
function CombinationDetail({ combination, openTactic }: { combination:Combination; openTactic:(tactic:Tactic,contextLabel:string)=>void }) {
  const [variantOpen,setVariantOpen]=useState<number | null>(null);
  const openExample=(id:string,contextLabel:string)=>openTactic(combinationExample(id),contextLabel);
  return <MobileScroll className="combination-screen"><div className="combination-content">
    <div className="combination-summary"><span>{combination.category} · {combination.stages.length} 阶段搭配</span><h2>{combination.goal}</h2><p>{combination.when}</p></div>
    <div className="combination-section-title"><h2>按来球，一步步搭配</h2><p>每招可单独看球路，不必按固定拍数完成。</p></div>
    <ol className="combination-stages">{combination.stages.map((stage,index)=>{const tactic=combinationExample(stage.tacticId);return <li className="combination-stage" key={`${stage.tacticId}-${index}`}>
      <div className="combination-stage-top"><span>{String(index+1).padStart(2,"0")}</span><h3>{tactic.name}</h3></div>
      <p className="combination-cue">{stage.cue}</p><div className="combination-transition"><strong>{index===combination.stages.length-1?"继续判断":"接下来怎么选"}</strong><p>{stage.transition}</p></div>
      <button className="watch-example" onClick={()=>openExample(stage.tacticId,`${combination.name} · 阶段 ${index+1}`)} aria-label={`观看阶段 ${index+1}：${tactic.name}`}><PlayIcon/>看这一招的球路<ChevronRightIcon/></button>
    </li>;})}</ol>
    <div className="combination-section-title variant-title"><h2>对手变了，换一招</h2><p>出现下面的信号，就在当下调整。</p></div>
    <div className="combination-variants">{combination.variants.map((variant,index)=>{const open=variantOpen===index;return <section className="combination-variant" key={variant.name}>
      <button className="variant-trigger" aria-expanded={open} aria-controls={`variant-${combination.id}-${index}`} onClick={()=>setVariantOpen(open?null:index)}><span><strong>{variant.name}</strong><small>{variant.trigger}</small></span><ChevronDownIcon className={open?"is-open":""}/></button>
      <div className="variant-response" id={`variant-${combination.id}-${index}`} hidden={!open}><p>{variant.response}</p><button className="watch-example" onClick={()=>openExample(variant.tacticId,`${combination.name} · 应变：${variant.name}`)} aria-label={`观看衍生打法：${variant.name}`}><PlayIcon/>看对应打法<ChevronRightIcon/></button></div>
    </section>;})}</div>
    <p className="combination-note">先看来球深浅、自己的平衡和对手站位。条件不合适，就回到安全相持。</p>
  </div></MobileScroll>;
}
function TacticsList({ openTactic, openCombination }: { openTactic: (tactic: Tactic, event: React.MouseEvent<HTMLButtonElement>) => void; openCombination:(combination:Combination)=>void }) {
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [mode,setMode]=useState<"tactics" | "combinations">("tactics");
  const visibleTactics = category === "全部" ? tactics : tactics.filter(tactic => tactic.category === category);
  const visibleCombinations = category === "全部" ? combinations : combinations.filter(combination=>combination.category===category);
  return <section className="tactic-catalogue" aria-label="青少年比赛战术">
      <div className="catalogue-modes" role="group" aria-label="查看单项或组合"><button aria-pressed={mode==="tactics"} className={mode==="tactics"?"is-selected":""} onClick={()=>setMode("tactics")}>单项战术 <span>{tactics.length}</span></button><button aria-pressed={mode==="combinations"} className={mode==="combinations"?"is-selected":""} onClick={()=>setMode("combinations")}>组合打法 <span>{combinations.length}</span></button></div>
      <Carousel className="category-carousel" contentClassName="category-track" ariaLabel="按比赛情境筛选">
        {categories.map(option => <button key={option} className={`category-chip ${category === option ? "is-selected" : ""}`} aria-pressed={category === option} onClick={() => setCategory(option)}>{option}</button>)}
      </Carousel>
      <div className="catalogue-count"><span>{mode==="combinations"?"组合＋衍生选择":category === "全部" ? "全部战术" : category}</span><span>{mode==="combinations"?`${visibleCombinations.length} 组搭配`: `${visibleTactics.length} 个战术`}</span></div>
      <MobileScroll className="tactic-list-screen" key={`${mode}-${category}`}>
      <main className="tactics-grid" aria-label={`${category}${mode==="tactics"?"战术":"组合"}列表`}>
        {mode==="combinations"?visibleCombinations.map((combination)=><button className="tactic-card combo-card" key={combination.id} onClick={()=>openCombination(combination)} aria-label={`${combination.name}，${combination.stages.length} 个阶段，${combination.variants.length} 种衍生选择`}><div className="card-copy"><div className="combo-card-label">{combination.category} · 组合打法</div><h2>{combination.name}</h2><p className="card-purpose">{combination.goal}</p><div className="card-meta"><span>{combination.stages.length} 阶段搭配</span><span>{combination.variants.length} 种应变</span></div></div><ChevronRightIcon className="card-arrow"/></button>):visibleTactics.map(tactic => {
          const meta = tacticMeta(tactic);
          return <button key={tactic.id} className="tactic-card" onClick={event => openTactic(tactic,event)} aria-label={`${tactic.name}，${tactic.duration}秒，${meta.category}，${meta.level}`}>
            <div className="card-picture" aria-hidden="true"><img src="/assets/tennis/tennis-ball.png" alt="" draggable={false}/><span>{String(tactics.indexOf(tactic)+1).padStart(2,"0")}</span></div>
            <div className="card-copy"><h2>{tactic.name}</h2><p className="card-purpose">{meta.goal}</p><div className="card-meta"><span>{meta.category}</span><span>{meta.level}</span><span>{tactic.duration} 秒演示</span></div></div><ChevronRightIcon className="card-arrow"/>
          </button>;
        })}
      </main>
      </MobileScroll>
    </section>;
}

export default function Prototype() {
  const [info,setInfo]=useState(false);
  const makeDetail=(tactic:Tactic,contextLabel?:string):FlowScreen=>({id:tactic.id,title:tactic.name,headerHeight:62,header:flow=><AppHeader title={tactic.name} back={flow.pop}/>,render:()=> <TacticPlayer tactic={tactic} contextLabel={contextLabel}/>});
  const makeCombination=(combination:Combination):FlowScreen=>({id:combination.id,title:combination.name,headerHeight:62,header:flow=><AppHeader title={combination.name} back={flow.pop} menu={()=>setInfo(true)}/>,render:flow=><CombinationDetail combination={combination} openTactic={(tactic,contextLabel)=>flow.push(makeDetail(tactic,contextLabel))}/>});
  const initial:FlowScreen={id:"tactics",title:"网球战术",headerHeight:82,header:()=> <AppHeader title="网球战术" menu={()=>setInfo(true)}/>,render:flow=><TacticsList openTactic={(tactic,event)=>{event.currentTarget.blur();flow.push(makeDetail(tactic));}} openCombination={combination=>flow.push(makeCombination(combination))}/>};
  return <div className="tennis-app"><FlowStack initial={initial}/><BottomSheet open={info} onOpenChange={setInfo} title="网球战术演示" description="用球路和跑位，看懂青少年单打战术。" snap={.54}><div className="about-demo"><p><strong>18 个单项战术、6 组搭配、12 种应变</strong>。先选比赛情境，再看球路与临场选择；组合中的演示聚焦对应阶段。</p><p>蓝色是我方，红色是对手，黄色是网球；亮线为当前一拍，淡线为已完成球路，圆环提示下一关键位置。</p><p className="about-note">内容适合已能进行全场对打的青少年。若仍使用红、橙或绿球，请按球场大小和实际能力调整目标；战术示意不保证得分，也不能替代教练现场判断。</p><p className="about-source">教学原则参考 ITF、LTA 和 USTA 公开资料；战术组合与练习为教学化编排。</p><button className="sheet-done" onClick={()=>setInfo(false)}>知道了</button></div></BottomSheet></div>;
}
