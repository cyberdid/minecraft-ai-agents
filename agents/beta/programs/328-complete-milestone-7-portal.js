// programs/328-complete-milestone-7-portal.js
console.log('=== Step: Follow verified route to surface, build & light Nether portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Obsidian in inv:', lib.count('obsidian'), ', flint_and_steel:', lib.count('flint_and_steel'));

bot.chat('beta: Ascending via verified route: (290, 19, 7) -> (298, 24, -30) -> (304, 54, -34) -> base portal!');

// Movement configuration
const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
m.liquidsCost = 100;
bot.pathfinder.setMovements(m);

// Leg 1: (290, 19, 7)
console.log('Leg 1: Walking to (290, 19, 7)...');
try {
  await lib.goTo(290, 19, 7, 2, { timeoutMs: 30000 });
  console.log('Reached Leg 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leg 1 note:', e.message);
}

// Leg 2: (298, 24, -30)
console.log('Leg 2: Walking to (298, 24, -30)...');
try {
  await lib.goTo(298, 24, -30, 2, { timeoutMs: 45000 });
  console.log('Reached Leg 2:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leg 2 note:', e.message);
}

// Leg 3: (304, 54, -34)
console.log('Leg 3: Walking to (304, 54, -34)...');
try {
  await lib.goTo(304, 54, -34, 2, { timeoutMs: 45000 });
  console.log('Reached Leg 3:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leg 3 note:', e.message);
}

// Leg 4: (302, 71, -44)
console.log('Leg 4: Ascending to surface (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 45000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leg 4 note:', e.message);
}

// Leg 5: Portal site (298, 72, -53)
console.log('Leg 5: Walking to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { timeoutMs: 20000 });
  console.log('At portal site:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leg 5 note:', e.message);
}

// Build and Ignite Portal
if (lib.count('obsidian') >= 10 && bot.entity.position.distanceTo(new Vec3(298, 72, -54)) < 8) {
  console.log('Building portal frame at (298, 72, -54)...');
  try {
    const shape = lib.shapes.portal(298, 72, -54, 'x');
    const bRes = await lib.build(shape);
    console.log('Build result:', JSON.stringify(bRes));
  } catch (err) {
    console.log('Build note:', err.message);
  }

  console.log('Igniting Nether portal at (299, 72, -54)...');
  try {
    const lit = await lib.ignite(299, 72, -54);
    console.log('IGNITE RESULT:', lit);
    bot.chat(`beta: MILESTONE 7 ACHIEVED! NETHER PORTAL LIT! ${lit}`);
  } catch (err) {
    console.log('Ignite note:', err.message);
    try {
      const lit2 = await lib.ignite(300, 72, -54);
      console.log('IGNITE 2 RESULT:', lit2);
      bot.chat(`beta: MILESTONE 7 ACHIEVED! NETHER PORTAL LIT! ${lit2}`);
    } catch (e2) {
      console.log('Ignite 2 note:', e2.message);
    }
  }
}

// Verify portal blocks
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`VERIFICATION: Inner blocks: p1=${p1?.name}, p2=${p2?.name}`);

console.log('Beta pos:', lib.fmt(bot.entity.position));
console.log('Beta inventory:', JSON.stringify(lib.inv()));
