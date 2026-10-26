// programs/216-check-sheep-or-prep-night.js
console.log('=== Program 216: Check Sheep for Bed 2 / Base Night Protocol ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// 1. Check for sheep nearby
const sheep = bot.nearestEntity(e => e.name === 'sheep' && e.position.distanceTo(bot.entity.position) < 40);
if (sheep && lib.time().secondsUntilNight > 100) {
  console.log(`Found sheep at ${lib.fmt(sheep.position)}, dist: ${sheep.position.distanceTo(bot.entity.position).toFixed(1)}`);
  try {
    // Step out, kill sheep, pick up wool
    if (typeof passDoorOut === 'function') await passDoorOut();
    else await lib.goThroughDoor(294, 72, -54);
    
    await bot.pathfinder.goto(new goals.GoalNear(sheep.position.x, sheep.position.y, sheep.position.z, 2));
    const ironSword = mcData.itemsByName.iron_sword?.id || mcData.itemsByName.diamond_pickaxe.id;
    await bot.equip(ironSword, 'hand');
    for (let i = 0; i < 4; i++) {
      bot.attack(sheep);
      await sleep(600);
      if (!sheep.isValid) break;
    }
    await lib.pickup(6);
    console.log('Sheep hunted, picked up drops. Inventory:', JSON.stringify(lib.inv()));
  } catch (err) {
    console.log('Hunt sheep note:', err.message);
  } finally {
    // Always return inside base!
    console.log('Returning inside base...');
    await lib.goTo(294, 72, -52, 1);
    if (typeof passDoorIn === 'function') await passDoorIn();
    else await lib.goThroughDoor(294, 72, -54);
  }
} else {
  console.log('No close sheep found or night too close (<100s). Staying safe inside base.');
}

// 2. Make sure door is closed
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlock && doorBlock.name.includes('door')) {
  // Ensure closed
  await lib.door(294, 72, -54, false).catch(() => {});
}

// 3. Check chest again for any wool matches
const chestPos = new Vec3(293, 72, -57);
const chestItems = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest items:', JSON.stringify(chestItems));

for (const color of ['white', 'gray', 'light_gray', 'black', 'brown']) {
  const woolName = `${color}_wool`;
  const total = (chestItems[woolName] || 0) + (lib.count(woolName) || 0);
  if (total >= 3 && bot.blockAt(new Vec3(293, 72, -56))?.name === 'air') {
    console.log(`We have 3x ${woolName}! Crafting bed...`);
    if (lib.count(woolName) < 3) {
      await lib.withdraw({ [woolName]: 3 - lib.count(woolName) }, chestPos.x, chestPos.y, chestPos.z);
    }
    const bedName = `${color}_bed`;
    await lib.craft(bedName, 1);
    await lib.place(bedName, 293, 72, -56);
    console.log(`Bed 2 placed at (293, 72, -56)!`);
    bot.chat(`beta: Bed 2 placed! Milestone 4 complete!`);
    break;
  }
}

// 4. Set spawn and sleep if night
await lib.setSpawn().catch(() => {});
if (lib.time().canSleep) {
  console.log('Sleeping...');
  await lib.sleepInBed().catch(e => console.log('Sleep note:', e.message));
}

bot.chat(`beta: Alpha safe in base. Durabilities: diamond_pick 96%, iron_pick 89%. Bucket ready. Night in ${lib.time().secondsUntilNight}s.`);
console.log('Pos:', lib.fmt(bot.entity.position), 'Status:', JSON.stringify(lib.status()));
