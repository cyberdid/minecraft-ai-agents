// programs/035-build-and-ignite-portal.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Obsidian in inv:', lib.count('obsidian'));
console.log('Flint & steel in inv:', lib.count('flint_and_steel'));

// 1. Ascend to surface shaft entrance (302, 71, -44)
console.log('Ascending stairs to shaft entrance...');
try {
  await lib.goTo(302, 62, -42, 2, { dig: true, timeoutMs: 20000 });
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 20000 });
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// 2. Walk to portal site (297, 72, -52)
console.log('Walking to portal site at (297, 72, -52)...');
await lib.goTo(297, 72, -52, 2, { timeoutMs: 20000 });
console.log('At portal site! Pos:', lib.fmt(bot.entity.position));

// 3. Build portal
console.log('Building portal frame at (298, 72, -54)...');
const frame = lib.shapes.portal(298, 72, -54, 'x');
const buildRes = await lib.build(frame);
console.log('Build result:', JSON.stringify(buildRes));

// 4. Ignite portal
console.log('Igniting portal...');
let lit = null;
try {
  lit = await lib.ignite(299, 72, -54);
  console.log('Ignite result at 299:', lit);
} catch (e) {
  console.log('Ignite at 299 error:', e.message);
  try {
    lit = await lib.ignite(300, 72, -54);
    console.log('Ignite result at 300:', lit);
  } catch (e2) {
    console.log('Ignite at 300 error:', e2.message);
  }
}

// 5. Verify nether_portal block exists
const portalBlocks = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 16, count: 5 });
console.log('Active nether_portal blocks:', portalBlocks.length);
if (portalBlocks.length > 0) {
  bot.chat('delta: MILESTONE 7 ACHIEVED! Nether portal is built and lit!');
} else {
  bot.chat(`delta: Frame built. Ignite status: ${lit}. Verifying.`);
}
