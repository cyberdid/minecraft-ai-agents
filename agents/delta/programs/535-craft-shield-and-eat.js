// programs/535-craft-shield-and-eat.js
console.log('=== DELTA: CRAFT SHIELD, EAT & COORDINATE ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Food: ${bot.food}, HP: ${bot.health}`);

// Move to center of base room
await lib.goTo(294, 72, -55, 1);

// Step 1: Open furnace at (295, 72, -55) to take smelted iron ingot
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
    console.log('Furnace notice:', e.message);
  }
}

// Step 2: Craft shield at base crafting table (295, 72, -56)
console.log(`Iron ingots: ${lib.count('iron_ingot')}, Planks: ${lib.count('*_planks')}`);
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// Equip shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {}

// Step 3: Wait a few seconds for Beta to arrive and drop food, vacuum any drops in base
for (let wait = 0; wait < 6; wait++) {
  try { await lib.pickup(4); } catch (e) {}
  
  // Check if we picked up food
  const edible = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken', 'beef', 'mutton', 'porkchop'].includes(i.name));
  if (edible) {
    if (['beef', 'mutton', 'porkchop'].includes(edible.name)) {
      // Put in furnace to cook
      if (fb) {
        try {
          const furnace = await bot.openFurnace(fb);
          await furnace.putInput(edible.type, null, edible.count);
          furnace.close();
          console.log(`Put ${edible.name} x${edible.count} in furnace to cook!`);
        } catch (e) {}
      }
    } else {
      // Cooked food: Eat!
      console.log(`Eating ${edible.name}...`);
      await bot.equip(edible, 'hand');
      await bot.consume();
    }
  }

  // Check chest
  const cBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (cBlock && bot.food < 15) {
    try {
      const chest = await bot.openChest(cBlock);
      const foodItem = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato'].includes(i.name));
      if (foodItem) {
        console.log(`Withdrawing food from chest: ${foodItem.name} x${foodItem.count}`);
        await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 8));
      }
      chest.close();
    } catch (e) {}
  }

  if (bot.food >= 18) break;
  await sleep(1000);
}

// Step 4: Check night sleep
const t = lib.time();
console.log(`Time: night in ${t.secondsUntilNight}s`);
if (t.secondsUntilNight < 60 || t.isNight) {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
  if (bed) {
    try {
      console.log('Sleeping in bed to skip night and reset hunger/health...');
      await bot.sleep(bed);
      await sleep(3000);
    } catch (e) {
      console.log('Sleep error:', e.message);
    }
  }
}

bot.chat(`delta: Status - HP: ${bot.health.toFixed(1)}, Food: ${bot.food}, Shield: ${lib.count('shield') > 0 ? 'YES' : 'NO'}`);

return {
  hp: bot.health,
  food: bot.food,
  shield: lib.count('shield'),
  inv: lib.inv()
};
