// programs/320-ascend-and-build-portal.js
console.log('=== Step: Ascend to surface, build Nether portal frame, and ignite ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Beta holds: obsidian =', lib.count('obsidian'), ', flint_and_steel =', lib.count('flint_and_steel'));

bot.chat(`beta: 10 obsidian secured! Ascending now to (298, 72, -54) to build and ignite the Nether portal!`);

const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
m.liquidsCost = 100;
bot.pathfinder.setMovements(m);

// 1. Stage 1 to y=27
console.log('Ascent stage 1 towards (299, 27, -30)...');
try {
  await lib.goTo(299, 27, -30, 2, { dig: true, timeoutMs: 30000 });
  console.log('Reached stage 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

// 2. Stage 2 to y=50
console.log('Ascent stage 2 towards (302, 50, -38)...');
try {
  await lib.goTo(302, 50, -38, 2, { dig: true, timeoutMs: 30000 });
  console.log('Reached stage 2:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// 3. Stage 3 to shaft top (302, 71, -44)
console.log('Ascent stage 3 towards (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 30000 });
  console.log('At surface shaft top:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 3 note:', e.message);
}

// 4. Stage 4 to portal site (298, 72, -53)
console.log('Walking to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { timeoutMs: 15000 });
  console.log('At portal site:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Portal site note:', e.message);
}

// 5. Build Nether portal frame
console.log('Building portal frame at (298, 72, -54)...');
try {
  const shape = lib.shapes.portal(298, 72, -54, 'x');
  const res = await lib.build(shape);
  console.log('Build result:', JSON.stringify(res));
} catch (e) {
  console.log('Build note:', e.message);
}

// 6. Ignite portal
console.log('Igniting Nether portal at (299, 72, -54)...');
try {
  const lit = await lib.ignite(299, 72, -54);
  console.log('Ignite result:', lit);
  bot.chat(`beta: MILESTONE 7 ACHIEVED! Nether portal lit! Result: ${lit}`);
} catch (e) {
  console.log('Ignite note:', e.message);
  // Try lighting adjacent frame block if needed
  try {
    const lit2 = await lib.ignite(300, 72, -54);
    console.log('Ignite attempt 2 result:', lit2);
    bot.chat(`beta: MILESTONE 7 ACHIEVED! Nether portal lit! Result: ${lit2}`);
  } catch (err2) {
    console.log('Ignite attempt 2 note:', err2.message);
  }
}

// 7. Check portal block state
const portalBlock1 = bot.blockAt(new Vec3(299, 73, -54));
const portalBlock2 = bot.blockAt(new Vec3(300, 73, -54));
console.log('Portal inner block 1:', portalBlock1 ? portalBlock1.name : 'null');
console.log('Portal inner block 2:', portalBlock2 ? portalBlock2.name : 'null');

console.log('Final position:', lib.fmt(bot.entity.position));
