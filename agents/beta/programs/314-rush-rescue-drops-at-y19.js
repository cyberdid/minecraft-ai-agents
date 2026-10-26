// programs/314-rush-rescue-drops-at-y19.js
console.log('=== Step: Rush rescue diamond pickaxe drops at (327, 19, -32) ===');

// Configure movements
const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
bot.pathfinder.setMovements(m);

// 1. Exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Head to shaft entrance (302, 71, -44)
console.log('Walking to shaft entrance...');
await lib.goTo(302, 71, -44, 2, { timeoutMs: 15000 });

// 3. Descend shaft stage 1: to y=45
console.log('Descending to y=45...');
try {
  await lib.goTo(304, 45, -36, 2, { dig: true, timeoutMs: 20000 });
  console.log('At y=45:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Descent y=45 note:', e.message);
}

// 4. Descend shaft stage 2: to y=20
console.log('Descending to y=20...');
try {
  await lib.goTo(315, 20, -32, 3, { dig: true, timeoutMs: 25000 });
  console.log('At y=20:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Descent y=20 note:', e.message);
}

// 5. Approach drops at (327, 19, -32)
console.log('Approaching drop site (327, 19, -32)...');
try {
  await lib.goTo(327, 19, -32, 2, { dig: true, timeoutMs: 25000 });
  console.log('At drop site! Picking up items...');
} catch (e) {
  console.log('Drop approach note:', e.message);
}

// 6. Equip sword and defend if hostiles
const hostiles = lib.hostiles(8);
if (hostiles.length > 0) {
  console.log(`Defending against ${hostiles.length} hostiles!`);
  await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
  for (const h of hostiles) {
    const target = bot.entities[h.id] || Object.values(bot.entities).find(e => e.id === h.id);
    if (target) {
      await bot.attack(target);
      await sleep(500);
    }
  }
}

// 7. Sweep items in 16m radius
await lib.pickup(16);

console.log('Beta inventory after rescue:', JSON.stringify(lib.inv()));
if (lib.count('diamond_pickaxe') > 0) {
  console.log('SUCCESS! Beta secured the Diamond Pickaxe!');
  bot.chat('beta: SECURED THE DIAMOND PICKAXE! Drops retrieved successfully!');
} else {
  bot.chat(`beta: At drops area (327, 19, -32). Diamond pick: ${lib.count('diamond_pickaxe')}, Water bucket: ${lib.count('water_bucket')}`);
}
