// programs/511-retreat-to-base-and-smelt-shield.js
console.log('=== Program 511: Retreat to Base & Craft Shield ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time until night:', lib.time().secondsUntilNight);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

bot.pathfinder.stop();
await sleep(100);

// 1. Move towards base entrance at (294, 72, -52)
console.log('Walking to base door outside at (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1);
} catch (e) {
  console.log('lib.goTo note:', e.message);
  // fallback pathfinder
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// 2. Enter through door
await passDoorIn();
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 3. Craft planks if needed (need 6 planks for shield)
if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
  await lib.craft('birch_planks', 4);
}
console.log('Planks count:', lib.count('*_planks'));

// 4. Smelt 1-2 raw_iron in furnace at (295, 72, -55)
const furnacePos = new Vec3(295, 72, -55);
const furnaceBlock = bot.blockAt(furnacePos) || bot.blockAt(new Vec3(295, 72, -57));
if (furnaceBlock && lib.count('raw_iron') > 0) {
  console.log(`Opening furnace at ${lib.fmt(furnaceBlock.position)}...`);
  const furnace = await bot.openFurnace(furnaceBlock);
  
  // Use wooden_pickaxe or sapling or 1 plank as fuel
  const fuelItem = bot.inventory.items().find(i => i.name === 'wooden_pickaxe' || i.name === 'birch_sapling' || i.name === 'stick');
  const rawIron = bot.inventory.items().find(i => i.name === 'raw_iron');
  
  if (rawIron && fuelItem) {
    console.log(`Putting ${rawIron.name} and fuel ${fuelItem.name} in furnace...`);
    await furnace.putInput(rawIron.type, null, Math.min(2, rawIron.count));
    await furnace.putFuel(fuelItem.type, null, Math.min(2, fuelItem.count));
    
    // Wait for smelting (approx 10s per ingot)
    console.log('Waiting for smelting to finish...');
    for (let i = 0; i < 25; i++) {
      await sleep(1000);
      if (furnace.outputItem() && furnace.outputItem().count >= 1) {
        console.log(`Smelted ${furnace.outputItem().name} x${furnace.outputItem().count}!`);
        await furnace.takeOutput();
        break;
      }
    }
  }
  await furnace.close();
}

console.log('Inventory after smelting:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 5. Craft Shield if iron ingot present
if (lib.count('iron_ingot') >= 1) {
  // Shield requires 6 planks + 1 iron_ingot
  // Check if we need more planks
  if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
    await lib.craft('birch_planks', 4);
  }
  if (lib.count('*_planks') >= 6) {
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
    await lib.equipArmor();
  } else {
    console.log(`Need 6 planks for shield, have ${lib.count('*_planks')}`);
  }
}

// 6. If night, sleep in bed to skip night and reset time
if (lib.time().canSleep) {
  console.log('Night has fallen. Sleeping in bed...');
  try {
    await lib.setSpawn();
    await sleep(2000);
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

console.log('=== Base Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Tools & Armor:', JSON.stringify(lib.tools()));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
