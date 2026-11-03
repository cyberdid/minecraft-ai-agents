// programs/379-mine-stone-and-night-sleep.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay, 'HP:', bot.health, 'food:', bot.food);

// 1. Mine 6 stone/cobblestone nearby
const stoneIds = [mcData.blocksByName.stone?.id, mcData.blocksByName.cobblestone?.id].filter(Boolean);
const stoneBlocks = bot.findBlocks({
  matching: stoneIds,
  maxDistance: 12,
  count: 10
});

console.log(`Found ${stoneBlocks.length} stone blocks nearby.`);
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 6) break;
  // Ensure we don't dig base floor/walls (base is around x=292..296, z=-58..-54, y=72)
  if (p.x >= 291 && p.x <= 297 && p.z >= -59 && p.z <= -53 && p.y >= 71) {
    continue; // Don't break base!
  }
  const b = bot.blockAt(p);
  if (b && bot.canDigBlock(b)) {
    try {
      console.log(`Digging ${b.name} at ${lib.fmt(p)}...`);
      await bot.dig(b);
      await lib.pickup(4);
    } catch (e) {
      console.log(`Dig note: ${e.message}`);
    }
  }
}

// 2. Return inside base shelter
console.log('Moving inside base shelter at (293, 72, -56)...');
try {
  await lib.goTo(293, 72, -56, 1);
} catch (e) {
  console.log('Move to base note:', e.message);
}

// 3. Craft stone_sword at crafting table
if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
    const s = bot.inventory.items().find(i => i.name === 'stone_sword');
    if (s) await bot.equip(s, 'hand');
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}

// 4. Locate beds
const bedIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_bed')).map(k => mcData.blocksByName[k].id);
const beds = bot.findBlocks({
  matching: bedIds,
  maxDistance: 10,
  count: 5
});
console.log(`Found ${beds.length} beds inside base:`);
for (const bPos of beds) {
  const b = bot.blockAt(bPos);
  console.log(`  ${b.name} at ${lib.fmt(bPos)}`);
}

// 5. Await night and sleep
console.log('Current timeOfDay:', bot.time.timeOfDay);
while (!isCancelled() && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460)) {
  const timeToNight = 12542 - bot.time.timeOfDay;
  if (timeToNight <= 0) break;
  if (timeToNight % 100 === 0) console.log(`Waiting for night: ${timeToNight} ticks (${(timeToNight/20).toFixed(1)}s)...`);
  await sleep(1000);
}

console.log('Night reached! Time:', bot.time.timeOfDay, 'attempting sleep...');
for (const bPos of beds) {
  const bedBlock = bot.blockAt(bPos);
  if (!bedBlock) continue;
  try {
    await lib.sleep(bedBlock);
    console.log(`Slept in bed at ${lib.fmt(bPos)}!`);
    break;
  } catch (e) {
    console.log(`Sleep in bed at ${lib.fmt(bPos)} failed: ${e.message}`);
  }
}

console.log('Final state: pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay);
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
