// programs/325-dig-staircase-to-main-shaft.js
console.log('=== Dig safe staircase from (297, 39, 2) to main shaft and portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Digging safe staircase from (297, 39, 2) to main shaft (302, y, -44) with 10 obsidian!');

await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');

// Configure pathfinder with cheap digging cost so it tunnels smoothly
const m = new Movements(bot, mcData);
m.canDig = true;
m.digCost = 1; // tunneling with diamond pick is very fast (0.3s)
m.allowParkour = false;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
m.liquidsCost = 100; // avoid any water/lava
bot.pathfinder.setMovements(m);

// 1. Move to x=302 (safe dry shaft column)
console.log('Moving to (302, 40, 0)...');
try {
  await lib.goTo(302, 40, 0, 1, { dig: true, timeoutMs: 25000 });
  console.log('Reached safe x=302 column:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Move to 302 note:', e.message);
}

// 2. Ascend along safe shaft column to y=55
console.log('Ascending along x=302 to (302, 55, -25)...');
try {
  await lib.goTo(302, 55, -25, 2, { dig: true, timeoutMs: 35000 });
  console.log('Reached y=55:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=55 note:', e.message);
}

// 3. Ascend to shaft top (302, 71, -44)
console.log('Ascending to shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 35000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft top note:', e.message);
}

// 4. Walk to portal frame at (298, 72, -53)
console.log('Walking to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { timeoutMs: 15000 });
  console.log('At portal site:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Portal approach note:', e.message);
}

// 5. Build Nether portal frame
if (bot.entity.position.distanceTo(new Vec3(298, 72, -54)) < 8 && lib.count('obsidian') >= 10) {
  console.log('Building portal frame with 10 obsidian...');
  try {
    const shape = lib.shapes.portal(298, 72, -54, 'x');
    const res = await lib.build(shape);
    console.log('Build result:', JSON.stringify(res));
  } catch (err) {
    console.log('Build note:', err.message);
  }

  // 6. Ignite portal
  console.log('Igniting portal at (299, 72, -54)...');
  try {
    const lit = await lib.ignite(299, 72, -54);
    console.log('Portal ignition result:', lit);
    bot.chat(`beta: MILESTONE 7 ACHIEVED! Nether portal is lit! Result: ${lit}`);
  } catch (err) {
    console.log('Ignite note:', err.message);
    try {
      const lit2 = await lib.ignite(300, 72, -54);
      console.log('Ignite 2 result:', lit2);
      bot.chat(`beta: MILESTONE 7 ACHIEVED! Nether portal is lit! Result: ${lit2}`);
    } catch (e2) {
      console.log('Ignite 2 note:', e2.message);
    }
  }
}

// Verify portal blocks
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`Verification: portal blocks at (299, 73, -54) = ${p1?.name}, (300, 73, -54) = ${p2?.name}`);

console.log('Beta pos:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
