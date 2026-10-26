// programs/333-follow-delta-to-portal.js
console.log('=== Step: Follow Delta up the stairs to portal site ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = false;
m.allow1by1towers = true;
m.allowSprinting = true;
bot.pathfinder.setMovements(m);

// 1. Follow Delta
const delta = Object.values(bot.entities).find(e => e.type === 'player' && e.username.includes('delta'));
if (delta) {
  console.log(`Delta is at ${lib.fmt(delta.position)}. Following Delta...`);
  try {
    await lib.goTo(delta.position.x, delta.position.y, delta.position.z, 2, { dig: true, timeoutMs: 15000 });
    console.log('Reached Delta! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Follow Delta note:', e.message);
  }
}

// 2. Ascend to y=45
console.log('Ascending to y=45...');
try {
  await lib.goTo(303, 45, -40, 2, { dig: true, timeoutMs: 20000 });
  console.log('Reached y=45:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=45 note:', e.message);
}

// 3. Ascend to shaft top (302, 71, -44)
console.log('Ascending to surface shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 25000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Surface top note:', e.message);
}

// 4. Walk to portal site (298, 72, -53)
console.log('Walking to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { timeoutMs: 15000 });
  console.log('At portal site:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Portal approach note:', e.message);
}

// 5. Inspect portal state
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`Portal inspection: p1=${p1?.name}, p2=${p2?.name}`);

if (p1?.name === 'nether_portal' || p2?.name === 'nether_portal') {
  console.log('SUCCESS! Nether portal is LIT!');
  bot.chat('beta: MILESTONE 7 ACHIEVED! Nether portal is officially active and lit!');
}

console.log('Beta pos:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
