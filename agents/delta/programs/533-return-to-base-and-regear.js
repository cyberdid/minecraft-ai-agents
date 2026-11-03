// programs/533-return-to-base-and-regear.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: RETURN TO BASE & REGEAR ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: March straight back to base
console.log('Pathfinding to base at (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('lib.goTo notice:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2));
  } catch (e2) {}
}

// Step 2: Enter base door
if (bot.entity.position.z > -54.0) {
  console.log('Passing through base door (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door error:', e.message);
  }
}

bot.chat('delta: Inside base! Checking furnace for iron ingot & chest for food!');

// Step 3: Take smelted iron from furnace (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const furnace = await bot.openFurnace(fb);
    const out = furnace.outputItem();
    if (out) {
      console.log(`Withdrawing from furnace: ${out.name} x${out.count}`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

// Step 4: Craft shield if we have iron ingot and planks
console.log(`Planks: ${lib.count('*_planks')}, Iron ingots: ${lib.count('iron_ingot')}`);
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
    try { await lib.craft('oak_planks', 4); } catch (e) {}
  }
  try {
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    console.log('Shield crafted!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// Equip shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {}

// Step 5: Check chest for food deposited by Beta or Alpha
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(cBlock);
    const foodItem = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
    if (foodItem) {
      console.log(`Withdrawing food from chest: ${foodItem.name} x${Math.min(foodItem.count, 8)}`);
      await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 8));
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Step 6: Eat food to replenish hunger
try {
  const foodItem = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
  if (foodItem && bot.food < 20) {
    console.log(`Eating ${foodItem.name}...`);
    await bot.equip(foodItem, 'hand');
    await bot.consume();
  }
} catch (e) {}

// Step 7: Equip armor and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Step 8: If night is near, sleep in bed
const t = lib.time();
console.log(`Time: night in ${t.secondsUntilNight}s, isNight: ${t.isNight}`);
if (t.isNight || t.secondsUntilNight < 60) {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
  if (bed) {
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bed);
      await sleep(3000);
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  }
}

console.log('=== DELTA REGEAR STATUS ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
