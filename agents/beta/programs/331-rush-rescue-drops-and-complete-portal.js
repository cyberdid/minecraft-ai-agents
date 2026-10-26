// programs/331-rush-rescue-drops-and-complete-portal.js
console.log('=== Step: Sprint to (301, 17, -30) to recover drops and complete portal ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

bot.chat('beta: Sifting down shaft to (301, 17, -30) to recover 10 obsidian & diamond pick!');

// Configure fast movements
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = false;
m.allow1by1towers = true;
m.allowSprinting = true;
bot.pathfinder.setMovements(m);

// 1. Exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk to shaft entrance (302, 71, -44)
console.log('To shaft entrance...');
await lib.goTo(302, 71, -44, 2, { timeoutMs: 12000 });

// 3. Descend to y=45
console.log('Descending to y=45...');
try {
  await lib.goTo(304, 45, -34, 2, { timeoutMs: 18000 });
} catch (e) {
  console.log('Descent y=45 note:', e.message);
}

// 4. Descend to drops at (301, 17, -30)
console.log('Rushing to drop site (301, 17, -30)...');
try {
  await lib.goTo(301, 17, -30, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('Drops approach note:', e.message);
}

// 5. Sweep all items
console.log('Sweeping items in 16m radius...');
await lib.pickup(16);
await sleep(500);
await lib.pickup(16);

console.log('Retrieved obsidian:', lib.count('obsidian'));
console.log('Retrieved diamond_pickaxe:', lib.count('diamond_pickaxe'));
console.log('Retrieved flint_and_steel:', lib.count('flint_and_steel'));

// Equip sword if hostile nearby
const hostiles = lib.hostiles(10);
if (hostiles.length > 0 && lib.count('stone_sword') > 0) {
  console.log(`Defending against ${hostiles.length} hostiles...`);
  await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
  for (const h of hostiles) {
    const ent = Object.values(bot.entities).find(e => e.id === h.id);
    if (ent && ent.isValid) {
      await bot.lookAt(ent.position.offset(0, 1, 0));
      await bot.attack(ent);
      await sleep(500);
    }
  }
}

// 6. Sprint back to surface
if (lib.count('obsidian') >= 10) {
  bot.chat('beta: ALL 10 OBSIDIAN SECURED! Sprinting to surface to build and ignite portal!');

  console.log('Ascending to y=54...');
  try {
    await lib.goTo(304, 54, -34, 2, { timeoutMs: 25000 });
  } catch (e) {
    console.log('Ascent y=54 note:', e.message);
  }

  console.log('Ascending to surface shaft top (302, 71, -44)...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000 });
  } catch (e) {
    console.log('Surface top note:', e.message);
  }

  console.log('Walking to portal site (298, 72, -53)...');
  try {
    await lib.goTo(298, 72, -53, 1, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Portal approach note:', e.message);
  }

  // 7. Build portal
  console.log('Building Nether portal frame at (298, 72, -54)...');
  try {
    const shape = lib.shapes.portal(298, 72, -54, 'x');
    const bRes = await lib.build(shape);
    console.log('Build result:', JSON.stringify(bRes));
  } catch (err) {
    console.log('Build note:', err.message);
  }

  // 8. Ignite portal
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

  // Verify
  const p1 = bot.blockAt(new Vec3(299, 73, -54));
  const p2 = bot.blockAt(new Vec3(300, 73, -54));
  console.log(`VERIFICATION: Portal inner blocks: p1=${p1?.name}, p2=${p2?.name}`);
}

console.log('Beta final position:', lib.fmt(bot.entity.position));
console.log('Beta final inventory:', JSON.stringify(lib.inv()));
