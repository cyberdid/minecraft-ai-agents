console.log('=== Program 979: Check Chest, Withdraw Powder, Craft Eyes & Prep ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Current Eyes:', lib.count('ender_eye'), 'Pearls:', lib.count('ender_pearl'));

// Check nearby players
for (const pName of ['gamma', 'delta', 'alpha']) {
  const p = bot.players[pName];
  if (p && p.entity) {
    console.log(`Teammate ${pName} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  } else {
    console.log(`Teammate ${pName} not in visual range.`);
  }
}

// Pickup nearby dropped items
try { await lib.pickup(6.0); } catch (e) {}

// Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log(`Base Chest contains ${items.length} item stacks:`);
    for (const it of items) {
      if (['blaze_powder', 'blaze_rod', 'ender_pearl', 'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'shield', 'cooked_beef', 'cooked_porkchop', 'bread', 'apple', 'iron_ingot'].includes(it.name) || it.name.includes('cooked')) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }

    const pow = items.find(i => i.name === 'blaze_powder');
    if (pow) {
      console.log(`Withdrawing ${pow.count} blaze_powder!`);
      await chest.withdraw(pow.type, null, pow.count);
    }

    const rods = items.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`Withdrawing ${rods.count} blaze_rod!`);
      await chest.withdraw(rods.type, null, rods.count);
    }

    const food = items.find(i => i.name.includes('cooked') || i.name === 'bread' || i.name === 'apple');
    if (food && bot.food < 18) {
      console.log(`Withdrawing food: ${food.name} x${Math.min(food.count, 8)}`);
      await chest.withdraw(food.type, null, Math.min(food.count, 8));
    }

    chest.close();
  } catch (err) {
    console.log('Error opening chest:', err.message);
  }
}

// Craft blaze_rod to blaze_powder if held
if (lib.count('blaze_rod') > 0) {
  try {
    const r = lib.count('blaze_rod');
    await lib.craft('blaze_powder', r * 2);
    console.log(`Crafted ${r * 2} blaze_powder!`);
  } catch (e) {
    console.log('blaze_powder craft error:', e.message);
  }
}

// Craft ender_eye if held
const powCount = lib.count('blaze_powder');
const pearlCount = lib.count('ender_pearl');
if (powCount > 0 && pearlCount > 0) {
  const count = Math.min(powCount, pearlCount);
  console.log(`Crafting ${count} ender_eye...`);
  try {
    await lib.craft('ender_eye', count);
    console.log(`SUCCESS: Crafted ${count} ender_eye! Total held: ${lib.count('ender_eye')}`);
    bot.chat(`Beta: Crafted ${count} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
  } catch (e) {
    console.log('ender_eye craft error:', e.message);
  }
}

// Eat food if available
if (bot.food < 18) {
  try { await lib.eat(); } catch (e) {}
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
