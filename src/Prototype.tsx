import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, InfoCircledIcon, Cross2Icon, ReaderIcon, PlayIcon, PauseIcon, ResetIcon, TrackNextIcon, TrackPreviousIcon } from "@radix-ui/react-icons";
import { BottomSheet, Carousel, FlowStack, MobileScroll, type FlowScreen } from "./mobile";

import { categories, combinations, libraryStats, tacticGuides, tactics, type CategoryFilter } from "./content/library";
import type { Combination, Moment, Point, Tactic, TacticExcerpt } from "./content/types";
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
const firstClause = (text: string) => text.split(/[；。]/)[0].trim();
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
    <div className="stage-progress" aria-label={`当前第 ${currentStep} 步，共 ${totalSteps} 步`}><span>步骤 {currentStep}/{totalSteps}</span><div>{Array.from({length:totalSteps},(_,index)=><i key={index} className={index<completedSteps?"is-complete":index===currentStep-1?"is-active":""}/>)}</div><span className="stage-hint">圆环＝下一落点</span></div>
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
  const meta = tacticMeta(tactic), guide=tacticGuides[tactic.id];
  const playerDecisions=tactic.previewDecisions??guide.decisions;
  const currentDecision=playerDecisions[Math.min(2,Math.floor((elapsed/tactic.duration)*3))];
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
    <button className="guide-entry decision-entry" aria-label={`打开战术讲解。当前判断：${currentDecision}`} onClick={()=>{setPlaying(false);setSettings(true);}}>
      <span className="decision-entry-head"><ReaderIcon/><strong>当前判断</strong><small>完整讲解</small><ChevronRightIcon/></span>
      <span className="decision-entry-copy" aria-live="polite">{currentDecision}</span>
      <span className="decision-entry-cue"><b>记住</b>{meta.cue}</span>
    </button>
    </div><BottomSheet open={settings} onOpenChange={setSettings} title={tactic.name} description={`${meta.category} · ${meta.level} · 战术讲解`} snap={.9}>
      <button className="guide-close" aria-label="关闭战术讲解" onClick={()=>setSettings(false)}><Cross2Icon/></button>
      <TacticExplanation tactic={tactic}/>
      <button className="sheet-done" onClick={()=>setSettings(false)}>回到动画</button>
    </BottomSheet></div>;
}

function combinationExample(id:string, excerpt?:TacticExcerpt):Tactic {
  const source=tactics.find(tactic=>tactic.id===id)!;
  const focus:Record<string,{from:number;to?:number;name:string;opening:string;ending?:string;decisions?:[string,string,string]}>={
    backhand:{from:0,to:4,name:"深球压弱侧，观察回球",opening:"先用深球施压，观察对手",ending:"看清回球，再选择下一招"},
    "three-cross-one-line":{from:0,to:4,name:"斜线相持，等待短球",opening:"先建立斜线，逐拍看深浅",ending:"可控短球出现，准备向前"},
    "wrong-foot":{from:2,name:"看准回位，再打回头",opening:"已把对手带开，先看回位脚步"},
    "wide-middle":{from:4,name:"调动后，深中路收住角度",opening:"对手正在回位，选择深中路"},
    "drop-pass":{from:0,to:3,name:"小球引上前，观察网前位置",opening:"有时间到位，先用小球改变距离",ending:"看对手站位，再选穿越或挑高"},
    "drop-lob":{from:2,name:"对手贴网，挑向身后",opening:"对手已到网前，先准备回球"},
    "front-back":{from:2,name:"短回球：跟进与补位",opening:"对手已追到小球，观察回球深浅"},
  };
  const fallback=focus[id];
  const selected=excerpt?{
    from:excerpt.fromFrame??0,
    to:excerpt.toFrame,
    name:excerpt.name??source.name,
    opening:excerpt.opening??source.frames[excerpt.fromFrame??0].caption,
    ending:excerpt.ending,
    decisions:excerpt.decisions,
  }:fallback;
  if(!selected)return source;
  const frames=source.frames.slice(selected.from,(selected.to??source.frames.length-1)+1);
  const from=frames[0].t,span=frames[frames.length-1].t-from;
  const previewFrames=frames.map((moment,index)=>({...moment,t:(moment.t-from)/span,caption:index===0?selected.opening:index===frames.length-1&&selected.ending?selected.ending:moment.caption}));
  const previewDecisionIndexes=[0,Math.floor((frames.length-1)/2),frames.length-1];
  const cleanDecision=(caption:string)=>caption.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/,"");
  const previewDecisions=selected.decisions??previewDecisionIndexes.map(index=>cleanDecision(previewFrames[index].caption)) as [string,string,string];
  return {...source,name:selected.name,excerpt:true,previewDecisions,duration:Math.round(Math.max(6,source.duration*span)*10)/10,
    frames:previewFrames};
}
function CombinationDetail({ combination, openTactic }: { combination:Combination; openTactic:(tactic:Tactic,contextLabel:string)=>void }) {
  const [variantOpen,setVariantOpen]=useState<number | null>(null);
  const openExample=(id:string,contextLabel:string,excerpt?:TacticExcerpt)=>openTactic(combinationExample(id,excerpt),contextLabel);
  return <MobileScroll className="combination-screen"><div className="combination-content">
    <div className="combination-summary"><span>{combination.category} · {combination.stages.length} 阶段搭配</span><h2>{combination.goal}</h2><p>{combination.when}</p></div>
    <div className="combination-route" aria-label={`${combination.name}的比赛路径`}>
      <div className="combination-route-title"><strong>比赛路径</strong><span>先读信号，再进下一招</span></div>
      <ol>{combination.stages.map((stage,index)=>{const tactic=combinationExample(stage.tacticId,stage.excerpt);return <li key={`${stage.tacticId}-route`}><span>{index+1}</span><strong>{tactic.name}</strong></li>;})}</ol>
    </div>
    <div className="combination-section-title"><h2>按来球，一步步搭配</h2><p>每招可单独看球路，不必按固定拍数完成。</p></div>
    <ol className="combination-stages">{combination.stages.map((stage,index)=>{const tactic=combinationExample(stage.tacticId,stage.excerpt);return <li className="combination-stage" key={`${stage.tacticId}-${index}`}>
      <div className="combination-stage-top"><span>{String(index+1).padStart(2,"0")}</span><h3>{tactic.name}</h3></div>
      <div className="combination-cue"><strong>先执行</strong><p>{stage.cue}</p></div><div className="combination-transition"><strong>{index===combination.stages.length-1?"打完继续判断":"看到这个，再进下一招"}</strong><p>{stage.transition}</p></div>
      <button className="watch-example" onClick={()=>openExample(stage.tacticId,`${combination.name} · 阶段 ${index+1}`,stage.excerpt)} aria-label={`观看阶段 ${index+1}：${tactic.name}`}><PlayIcon/>看这一招的球路<ChevronRightIcon/></button>
    </li>;})}</ol>
    <div className="combination-section-title variant-title"><h2>对手变了，换一招</h2><p>出现下面的信号，就在当下调整。</p></div>
    <div className="combination-variants">{combination.variants.map((variant,index)=>{const open=variantOpen===index;return <section className="combination-variant" key={variant.name}>
      <button className="variant-trigger" aria-expanded={open} aria-controls={`variant-${combination.id}-${index}`} onClick={()=>setVariantOpen(open?null:index)}><span><strong>{variant.name}</strong><small>{variant.trigger}</small></span><ChevronDownIcon className={open?"is-open":""}/></button>
      <div className="variant-response" id={`variant-${combination.id}-${index}`} hidden={!open}><p>{variant.response}</p><button className="watch-example" onClick={()=>openExample(variant.tacticId,`${combination.name} · 应变：${variant.name}`,variant.excerpt)} aria-label={`观看衍生打法：${variant.name}`}><PlayIcon/>看对应打法<ChevronRightIcon/></button></div>
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
        {mode==="combinations"?visibleCombinations.map((combination)=><button className="tactic-card combo-card" key={combination.id} onClick={()=>openCombination(combination)} aria-label={`${combination.name}，${combination.stages.length} 个阶段，${combination.variants.length} 种衍生选择`}><div className="card-copy"><div className="combo-card-label">{combination.series??combination.category} · 组合打法</div><h2>{combination.name}</h2><p className="card-purpose">{combination.goal}</p><div className="card-meta"><span>{combination.stages.length} 阶段搭配</span><span>{combination.variants.length} 种应变</span></div></div><ChevronRightIcon className="card-arrow"/></button>):visibleTactics.map(tactic => {
          const meta = tacticMeta(tactic);
          return <button key={tactic.id} className="tactic-card" onClick={event => openTactic(tactic,event)} aria-label={`${tactic.name}，${tactic.duration}秒，${meta.category}，${meta.level}`}>
            <div className="card-picture" aria-hidden="true"><img src="/assets/tennis/tennis-ball.png" alt="" draggable={false}/><span>{String(tactics.indexOf(tactic)+1).padStart(2,"0")}</span></div>
            <div className="card-copy">{tactic.series&&<span className="card-series">{tactic.series}</span>}<h2>{tactic.name}</h2><p className="card-purpose">{meta.goal}</p><div className="card-meta"><span>{meta.category}</span><span>{meta.level}</span><span>{tactic.duration} 秒演示</span></div></div><ChevronRightIcon className="card-arrow"/>
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
  return <div className="tennis-app"><FlowStack initial={initial}/><BottomSheet open={info} onOpenChange={setInfo} title="网球战术演示" description="用球路和跑位，看懂青少年单打战术。" snap={.56}><div className="about-demo"><p><strong>{libraryStats.tactics} 个单项战术、{libraryStats.combinations} 组搭配、{libraryStats.variants} 种应变</strong>。先选比赛情境，再看球路与临场选择；组合中的演示聚焦对应阶段。</p><p>蓝色是我方，红色是对手，黄色是网球；亮线为当前一拍，淡线为已完成球路，圆环提示下一落点。</p><p className="about-note">内容适合已能进行全场对打的青少年。若仍使用红、橙或绿球，请按球场大小和实际能力调整目标；战术示意不保证得分，也不能替代教练现场判断。</p><p className="about-source">教学原则参考 ITF、LTA 和 USTA 公开资料；战术组合与练习为教学化编排。</p><button className="sheet-done" onClick={()=>setInfo(false)}>知道了</button></div></BottomSheet></div>;
}
