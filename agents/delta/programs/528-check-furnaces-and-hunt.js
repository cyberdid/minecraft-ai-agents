// programs/528-check-furnaces-and-hunt.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: CHECK FURNACES & SECURE FOOD/SHIELD ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Check the 3 furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    console.log(`Checking furnace at ${lib.fmt(fp)}...`);
    try {
      const furnace = await bot.openFurnace(fb);
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      const output = furnace.outputItem();
      console.log(`  Furnace input: ${input ? input.name + ' x' + input.count : 'empty'}`);
      console.log(`  Furnace fuel: ${fuel ? fuel.name + ' x' + fuel.count : 'empty'}`);
      console.log(`  Furnace output: ${output ? output.name + ' x' + output.count : 'empty'}`);

      if (output) {
        console.log(`  Withdrawing output: ${output.name} x${output.count}`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`  Error accessing furnace at ${lib.fmt(fp)}:`, e.message);
    }
  }
}

// Step 2: Check Beta
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta is at ${lib.fmt(beta.entity.position)} (dist: ${bot.entity.position.distanceTo(beta.entity.position).toFixed(1)})`);
}

// Step 3: Eat if we got any food from furnace
try {
  const foodItem = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
  if (foodItem && bot.food < 20) {
    console.log(`Eating ${foodItem.name}...`);
    await bot.equip(foodItem, 'hand');
    await bot.consume();
  }
} catch (e) {}

// Step 4: Craft shield if we have iron ingot and planks
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Craft shield error:', e.message);
  }
}

// Equip shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// Step 5: If food is still low (< 14), hunt nearby peaceful mobs
if (bot.food < 15) {
  console.log(`Food is ${bot.food}/20. Looking for animals near base...`);
  const mobs = Object.values(bot.entities).filter(e =>
    ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
    e.position.distanceTo(new Vec3(292, 72, -58)) < 40
  );
  console.log(`Found ${mobs.length} peaceful animals within 40m of base.`);
  if (mobs.length > 0) {
    try {
      await lib.obtain('cooked_beef', 2);
    } catch (e) {
      console.log('obtain cooked food fallback:', e.message);
      // Hunt closest mob
      const target = mobs[0];
      try {
        await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
        await lib.equipWeapon();
        bot.attack(target);
        await sleep(600);
        bot.attack(target);
        await sleep(600);
        await lib.pickup(4);
      } catch (e2) {}
    }
  }
}

console.log('=== SUMMARY ===');
console.log(`HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
