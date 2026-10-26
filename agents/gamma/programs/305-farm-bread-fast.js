// programs/305-farm-bread-fast.js
console.log('=== FAST WHEAT FARMING FOR BREAD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// 1. Check if Delta or Alpha are here and holding food
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    const held = p.entity.heldItem?.name || 'none';
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${held}`);
  }
}

// 2. Step outside base door
console.log('Stepping outside door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -51.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}
console.log('Outside at:', lib.fmt(bot.entity.position));

// 3. Find grass blocks nearby and break them to get seeds
const grassBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'grass' || b.name === 'short_grass' || b.name === 'tall_grass'),
  maxDistance: 16,
  count: 25
});
console.log(`Found ${grassBlocks.length} grass blocks outside.`);

for (const gp of grassBlocks) {
  if (lib.count('wheat_seeds') >= 3 || isCancelled()) break;
  try {
    const d = bot.entity.position.distanceTo(gp);
    if (d > 3.5) await lib.goTo(gp.x, gp.y, gp.z, 2, { timeoutMs: 4000 });
    const b = bot.blockAt(gp);
    if (b && (b.name === 'grass' || b.name === 'short_grass' || b.name === 'tall_grass')) {
      await bot.lookAt(gp.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
      await sleep(100);
      await lib.pickup(3);
    }
  } catch (e) {}
}

console.log('Seeds in inventory:', lib.count('wheat_seeds'));

// 4. Return inside base to craft stone_hoe if we got seeds
if (lib.count('wheat_seeds') >= 2) {
  console.log('Crafting stone_hoe...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 5000 });
    await lib.goThroughDoor(294, 72, -54);
    await lib.craft('stone_hoe', 1);
  } catch (e) {
    console.log('Hoe craft note:', e.message);
  }

  // 5. Find water source outside
  const water = bot.findBlocks({
    matching: b => b && b.name === 'water',
    maxDistance: 20,
    count: 5
  })[0];
  console.log('Water at:', water ? lib.fmt(water) : 'none');

  if (water) {
    try {
      await lib.goTo(water.x, water.y + 1, water.z, 2, { timeoutMs: 8000 });
      const hoe = bot.inventory.items().find(i => i.name.endsWith('_hoe'));
      if (hoe) await bot.equip(hoe, 'hand');

      // Till dirt adjacent to water
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (lib.count('wheat') >= 3 || isCancelled()) break;
        const fp = water.offset(dx, 0, dz);
        const b = bot.blockAt(fp);
        if (b && (b.name === 'dirt' || b.name === 'grass_block')) {
          // Till
          if (hoe) await bot.equip(hoe, 'hand');
          await bot.activateBlock(b);
          await sleep(200);

          // Plant seed
          const seed = bot.inventory.items().find(i => i.name === 'wheat_seeds');
          if (seed) {
            await bot.equip(seed, 'hand');
            const farmland = bot.blockAt(fp);
            await bot.activateBlock(farmland);
            await sleep(200);
          }

          // Bone meal crop
          const cropPos = fp.offset(0, 1, 0);
          for (let m = 0; m < 4; m++) {
            const bm = bot.inventory.items().find(i => i.name === 'bone_meal');
            if (!bm) break;
            const crop = bot.blockAt(cropPos);
            if (!crop || crop.name !== 'wheat' || crop._properties?.age === '7') break;
            await bot.equip(bm, 'hand');
            await bot.activateBlock(crop);
            await sleep(200);
          }

          // Harvest
          const mature = bot.blockAt(cropPos);
          if (mature && mature.name === 'wheat') {
            await bot.dig(mature);
            await sleep(200);
            await lib.pickup(3);
          }
        }
      }

      console.log('Wheat in inv:', lib.count('wheat'));
      if (lib.count('wheat') >= 3) {
        // Return to crafting table inside base
        await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
        await lib.goThroughDoor(294, 72, -54);
        await lib.craft('bread', 1);
        await lib.eat();
        console.log('Ate bread! Food level now:', bot.food);
      }
    } catch (err) {
      console.log('Farming error:', err.message);
    }
  }
}

console.log('=== END STATUS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma status: Food=${bot.food}/20, HP=${bot.health}/20, Seeds=${lib.count('wheat_seeds')}, Wheat=${lib.count('wheat')}`);
