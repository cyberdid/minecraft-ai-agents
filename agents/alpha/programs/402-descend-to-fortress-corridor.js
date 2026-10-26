// programs/402-descend-to-fortress-corridor.js
console.log('=== Program 402: Descend to Fortress Deck & Slay Wither Skeleton / Blaze ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Alert team of descent
bot.chat('team: Alpha descending from Workshop to Fortress deck at (45, 54, -127)! Equipping sword for Wither Skeleton & Blaze combat.');

// 2. Equip best sword in hand
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// 3. Move/descend towards fortress deck at (45, 54, -127)
console.log('Descending towards fortress deck at (45, 54, -127)...');
try {
  await lib.goTo(45, 54, -127, 2, { timeoutMs: 20000 });
  console.log('Arrived on fortress deck at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Direct goTo deck note:', e.message);
  try {
    await lib.goToXZ(45, -127, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('Alpha position:', lib.fmt(bot.entity.position));

// 4. Scan for hostiles on deck (wither_skeleton, blaze)
const hostiles = Object.values(bot.entities).filter(e => 
  e && (e.name === 'wither_skeleton' || e.name === 'blaze' || e.name === 'skeleton') &&
  e.position && bot.entity.position.distanceTo(e.position) < 20
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Fortress hostiles in combat range: ${hostiles.length}`);

// 5. Engage target from behind tactical 2-high ceiling if wither skeleton
for (const mob of hostiles) {
  if (isCancelled()) break;
  console.log(`Engaging ${mob.name} at ${lib.fmt(mob.position)} (dist: ${bot.entity.position.distanceTo(mob.position).toFixed(1)}m)...`);
  try {
    await bot.lookAt(mob.position.offset(0, mob.height ? mob.height * 0.5 : 0.8, 0), true);
    for (let hit = 0; hit < 5; hit++) {
      if (!bot.entities[mob.id]) break;
      await bot.attack(mob);
      await sleep(650);
    }
    await sleep(400);
    await lib.pickup(6);
  } catch (err) {
    console.log(`Fight note for ${mob.name}:`, err.message);
  }
}

// 6. Scan for Blaze Rods and Spawners
const rods = lib.count('blaze_rod');
console.log(`Blaze rods in inventory: ${rods}`);
if (rods > 0) {
  bot.chat(`team: BLAZE ROD ACQUIRED! Alpha inventory has ${rods} blaze_rod!`);
}

const spawners = bot.findBlocks({ matching: mcData.blocksByName.spawner?.id, maxDistance: 32, count: 5 });
for (const sp of spawners) {
  bot.chat(`team: BLAZE SPAWNER AT ${lib.fmt(sp)}!`);
}

bot.chat(`team: Fortress deck status: Alpha at ${lib.fmt(bot.entity.position)}, HP=${bot.health}/20, Blaze rods=${rods}.`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
