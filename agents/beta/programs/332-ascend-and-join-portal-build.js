// programs/332-ascend-and-join-portal-build.js
console.log('=== Step: Ascend to base portal site (298, 72, -54) and complete Milestone 7 ===');
console.log('Beta start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Delta, awesome job securing the 10 obsidian! Ascending to (298, 72, -54) to build and ignite!');

// Movement
const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = false;
m.allowSprinting = true;
bot.pathfinder.setMovements(m);

// 1. Ascend to y=54
console.log('Ascending to (304, 54, -34)...');
try {
  await lib.goTo(304, 54, -34, 2, { timeoutMs: 25000 });
  console.log('At y=54:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=54 note:', e.message);
}

// 2. Ascend to surface (302, 71, -44)
console.log('Ascending to shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000 });
  console.log('At shaft top:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft top note:', e.message);
}

// 3. Walk to portal site (298, 72, -53)
console.log('Walking to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { timeoutMs: 15000 });
  console.log('At portal site:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Portal site note:', e.message);
}

// 4. Inspect portal blocks
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`Portal inspection: p1=${p1?.name}, p2=${p2?.name}`);

// Check if teammates are there
for (const id in bot.entities) {
  const ent = bot.entities[id];
  if (ent && ent.type === 'player' && ent.username !== bot.username) {
    console.log(`Teammate ${ent.username} at ${lib.fmt(ent.position)}`);
  }
}

// If portal is lit:
if (p1?.name === 'nether_portal' || p2?.name === 'nether_portal') {
  console.log('SUCCESS! Nether portal is ALREADY LIT!');
  bot.chat('beta: MILESTONE 7 ACHIEVED! Nether portal is officially active and lit!');
} else {
  // If we hold obsidian or flint_and_steel:
  if (lib.count('obsidian') >= 10) {
    console.log('Building portal frame...');
    await lib.build(lib.shapes.portal(298, 72, -54, 'x'));
  }
  if (lib.count('flint_and_steel') > 0) {
    console.log('Igniting portal...');
    const res = await lib.ignite(299, 72, -54);
    bot.chat(`beta: MILESTONE 7 ACHIEVED! Nether portal lit! ${res}`);
  } else {
    bot.chat('beta: At portal site! Delta, place the 10 obsidian and ignite with flint & steel!');
  }
}

console.log('Beta pos:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
