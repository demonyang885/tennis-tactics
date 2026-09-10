import type { InteractiveRally, Moment, Point, RallyChoice, RallyNode, RallyObservation, RallyScenario, RallyScenarioChoice } from "./types";

const choice=(signal:string,action:string,nextNodeId:string,intent:RallyChoice["intent"]):RallyChoice=>({signal,action,nextNodeId,intent});
const practiceChoice=(action:string,nextNodeId:string,intent:RallyScenarioChoice["intent"],benefit:string,caution:string,excerpt:RallyScenarioChoice["excerpt"]):RallyScenarioChoice=>({action,nextNodeId,intent,benefit,caution,excerpt});
const snapshot=(ball:Point,me:Point,opponent:Point,caption:string,loft=0,ballHeight?:number):Moment=>({t:1,ball,me,opponent,caption,loft,...(ballHeight===undefined?{}:{ballHeight})});
const scenario=(prompt:string,observation:RallyObservation,finalMoment:Moment,choices:RallyScenarioChoice[]):RallyScenario=>({prompt,observation,snapshot:finalMoment,choices});
const nextPrompt="对手回球了，你看到什么？";

export const baseRallyNodes:RallyNode[]=[
  {
    id:"serve-open", tacticId:"serve-plus-one", excerpt:{fromFrame:0,toFrame:2,name:"发球带开，观察接发",ending:"接发来了，先看深浅与自己的平衡"}, cue:"用发球带开对手，落地后马上准备实际接发。", prompt:nextPrompt,
    choices:[
      choice("接发落点变短，你能在底线内平衡击球。","打深后跟进","approach","进攻"),
      choice("接发仍深，双方都留在底线附近。","斜线先稳住","baseline-rally","稳住"),
      choice("接发把你拉开，身体还没有站稳。","高深回中争取时间","defend","稳住"),
    ],
    scenario:scenario(
      "同一个短接发，你会怎样接管这一拍？",
      {ball:"接发落在发球线后，低于腰部",self:"底线内半步，身体已经站稳",opponent:"从外侧向中路回位"},
      snapshot([.6,.73],[.6,.82],[.34,.17],"接发变短，你已站稳；对手正在回中"),
      [
        practiceChoice("重旋转打深斜线并跟进","approach","进攻","先用深度打开场地，再沿球路向前接管。","进攻球如果不够深，停在发球线附近会留下穿越角度。",{fromFrame:0,toFrame:3,name:"重旋转打深斜线并跟进",opening:"短接发到来，先在身前打深",ending:"沿球路跟进，分腿后观察第一截击"}),
        practiceChoice("深打回头，再看是否跟进","wrong-foot","变化","利用对手仍在回中的脚步，让他重新改变方向。","对手一旦停稳，回头球就可能直接送回他的击球区。",{fromFrame:2,name:"深打回头，再看是否跟进",opening:"短接发到来，先看对手回中脚步",ending:"打回头后继续看回球，再决定是否跟进"}),
        practiceChoice("深中路收住角度","wide-middle","稳住","先缩小对手能使用的角度，让下一拍更容易判断。","这个选择更稳，但会给对手多一点回位时间。",{fromFrame:4,name:"深中路收住角度",opening:"对手正在回中，选择深中路大目标",ending:"深中路收住角度，重新准备下一拍"}),
      ],
    ),
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
    scenario:scenario(
      "对手站得很后，这个中短球你怎样改变距离？",
      {ball:"回球落在发球线后，速度已经下降",self:"底线内一步，能在身前平衡击球",opponent:"站在底线后方，位置偏深"},
      snapshot([.48,.72],[.48,.8],[.7,.09],"回球变短，你已站稳；对手仍留在后场"),
      [
        practiceChoice("放短，把对手带进前场","drop","变化","改变前后距离，迫使对手从底线外向前启动。","小球如果太高或太长，会变成对手主动进场的机会。",{fromFrame:0,toFrame:3,name:"放短，把对手带进前场",opening:"对手站得很后，先在平衡位置放短",ending:"对手已经向前，重新看身旁与身后"}),
        practiceChoice("继续深压反手大区域","deep-pressure","进攻","保持深度，让对手继续在后场移动处理。","只追求角度会增加失误，目标仍要留出边线余量。",{fromFrame:0,toFrame:2,name:"继续深压反手大区域",opening:"中短球到来，先把深度送向反手大区域",ending:"对手回球，重新观察深浅与自己的平衡"}),
        practiceChoice("深中路重新组织","wide-middle","稳住","把角度收小，先保住主动位置和下一拍准备。","节奏会稍微放慢，需要继续观察下一球是否真的变短。",{fromFrame:4,name:"深中路重新组织",opening:"中短球到来，选择深中路收住角度",ending:"深中路重新组织，继续准备下一拍"}),
      ],
    ),
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
    id:"approach", tacticId:"approach-follow", excerpt:{fromFrame:0,toFrame:3,name:"短球进攻，分腿看第一截击",ending:"对手回球来到网带上方，你已分腿站稳"}, cue:"处理短球后沿球路补位，在对手击球时分腿准备。", prompt:"对手怎样化解你的上网？",
    choices:[
      choice("回球来到低或中等高度，你能稳定截击。","第一截击先打深","volley-deep","稳住"),
      choice("对手把球挑向身后，你有时间转身找落点。","侧身追球再高压","overhead","进攻"),
      choice("进攻球没有形成压力，深回球让你难以继续向前。","停住上网重新相持","baseline-rally","稳住"),
    ],
    scenario:scenario(
      "同一个可截击来球，你会先换取什么？",
      {ball:"回球略高于网带，速度不快",self:"发球线内已经分腿站稳",opponent:"留在后场一侧，正在移动"},
      snapshot([.5,.53],[.53,.57],[.69,.14],"回球在网带上方，你已分腿站稳"),
      [
        practiceChoice("第一截击先送深","volley-deep","稳住","把对手留在后场，也给自己继续向前补位的时间。","截击不够深时，对手仍可能在平衡位置打出穿越。",{fromFrame:0,toFrame:2,name:"第一截击先送深",opening:"回球在网带上方，先稳定第一截击",ending:"第一截击送深后，继续向前补位"}),
        practiceChoice("第一截击打向开放区域","volley-open","进攻","利用对手仍在一侧的位置，立即扩大他的跑动距离。","击球点若低于网带，就要缩小角度并先保证过网。",{fromFrame:3,name:"第一截击打向开放区域",opening:"站稳后把第一截击送向开放区域",ending:"打向开放区域后继续补位，准备下一球"}),
      ],
    ),
  },
  {
    id:"baseline-rally", tacticId:"three-cross-one-line", cue:"用斜线大目标维持节奏，每拍重新观察深浅与站位。", prompt:nextPrompt,
    choices:[
      choice("对手回球变短，你能提前到达并保持平衡。","短球到来再向前","approach","进攻"),
      choice("回球仍深，双方都在稳定的底线位置。","继续斜线相持","baseline-rally","稳住"),
      choice("你被角度带出场外，击球时间开始不足。","高深回中争取时间","defend","稳住"),
    ],
    scenario:scenario(
      "斜线回球终于变短，你会怎样使用这个机会？",
      {ball:"回球落在发球线附近，弹跳到腰部",self:"已经进入底线内，并能平衡击球",opponent:"被带到斜线一侧，正在回位"},
      snapshot([.64,.7],[.63,.77],[.3,.14],"斜线回球变短，你已提前进入场内"),
      [
        practiceChoice("打深后沿球路向前","approach","进攻","用短球取得场地位置，并准备在网前继续这一分。","进攻球要先有深度，向前时也要在对手击球前分腿。",{fromFrame:0,toFrame:3,name:"打深后沿球路向前",opening:"短球到来，先在身前打深",ending:"沿球路跟进，分腿后观察第一截击"}),
        practiceChoice("深打回头，留在底线内","wrong-foot","变化","利用对手正在回位的方向，保持自己在场内的主动位置。","对手若已经停稳，就改打更大的安全区域。",{fromFrame:2,name:"深打回头，留在底线内",opening:"短球到来，先确认对手仍在回位",ending:"打回头后留在底线内，继续看下一球"}),
        practiceChoice("继续斜线大目标","baseline-rally","稳住","保留最多过网与边线余量，等待更清楚的进攻球。","会放掉一部分场地优势，打完要及时回到可控位置。",{fromFrame:0,toFrame:2,name:"继续斜线大目标",opening:"先走较长的斜线，保留边线余量",ending:"斜线大目标打出后，重新观察回球"}),
      ],
    ),
  },
  {
    id:"wrong-foot", tacticId:"wrong-foot", cue:"看准对手仍在回位，再把球送回其刚离开的区域。", prompt:nextPrompt,
    choices:[
      choice("对手追到球并把回球送深，双方重新站稳。","回到斜线相持","baseline-rally","稳住"),
      choice("对手勉强回短，你能进入场内击球。","抓住短球向前","approach","进攻"),
      choice("你打完失去平衡，对手回球又把你拉开。","高深回中恢复","defend","稳住"),
    ],
    scenario:scenario(
      "对手赶到球但仍在回中，你怎样组织下一拍？",
      {ball:"回球落在底线内，深度可以控制",self:"底线后方已经恢复平衡",opponent:"从侧边继续向中路移动"},
      snapshot([.48,.78],[.5,.86],[.37,.1],"对手把球救回，脚步仍在向中路移动"),
      [
        practiceChoice("顺斜线打向开放一侧","baseline-rally","进攻","顺着较长路线把对手继续留在移动中。","目标要离边线有余量，否则主动局面也会变成无谓失误。",{fromFrame:0,toFrame:2,name:"顺斜线打向开放一侧",opening:"对手仍在回中，顺斜线打向开放一侧",ending:"顺斜线打出后，重新看对手的回球"}),
        practiceChoice("再打一次回头","wrong-foot","变化","再次利用对手的移动方向，让他急停后重新启动。","同一选择连续使用会被预判，先确认他的脚步还没停。",{fromFrame:2,name:"再打一次回头",opening:"对手脚步还没停，再看一次回位方向",ending:"再次打回头后，继续准备下一拍"}),
        practiceChoice("深中路重新组织","wide-middle","稳住","先收住角度，让自己回到能兼顾两侧的位置。","对手会获得更多恢复时间，下一拍仍要重新观察。",{fromFrame:4,name:"深中路重新组织",opening:"对手仍在回中，先打深中路收住角度",ending:"深中路重新组织，回到能兼顾两侧的位置"}),
      ],
    ),
  },
  {
    id:"wide-middle", tacticId:"wide-middle", cue:"用深中路收住对手可用角度，同时让自己重新站稳。", prompt:nextPrompt,
    choices:[
      choice("双方回到底线中性位置，来球深度可控。","斜线重新组织","baseline-rally","稳住"),
      choice("对手回球变短，你能平衡地进入场内。","短球到来再进攻","approach","进攻"),
      choice("对手再次把你带到边线，身体没有站稳。","高深回中脱困","defend","稳住"),
    ],
    scenario:scenario(
      "双方都站稳，这个深中路来球你怎样重新开始？",
      {ball:"深中路来球，仍有完整击球时间",self:"底线后方站稳，能完整挥拍",opponent:"回到后场中路，开放角度不大"},
      snapshot([.5,.79],[.5,.87],[.5,.11],"深中路回球到来，双方都回到平衡"),
      [
        practiceChoice("斜线大目标建立相持","baseline-rally","稳住","用较长路线和较大目标重新建立稳定节奏。","不要为了立刻打开角度而把第一拍压得太靠边线。",{fromFrame:0,toFrame:2,name:"斜线大目标建立相持",opening:"双方都站稳，先用斜线大目标开始",ending:"斜线回球到来，重新判断深浅"}),
        practiceChoice("深压反手侧，等待下一球","deep-pressure","进攻","先用深度测试一侧，再根据回球质量决定是否变节奏。","来球仍深时只求落点，不要同时追求过多速度和角度。",{fromFrame:0,toFrame:2,name:"深压反手侧，等待下一球",opening:"双方都站稳，先把深度送向反手侧",ending:"对手回球，重新观察是否出现短球"}),
      ],
    ),
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
    scenario:scenario(
      "第二次截击更舒服，你会怎样处理？",
      {ball:"第二球来到身前，比第一截击更高更慢",self:"网前已再次分腿，身体保持稳定",opponent:"仍在后场一侧，尚未回到中路"},
      snapshot([.45,.49],[.49,.45],[.62,.13],"第二球更高、更慢，你已在网前站稳"),
      [
        practiceChoice("第二截击送向大空档","volley-open","进攻","在稳定击球点利用开放区域，减少对手再次回球的时间。","先确认球高于可控截击点；低球仍应优先打深。",{fromFrame:2,name:"第二截击送向大空档",opening:"第二球更高、更慢，站稳后看开放区域",ending:"第二截击送向空档后，继续覆盖"}),
        practiceChoice("再截深，继续覆盖","volley-deep","稳住","继续把对手留在后场，让自己维持有利的网前位置。","如果已经出现很大的空档，过度保守会让对手多打一拍。",{fromFrame:0,toFrame:2,name:"再截深，继续覆盖",opening:"第二球来到身前，先把截击送深",ending:"再截深后继续向前覆盖"}),
      ],
    ),
  },
  {
    id:"volley-open", tacticId:"second-volley-open-court", cue:"第一截击已经把对手留在后场；下一球更高更慢，站稳后再找大空档。", prompt:nextPrompt,
    choices:[
      choice("对手仍能把球压低，你必须在低点击球。","截深继续覆盖","volley-deep","稳住"),
      choice("对手用挑高越过你，球仍在可追到的位置。","转身处理高压","overhead","进攻"),
    ],
    scenario:scenario(
      "对手用挑高化解，你会怎样保住这一分？",
      {ball:"挑高球越过头顶，但仍在可以追到的范围",self:"网前转身后保持侧向移动",opponent:"留在后场，等待你处理高球"},
      snapshot([.54,.5],[.5,.47],[.36,.13],"对手挑向身后，你转身后仍能追到",1,1),
      [
        practiceChoice("侧身到位后打高压大目标","overhead","进攻","到位后把球送入后场大区域，继续保持主动。","身体后仰或球已越过头顶时，不要勉强起跳重扣。",{fromFrame:0,name:"侧身到位后打高压大目标",opening:"挑高球越过头顶，先转身判断落点",ending:"能平衡到位才打高压大目标"}),
        practiceChoice("让球落地，斜线回深","baseline-rally","稳住","用更多时间找到平衡，再用斜线大目标把这一分继续下去。","落地后对手也有回位时间，回球要留出足够深度。",{fromFrame:0,toFrame:2,name:"让球落地，斜线回深",opening:"困难挑高先退后，让球落地再处理",ending:"落地后用斜线大目标回深"}),
      ],
    ),
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
  {combinationId:"serve-open-finish",startNodeId:"serve-open",decisionPractice:{checkpointEvery:3}},
  {combinationId:"return-build-approach",startNodeId:"return-middle"},
  {combinationId:"pressure-read-recovery",startNodeId:"weak-side"},
  {combinationId:"defend-reset-attack",startNodeId:"defend"},
  {combinationId:"deep-short-net-choice",startNodeId:"deep-pressure"},
  {combinationId:"pressure-point-clear-plan",startNodeId:"big-target"},
  {combinationId:"net-player-low-first",startNodeId:"dip"},
  {combinationId:"approach-first-volley-deep",startNodeId:"approach"},
];
