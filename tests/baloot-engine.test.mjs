import test from"node:test";import assert from"node:assert/strict";
import{card,strength,legalMoves,winningPlay,trickPoints}from"../lib/baloot-engine.mjs";
test("ترتيب الصن: الأكة ثم العشرة",()=>assert.ok(strength(card("A","♠"),"sun")>strength(card("10","♠"),"sun")));
test("ترتيب الحكم: الولد ثم التسعة ثم الأكة",()=>{assert.ok(strength(card("J","♥"),"trump","♥")>strength(card("9","♥"),"trump","♥"));assert.ok(strength(card("9","♥"),"trump","♥")>strength(card("A","♥"),"trump","♥"))});
test("يجب اتباع النوع",()=>{const hand=[card("A","♠"),card("J","♥")],trick=[{player:1,card:card("7","♠")}];assert.deepEqual(legalMoves(hand,trick,"trump","♥").map(c=>c.id),["A♠"])});
test("يجب القص عند انعدام النوع والخصم فائز",()=>{const hand=[card("7","♥"),card("A","♦")],trick=[{player:1,card:card("10","♠")}];assert.deepEqual(legalMoves(hand,trick,"trump","♥").map(c=>c.id),["7♥"])});
test("الحكم يفوز على النوع المطلوب",()=>{const trick=[{player:0,card:card("A","♠")},{player:1,card:card("7","♥")}];assert.equal(winningPlay(trick,"trump","♥").player,1)});
test("نقاط ولد وتسعة الحكم",()=>{const trick=[{player:0,card:card("J","♥")},{player:1,card:card("9","♥")}];assert.equal(trickPoints(trick,"trump","♥"),34)});
