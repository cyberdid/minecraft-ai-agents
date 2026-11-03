// programs/354-instant-food-emergency.js
console.log('=== EMERGENCY FOOD RESCUE ===');
console.log('HP:', bot.health, 'Food:', bot.food, 'Pos:', lib.fmt(bot.entity.position));

// 1. Check for any killable animal within 40 blocks
const killable = ['cow', 'pig', 'sheep', 'chicken', 'rabbit', 'horse', 'donkey', 'llama'];
const nearby = Object.values(bot.entities)
  .filter(e => e && killable.includes(e.name) && e.position.distanceTo(bot.entity.position) < 40)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Nearby animals: ${nearby.length}`);
if (nearby.length > 0) {
  const target = nearby[0];
  console.log(`Approaching ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
    await lib.equipWeapon();
    const dline = Date.now() + 5000;
    while (target.isValid && Date.now() < dline) {
      bot.attack(target);
      await sleep(550);
    }
    await lib.pickup(6);
    // If we got raw meat, eat it raw if starving, or cook it if furnace handy
    for (const raw of ['beef', 'mutton', 'porkchop', 'chicken']) {
      if (lib.count(raw) > 0) {
        console.log(`Got ${raw}! Eating immediately to stop starvation!`);
        await lib.eat();
      }
    }
  } catch (e) {
    console.log('Animal attack error:', e.message);
  }
}

// 2. If food still < 6, execute emergency wheat bread farming with bone meal
if (bot.food < 6) {
  console.log('Executing emergency wheat farming...');
  // Find grass to break for seeds
  const grassBlocks = bot.findBlocks({
    matching: b => b && (b.name === 'grass' || b.name === 'short_grass' || b.name === 'tall_grass' || b.name === 'fern'),
    maxDistance: 16,
    count: 20
  });
  console.log(`Found ${grassBlocks.length} grass/fern blocks`);
  for (const gp of grassBlocks) {
    if (lib.count('wheat_seeds') >= 3 || isCancelled()) break;
    try {
      const b = bot.blockAt(gp);
      if (b) {
        await bot.pathfinder.goto(new goals.GoalNear(gp.x, gp.y, gp.z, 2));
        await bot.dig(b);
        await sleep(100);
        await lib.pickup(4);
      }
    } catch (e) {}
  }
  console.log(`Seeds collected: ${lib.count('wheat_seeds')}, Bone meal: ${lib.count('bone_meal')}`);

  // If we have seeds and bone meal, grow wheat
  while (lib.count('wheat_seeds') > 0 && lib.count('bone_meal') > 0 && lib.count('wheat') < 3 && !isCancelled()) {
    // Find a dirt/grass_block near feet
    const groundPos = bot.findBlocks({
      matching: b => b && (b.name === 'dirt' || b.name === 'grass_block'),
      maxDistance: 3,
      count: 1
    })[0];
    if (!groundPos) break;
    const gb = bot.blockAt(groundPos);
    const airAbove = bot.blockAt(groundPos.offset(0, 1, 0));
    if (!airAbove || airAbove.name !== 'air') continue;

    // Till with hoe
    await bot.equip(mcData.itemsByName.stone_hoe.id, 'hand');
    await bot.activateBlock(gb);
    await sleep(300);

    const farmland = bot.blockAt(groundPos);
    if (!farmland || farmland.name !== 'farmland') continue;

    // Plant seed
    await bot.equip(mcData.itemsByName.wheat_seeds.id, 'hand');
    await bot.activateBlock(farmland);
    await sleep(300);

    // Apply bone meal until mature
    const cropPos = groundPos.offset(0, 1, 0);
    for (let bm = 0; bm < 3 && lib.count('bone_meal') > 0; bm++) {
      const crop = bot.blockAt(cropPos);
      if (crop && crop.name === 'wheat' && crop.metadata === 7) break;
      await bot.equip(mcData.itemsByName.bone_meal.id, 'hand');
      await bot.activateBlock(crop);
      await sleep(400);
    }

    // Harvest mature crop
    const finalCrop = bot.blockAt(cropPos);
    if (finalCrop && finalCrop.name === 'wheat') {
      await bot.dig(finalCrop);
      await sleep(200);
      await lib.pickup(4);
    }
  }

  console.log(`Wheat in inv: ${lib.count('wheat')}`);
  if (lib.count('wheat') >= 3) {
    try {
      await lib.craft('bread', 1);
      console.log('Crafted bread! Eating now...');
      await lib.eat();
    } catch (e) {
      console.log('Bread craft/eat error:', e.message);
    }
  }
}

console.log('Ending status:', JSON.stringify(lib.status()));
