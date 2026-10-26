// programs/316-kill-zombie-and-reach-lava-lake.js
console.log('=== Step: Clear hostiles and reach lava lake at (286, 18, 8) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Defend against nearby hostiles
const hostiles = lib.hostiles(12);
if (hostiles.length > 0) {
  console.log(`Found ${hostiles.length} hostiles nearby, engaging with sword...`);
  await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
  for (const h of hostiles) {
    const ent = Object.values(bot.entities).find(e => e.id === h.id);
    if (ent && ent.isValid) {
      console.log(`Attacking ${h.name} at dist ${Math.round(h.dist)}...`);
      // Move closer and strike
      try {
        await bot.lookAt(ent.position.offset(0, 1, 0));
        await bot.attack(ent);
        await sleep(600);
        if (ent.isValid) {
          await bot.attack(ent);
          await sleep(600);
        }
      } catch (err) {
        console.log('Attack note:', err.message);
      }
    }
  }
}

// 2. Setup safe movements towards lava lake
const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
// Lava safety: never step into lava or water
m.liquidsCost = 50;
bot.pathfinder.setMovements(m);

// Announce to Alpha
bot.chat('beta: Secured diamond pickaxe and water bucket! Navigating to lava lake at (286, 18, 8) to get 10 obsidian.');

// Stage 1: Walk to (305, 19, -20)
console.log('Stage 1 towards (305, 19, -20)...');
try {
  await lib.goTo(305, 19, -20, 3, { dig: true, timeoutMs: 25000 });
  console.log('Reached stage 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

// Stage 2: Walk to safe solid ledge near lava lake (288, 19, 8)
console.log('Stage 2 towards safe ledge (288, 19, 8)...');
try {
  await lib.goTo(288, 19, 8, 3, { dig: true, timeoutMs: 25000 });
  console.log('Reached lava lake area:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// Scan for obsidian and lava
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 32, count: 50 });
const lava = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 32, count: 50 });
console.log(`Survey: ${obs.length} obsidian blocks, ${lava.length} lava blocks nearby.`);

console.log('Beta current status: pos =', lib.fmt(bot.entity.position), 'health =', bot.health, 'food =', bot.food);
