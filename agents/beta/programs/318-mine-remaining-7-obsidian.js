// programs/318-mine-remaining-7-obsidian.js
console.log('=== Step: Mine remaining 7 obsidian to reach 10 ===');
console.log('Current obsidian in inv:', lib.count('obsidian'));
console.log('Beta pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');

// Find all obsidian blocks
let obs = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 16,
  count: 30
}).map(p => bot.blockAt(p)).filter(Boolean);

console.log(`Found ${obs.length} obsidian blocks within 16m.`);

// 1. Mine all reachable obsidian from current spot without moving
for (const b of obs) {
  if (lib.count('obsidian') >= 10 || isCancelled()) break;
  const dist = bot.entity.position.distanceTo(b.position);
  if (dist <= 4.2) {
    console.log(`Mining reachable obsidian at ${lib.fmt(b.position)} (dist ${dist.toFixed(1)}m)...`);
    try {
      await bot.lookAt(b.position.offset(0.5, 0.5, 0.5), true);
      await bot.dig(b);
      await sleep(200);
      await lib.pickup(4);
      console.log(`Obsidian count now: ${lib.count('obsidian')}/10`);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(b.position)}:`, e.message);
    }
  }
}

// 2. If still < 10, carefully navigate to adjacent obsidian blocks
const m = new Movements(bot, mcData);
m.canDig = false; // don't dig walls or ceiling
m.liquidsCost = 100; // never step into lava or water
bot.pathfinder.setMovements(m);

while (lib.count('obsidian') < 10 && !isCancelled()) {
  const remaining = bot.findBlocks({
    matching: b => b.name === 'obsidian',
    maxDistance: 16,
    count: 20
  }).map(p => bot.blockAt(p)).filter(Boolean)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (remaining.length === 0) {
    console.log('No more obsidian found nearby!');
    break;
  }

  const target = remaining[0];
  console.log(`Approaching obsidian at ${lib.fmt(target.position)}...`);
  try {
    await lib.goTo(target.position.x, target.position.y + 1, target.position.z, 2, { timeoutMs: 10000 });
  } catch (err) {
    console.log('Nav note:', err.message);
  }

  const dist = bot.entity.position.distanceTo(target.position);
  if (dist <= 4.5) {
    console.log(`Mining obsidian at ${lib.fmt(target.position)}...`);
    try {
      await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');
      await bot.lookAt(target.position.offset(0.5, 0.5, 0.5), true);
      await bot.dig(target);
      await sleep(200);
      await lib.pickup(4);
      console.log(`Obsidian count: ${lib.count('obsidian')}/10`);
    } catch (e) {
      console.log('Dig error:', e.message);
      break;
    }
  } else {
    console.log('Could not reach target safely.');
    break;
  }
}

console.log(`FINAL OBSIDIAN COUNT: ${lib.count('obsidian')}/10`);
bot.chat(`beta: Obsidian status: ${lib.count('obsidian')}/10 in inventory!`);
