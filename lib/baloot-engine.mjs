export const SUITS=["♠","♥","♦","♣"];
export const SUN_ORDER=["A","10","K","Q","J","9","8","7"];
export const TRUMP_ORDER=["J","9","A","10","K","Q","8","7"];
export const SUN_POINTS={A:11,"10":10,K:4,Q:3,J:2,"9":0,"8":0,"7":0};
export const TRUMP_POINTS={J:20,"9":14,A:11,"10":10,K:4,Q:3,"8":0,"7":0};

export function card(rank,suit){return{rank,suit,id:`${rank}${suit}`}}
export function strength(c,mode,trumpSuit){
  const order=mode==="trump"&&c.suit===trumpSuit?TRUMP_ORDER:SUN_ORDER;
  return order.length-order.indexOf(c.rank);
}
export function cardPoints(c,mode,trumpSuit){return mode==="trump"&&c.suit===trumpSuit?TRUMP_POINTS[c.rank]:SUN_POINTS[c.rank]}
export function winningPlay(trick,mode,trumpSuit){
  if(!trick.length)return null; const led=trick[0].card.suit;
  return trick.reduce((best,play)=>beats(play.card,best.card,led,mode,trumpSuit)?play:best);
}
export function beats(a,b,led,mode,trumpSuit){
  const aTrump=mode==="trump"&&a.suit===trumpSuit,bTrump=mode==="trump"&&b.suit===trumpSuit;
  if(aTrump!==bTrump)return aTrump;
  if(a.suit!==b.suit){if(a.suit===led)return true;if(b.suit===led)return false;return false}
  return strength(a,mode,trumpSuit)>strength(b,mode,trumpSuit);
}
export function legalMoves(hand,trick,mode,trumpSuit,playerIndex=0,partnerIndex){
  const teammate=partnerIndex??(playerIndex+2)%4;
  if(!trick.length)return hand;
  const led=trick[0].card.suit; const follow=hand.filter(c=>c.suit===led);
  if(follow.length){
    if(mode!=="trump"||led!==trumpSuit)return follow;
    const win=winningPlay(trick,mode,trumpSuit); const higher=follow.filter(c=>beats(c,win.card,led,mode,trumpSuit));
    return higher.length&&win.player!==teammate?higher:follow;
  }
  if(mode!=="trump")return hand;
  const trumps=hand.filter(c=>c.suit===trumpSuit); if(!trumps.length)return hand;
  const win=winningPlay(trick,mode,trumpSuit); if(win?.player===teammate)return hand;
  const higher=trumps.filter(c=>beats(c,win.card,led,mode,trumpSuit));
  return higher.length?higher:trumps;
}
export function trickPoints(trick,mode,trumpSuit,isLast=false){return trick.reduce((n,p)=>n+cardPoints(p.card,mode,trumpSuit),0)+(isLast?10:0)}
const PROJECT_ORDER=["7","8","9","10","J","Q","K","A"];
export function detectProjects(hand,trumpSuit){
  const projects=[];
  for(const suit of SUITS){
    const ranks=hand.filter(c=>c.suit===suit).map(c=>c.rank);
    let run=[];
    for(const rank of PROJECT_ORDER){if(ranks.includes(rank))run.push(rank);else{if(run.length>=3)projects.push({type:"sequence",suit,ranks:run,label:`سرا ${run.length} ${suit}`,points:run.length>=5?100:run.length===4?50:20});run=[]}}
    if(run.length>=3)projects.push({type:"sequence",suit,ranks:run,label:`سرا ${run.length} ${suit}`,points:run.length>=5?100:run.length===4?50:20});
  }
  for(const rank of ["J","9","A","10","K","Q"]){const cards=hand.filter(c=>c.rank===rank);if(cards.length===4){const points=rank==="J"?200:rank==="9"?150:100;projects.push({type:"four",rank,label:`أربع ${rank}`,points})}}
  if(trumpSuit&&hand.some(c=>c.suit===trumpSuit&&c.rank==="K")&&hand.some(c=>c.suit===trumpSuit&&c.rank==="Q"))projects.push({type:"baloot",suit:trumpSuit,label:"بلوت",points:20});
  return projects;
}
export function analyzeMove({hand,trick,mode,trumpSuit,chosen,recommended,playerIndex=0,partnerIndex=2}){
  const legal=legalMoves(hand,trick,mode,trumpSuit,playerIndex,partnerIndex);
  const isLegal=legal.some(c=>c.id===chosen.id); const ideal=recommended??legal.reduce((a,b)=>strength(a,mode,trumpSuit)<strength(b,mode,trumpSuit)?a:b);
  if(!isLegal){
    const led=trick[0].card.suit,hasLed=hand.some(c=>c.suit===led);
    let reason=`الورقة ${chosen.id} غير نظامية في هذا الموقف.`;
    if(hasLed){
      const winner=winningPlay(trick,mode,trumpSuit);
      const mustOvertrump=mode==="trump"&&led===trumpSuit&&winner?.player!==partnerIndex&&hand.some(c=>c.suit===trumpSuit&&beats(c,winner.card,led,mode,trumpSuit));
      reason=mustOvertrump?`بدأ اللعب بحكم والخصم متقدم. معك حكم أعلى، لذلك لازم تعلّي بـ ${legal.map(c=>c.id).join(" أو ")}.`:`بدأ اللعب بـ ${led}، ومعك من هذا النوع؛ لازم تتبعه بورقة ${led}.`;
    }else if(mode==="trump"){
      const winner=winningPlay(trick,mode,trumpSuit),trumps=hand.filter(c=>c.suit===trumpSuit);
      if(trumps.length&&winner?.player!==partnerIndex){
        const higher=trumps.filter(c=>beats(c,winner.card,led,mode,trumpSuit));
        reason=higher.length?`ما معك ${led} والخصم متقدم بحكم. لازم تعلي بحكم أعلى: ${higher.map(c=>c.id).join(" أو ")}.`:`ما معك ${led} والخصم متقدم. لازم تقص بحكم: ${trumps.map(c=>c.id).join(" أو ")}.`;
      }
    }
    return{legal:false,score:0,label:"هذي الحركة تخالف اللعب",reason,best:ideal};
  }
  if(chosen.id===ideal.id)return{legal:true,score:10,label:"اختيار ممتاز ⭐⭐⭐",reason:"قرأت الورق صح واخترت أقوى قرار للموقف.",best:ideal};
  return{legal:true,score:6,label:"اختيار مقبول ⭐⭐",reason:`اختيارك قانوني، لكن ${ideal.id} يحافظ على قوة يدك أو يكسب الأكلة بشكل أفضل.`,best:ideal};
}
