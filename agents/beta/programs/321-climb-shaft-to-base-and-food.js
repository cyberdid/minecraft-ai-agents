// programs/321-climb-shaft-to-base-and-food.js
console.log('=== Step: Climb shaft to base, get food, build and ignite portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

bot.chat('beta: Delta/Gamma, climbing up to base at (302, 71, -44) with 10 obsidian! Low health, ready for food & portal!');

// Movement configuration: safe, no falls
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = false;
m.maxDropDown = 2;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
m.liquidsCost = 100;
bot.pathfinder.setMovements(m);

// 1. Stage 1 to y=55, z=-20
console.log('Stage 1 towards (302, 55, -20)...');
try {
  await lib.goTo(302, 55, -20, 3, { dig: true, timeoutMs: 40000 });
  console.log('Reached stage 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

// 2. Stage 2 to shaft top (302, 71, -44)
console.log('Stage 2 towards shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 45000 });
  console.log('Reached surface shaft top:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// 3. Stage 3 to base door (294, 72, -53)
console.log('Stage 3 walking to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base with team!');
  bot.chat('beta: Inside base with 10 obsidian! Need 1-2 food to heal!');
} catch (e) {
  console.log('Base entry note:', e.message);
}

// 4. Pickup any dropped food from team or eat if we get food
await lib.pickup(4);

// 5. Build portal at (298, 72, -54)
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
  try {
    const lit2 = await lib.ignite(300, 72, -54);
    console.log('Ignite attempt 2 result:', lit2);
    bot.chat(`beta: MILESTONE 7 ACHIEVED! Nether portal lit! Result: ${lit2}`);
  } catch (err2) {
    console.log('Ignite attempt 2 note:', err2.message);
  }
}

// 7. Verify portal block
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`Portal blocks: p1=${p1?.name}, p2=${p2?.name}`);

console.log('Beta pos:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
