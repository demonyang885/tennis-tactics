import type { InteractiveRally, RallyChoice, RallyNode } from "./types";

const choice=(signal:string,action:string,nextNodeId:string,intent:RallyChoice["intent"]):RallyChoice=>({signal,action,nextNodeId,intent});
const nextPrompt="对手回球了，你看到什么？";

export const baseRallyNodes:RallyNode[]=[
  {
    id:"serve-open", tacticId:"serve-plus-one", excerpt:{fromFrame:0,toFrame:2,name:"发球带开，观察接发",ending:"接发来了，先看深浅与自己的平衡"}, cue:"用发球带开对手，落地后马上准备实际接发。", prompt:nextPrompt,
    choices:[
      choice("接发落点变短，你能在底线内平衡击球。","打深后跟进","approach","进攻"),
      choice("接发仍深，双方都留在底线附近。","斜线先稳住","baseline-rally","稳住"),
      choice("接发把你拉开，身体还没有站稳。","高深回中争取时间","defend","稳住"),
    ],
  },
  {
    id:"return-middle", tacticId:"return-middle", cue:"缩短准备，把接发送向深中路，先清楚进入这一分。", prompt:"接发之后，下一球是什么情况？",
    choices:[
      choice("下一球深度可控，你已经恢复平衡。","建立斜线相持","baseline-rally","稳住"),
      choice("下一球明显变短，你能提前进入场内。","抓短球向前","approach","进攻"),
      choice("下一球再次把你带到场外，击球时间不足。","高深回中脱困","defend","稳住"),
    ],
  },
  {
    id:"weak-side", tacticId:"backhand", cue:"用可控深球压向较难处理的一侧，同时观察回球质量。", prompt:"对手回位时，你读到什么？",
    choices:[
      choice("对手正在向中间移动，你能站稳处理下一球。","看脚步打回头","wrong-foot","变化"),
      choice("对手已经停稳，回头球的转向机会消失。","深中路收住角度","wide-middle","稳住"),
      choice("两侧都能稳定回深，暂时看不出明显弱侧。","回到斜线相持","baseline-rally","稳住"),
    ],
  },
  {
    id:"defend", tacticId:"defend-high-middle", cue:"把球送向高深中路，用飞行时间恢复能兼顾两侧的位置。", prompt:"这一拍脱困后，场面怎样？",
    choices:[
      choice("你已经回到平衡位置，下一球深度可控。","恢复斜线相持","baseline-rally","稳住"),
      choice("节奏仍乱，但对手留在底线，你还能控制高度。","继续高深调整","moonball","稳住"),
      choice("对手趁机向网前推进，你能站稳让球下坠。","先压到脚下","dip","变化"),
    ],
  },
  {
    id:"deep-pressure", tacticId:"backhand", cue:"先用深球把对手留在后场，等待可控的变节奏机会。", prompt:"深球之后，哪一个信号最清楚？",
    choices:[
      choice("对手仍站得较后，你能平衡处理下一球。","放短改变距离","drop","变化"),
      choice("回球仍深，暂时不适合缩短落点。","继续深球相持","baseline-rally","稳住"),
      choice("回球把你拉开，身体正在失去平衡。","高深回中恢复","defend","稳住"),
    ],
  },
  {
    id:"big-target", tacticId:"big-target-pressure", cue:"先呼吸并选定大目标，用完整动作开始关键分。", prompt:"进入回合后，先处理哪个信号？",
    choices:[
      choice("双方都在底线，你能控制常规来球。","斜线建立节奏","baseline-rally","稳住"),
      choice("对手回出可控短球，你能提前到位。","抓住短球向前","approach","进攻"),
      choice("你被拉到场外，当前击球点并不稳定。","高深回中脱困","defend","稳住"),
    ],
  },
  {
    id:"dip", tacticId:"dip-at-feet", cue:"用有过网余量的旋转压向脚下，先逼对手低点击球。", prompt:"对手低截之后，空间在哪里？",
    choices:[
      choice("低截变短，而且对手身旁出现清楚通道。","看准身旁穿越","pass","进攻"),
      choice("对手继续贴近球网，你能控制挑高弧线。","挑向身后深区","lob","变化"),
      choice("低截仍深，对手也能封住两侧角度。","继续把球压低","dip","稳住"),
    ],
  },
  {
    id:"approach", tacticId:"approach-follow", cue:"处理短球后沿球路补位，在对手击球时分腿准备。", prompt:"对手怎样化解你的上网？",
    choices:[
      choice("回球来到低或中等高度，你能稳定截击。","第一截击先打深","volley-deep","稳住"),
      choice("对手把球挑向身后，你有时间转身找落点。","侧身追球再高压","overhead","进攻"),
      choice("进攻球没有形成压力，深回球让你难以继续向前。","停住上网重新相持","baseline-rally","稳住"),
    ],
  },
  {
    id:"baseline-rally", tacticId:"three-cross-one-line", cue:"用斜线大目标维持节奏，每拍重新观察深浅与站位。", prompt:nextPrompt,
    choices:[
      choice("对手回球变短，你能提前到达并保持平衡。","短球到来再向前","approach","进攻"),
      choice("回球仍深，双方都在稳定的底线位置。","继续斜线相持","baseline-rally","稳住"),
      choice("你被角度带出场外，击球时间开始不足。","高深回中争取时间","defend","稳住"),
    ],
  },
  {
    id:"wrong-foot", tacticId:"wrong-foot", cue:"看准对手仍在回位，再把球送回其刚离开的区域。", prompt:nextPrompt,
    choices:[
      choice("对手追到球并把回球送深，双方重新站稳。","回到斜线相持","baseline-rally","稳住"),
      choice("对手勉强回短，你能进入场内击球。","抓住短球向前","approach","进攻"),
      choice("你打完失去平衡，对手回球又把你拉开。","高深回中恢复","defend","稳住"),
    ],
  },
  {
    id:"wide-middle", tacticId:"wide-middle", cue:"用深中路收住对手可用角度，同时让自己重新站稳。", prompt:nextPrompt,
    choices:[
      choice("双方回到底线中性位置，来球深度可控。","斜线重新组织","baseline-rally","稳住"),
      choice("对手回球变短，你能平衡地进入场内。","短球到来再进攻","approach","进攻"),
      choice("对手再次把你带到边线，身体没有站稳。","高深回中脱困","defend","稳住"),
    ],
  },
  {
    id:"moonball", tacticId:"moonball", cue:"用高深球延长飞行时间，先让脚步与节奏重新稳定。", prompt:"高深球之后，对手怎样回应？",
    choices:[
      choice("你已恢复平衡，对手仍留在底线相持。","恢复常规斜线","baseline-rally","稳住"),
      choice("对手提前进入场内，并继续向网前压进。","让下一球压低","dip","变化"),
      choice("你仍在场外跑动，还需要一拍调整时间。","继续高深回中","defend","稳住"),
    ],
  },
  {
    id:"drop", tacticId:"drop-pass", excerpt:{fromFrame:0,toFrame:3,name:"放短后，看对手站位",ending:"对手已经向前，重新看身旁与身后"}, cue:"在平衡位置放短，把对手带到前场后重新看站位。", prompt:"对手追到小球后，下一拍在哪里？",
    choices:[
      choice("对手贴近一侧，身旁出现可控的穿越路线。","从身旁穿越","pass","进攻"),
      choice("对手继续贴网，身后的后场明显开放。","挑高越过身后","lob","变化"),
      choice("对手回球也很短，你必须进入场内接球。","先跟进再看位置","front-back","稳住"),
    ],
  },
  {
    id:"pass", tacticId:"drop-pass", excerpt:{fromFrame:2,name:"看准身旁，再穿越",opening:"对手已经低点触球，重新看身旁空间",ending:"有空间才穿越，打完继续准备"}, cue:"重新确认对手位置，有侧向空间才把球穿过身旁。", prompt:nextPrompt,
    choices:[
      choice("对手把球救回后退到底线，双方重新站稳。","回到斜线相持","baseline-rally","稳住"),
      choice("对手仍留在网前，而且下一球还能被你压低。","继续压向脚下","dip","稳住"),
    ],
  },
  {
    id:"lob", tacticId:"drop-lob", excerpt:{fromFrame:2,name:"贴网后挑向身后",opening:"对手已经贴近网前，先看身后空间"}, cue:"确认对手贴网而你已站稳，再把球挑向身后深区。", prompt:nextPrompt,
    choices:[
      choice("对手退回后场并把球救回，双方重新平衡。","回到斜线相持","baseline-rally","稳住"),
      choice("对手再次来到网前，你仍能控制低球。","继续压向脚下","dip","稳住"),
    ],
  },
  {
    id:"front-back", tacticId:"front-back", cue:"跟进短回球并用小步站稳，再看对手停在前场还是后退。", prompt:nextPrompt,
    choices:[
      choice("你在场内站稳，对手回球再次变短。","继续向前接管","approach","进攻"),
      choice("对手仍贴近网前，身后保留较大空间。","挑向身后深区","lob","变化"),
      choice("对手回出深球，你需要退回可控位置。","回到斜线相持","baseline-rally","稳住"),
    ],
  },
  {
    id:"volley-deep", tacticId:"first-volley-deep", cue:"低或中等高度的第一截击先送深，随球继续向前覆盖。", prompt:"第一截击之后，对手回了什么球？",
    choices:[
      choice("下一球更高、更慢，你已经在网前站稳。","第二截击再找空档","volley-open","进攻"),
      choice("下一球仍低而快，击球点不适合做角度。","再把截击送深","volley-deep","稳住"),
      choice("对手直接挑向身后，你有时间转身判断。","侧身追球再高压","overhead","进攻"),
    ],
  },
  {
    id:"volley-open", tacticId:"second-volley-open-court", cue:"第一截击已经把对手留在后场；下一球更高更慢，站稳后再找大空档。", prompt:nextPrompt,
    choices:[
      choice("对手仍能把球压低，你必须在低点击球。","截深继续覆盖","volley-deep","稳住"),
      choice("对手用挑高越过你，球仍在可追到的位置。","转身处理高压","overhead","进攻"),
    ],
  },
  {
    id:"overhead", tacticId:"overhead-big-target", cue:"先侧向移动确认能到位，再把高压球送进后场大区域。", prompt:nextPrompt,
    choices:[
      choice("对手把球低低救回，你仍在网前覆盖。","下一截击先打深","volley-deep","稳住"),
      choice("对手退到底线并把球回深，你选择重新组织。","回到斜线相持","baseline-rally","稳住"),
      choice("对手再次挑高，而且你仍能平衡到位。","继续高压大目标","overhead","进攻"),
    ],
  },
];

export const baseInteractiveRallies:InteractiveRally[]=[
  {combinationId:"serve-open-finish",startNodeId:"serve-open"},
  {combinationId:"return-build-approach",startNodeId:"return-middle"},
  {combinationId:"pressure-read-recovery",startNodeId:"weak-side"},
  {combinationId:"defend-reset-attack",startNodeId:"defend"},
  {combinationId:"deep-short-net-choice",startNodeId:"deep-pressure"},
  {combinationId:"pressure-point-clear-plan",startNodeId:"big-target"},
  {combinationId:"net-player-low-first",startNodeId:"dip"},
  {combinationId:"approach-first-volley-deep",startNodeId:"approach"},
];
