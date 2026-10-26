// programs/304-emergency-food-bread-or-fish.js
console.log('=== EMERGENCY FOOD: BREAD OR FISH ===');
console.log('Food:', bot.food, 'HP:', bot.health);

// 1. Scan for fish entities in water nearby
const fishList = Object.values(bot.entities).filter(e => {
  if (!e || !e.name || !e.position) return false;
  return ['salmon', 'cod', 'tropical_fish'].includes(e.name) && bot.entity.position.distanceTo(e.position) < 48;
});
console.log(`Fish entities found (${fishList.length}):`, fishList.map(f => `${f.name} at ${lib.fmt(f.position)}`));

// 2. Withdraw bones from chest and craft bone_meal
try {
  await lib.withdraw({ bone: 3 }, 293, 72, -57);
  console.log('Bones withdrawn. Count:', lib.count('bone'));
  await lib.craft('bone_meal', 9);
  console.log('Bone meal count:', lib.count('bone_meal'));
} catch (e) {
  console.log('Bone craft note:', e.message);
}

// 3. Scan for tall grass blocks to get wheat seeds
const grassBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'grass' || b.name === 'short_grass' || b.name === 'tall_grass'),
  maxDistance: 24,
  count: 20
});
console.log(`Grass blocks nearby (${grassBlocks.length}):`, grassBlocks.map(p => lib.fmt(p)));

// 4. Break grass blocks until we have at least 3 wheat_seeds
for (const gp of grassBlocks) {
  if (lib.count('wheat_seeds') >= 3 || isCancelled()) break;
  const b = bot.blockAt(gp);
  if (b) {
    try {
      await bot.lookAt(gp.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
      await sleep(150);
      await lib.pickup(3);
    } catch (e) {}
  }
}
console.log('Wheat seeds in inv:', lib.count('wheat_seeds'));

// 5. If we have seeds & bone_meal, craft stone_hoe and farm wheat
if (lib.count('wheat_seeds') >= 3 && lib.count('bone_meal') >= 6) {
  if (lib.count('stone_hoe') === 0 && lib.count('cobblestone') >= 2) {
    console.log('Crafting stone_hoe...');
    await lib.craft('stone_hoe', 1);
  }

  // Find water block to farm next to
  const water = bot.findBlocks({
    matching: b => b && b.name === 'water',
    maxDistance: 16,
    count: 1
  })[0];
  console.log('Water block at:', water ? lib.fmt(water) : 'none');

  if (water) {
    // Pick 3 adjacent dirt/grass blocks next to water
    const hoe = bot.inventory.items().find(i => i.name.endsWith('_hoe'));
    if (hoe) await bot.equip(hoe, 'hand');

    const seedsItem = bot.inventory.items().find(i => i.name === 'wheat_seeds');
    const boneMealItem = bot.inventory.items().find(i => i.name === 'bone_meal');

    let grownWheat = 0;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (grownWheat >= 3 || isCancelled()) break;
      const farmPos = water.offset(dx, 0, dz);
      const b = bot.blockAt(farmPos);
      if (b && (b.name === 'dirt' || b.name === 'grass_block')) {
        try {
          await lib.goTo(farmPos.x, farmPos.y + 1, farmPos.z, 2, { timeoutMs: 5000 });
          // Till
          await bot.activateBlock(b);
          await sleep(200);

          // Plant seed
          if (seedsItem) {
            await bot.equip(seedsItem, 'hand');
            const farmland = bot.blockAt(farmPos);
            await bot.activateBlock(farmland);
            await sleep(200);
          }

          // Apply bone meal until mature (metadata = 7)
          const cropPos = farmPos.offset(0, 1, 0);
          for (let m = 0; m < 5; m++) {
            const crop = bot.blockAt(cropPos);
            if (!crop || crop.name !== 'wheat' || crop._properties?.age === '7' || crop.metadata === 7) break;
            const bm = bot.inventory.items().find(i => i.name === 'bone_meal');
            if (!bm) break;
            await bot.equip(bm, 'hand');
            await bot.activateBlock(crop);
            await sleep(200);
          }

          // Harvest mature wheat
          const matureCrop = bot.blockAt(cropPos);
          if (matureCrop && matureCrop.name === 'wheat') {
            await bot.dig(matureCrop);
            await sleep(200);
            await lib.pickup(4);
            grownWheat++;
          }
        } catch (e) {
          console.log('Farming step note:', e.message);
        }
      }
    }

    console.log('Harvested wheat. Count in inv:', lib.count('wheat'));
    if (lib.count('wheat') >= 3) {
      console.log('Crafting bread...');
      await lib.craft('bread', 1);
      await lib.eat();
      console.log('Ate bread! Food level now:', bot.food);
    }
  }
}

// 6. If fish found, hunt fish
if (bot.food < 10 && fishList.length > 0) {
  const f = fishList[0];
  console.log(`Hunting fish ${f.name} at ${lib.fmt(f.position)}...`);
  try {
    await lib.equipWeapon();
    await lib.goTo(f.position.x, f.position.y, f.position.z, 2, { timeoutMs: 8000 });
    bot.attack(f);
    await sleep(400);
    await lib.pickup(6);
    // Smelt raw fish in furnace
    for (const rf of ['cod', 'salmon']) {
      if (lib.count(rf) > 0) {
        await lib.goTo(295, 72, -55, 2);
        await lib.smelt(rf, 'oak_planks', lib.count(rf));
        await lib.eat();
      }
    }
  } catch (e) {
    console.log('Fish hunt note:', e.message);
  }
}

console.log('Inv at end:', JSON.stringify(lib.inv()));
console.log('Food:', bot.food, 'HP:', bot.health);
bot.chat(`gamma report: Food=${bot.food}/20, HP=${bot.health}/20, Inv: ${JSON.stringify(lib.inv())}`);
