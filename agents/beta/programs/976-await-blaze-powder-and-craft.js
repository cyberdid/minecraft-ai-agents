console.log('=== Program 976: Await Blaze Powder & Craft 22 Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Current Eyes:', lib.count('ender_eye'), 'Pearls:', lib.count('ender_pearl'));

// Check furnaces at (295, 72, -54..-56)
for (const z of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, z);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      const output = f.outputItem();
      const input = f.inputItem();
      const fuel = f.fuelItem();
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}`);
      if (output && output.name.includes('cooked')) {
        await f.takeOutput();
        console.log(`Took ${output.count} ${output.name} from furnace!`);
      }
      f.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fPos)} error:`, e.message);
    }
  }
}

// Deposit junk items into base chest (293, 72, -57) to keep inventory clean
const junk = ['stone_sword', 'wooden_pickaxe', 'stone_pickaxe', 'bone', 'andesite', 'blackstone', 'crying_obsidian', 'gold_nugget'];
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    for (const jName of junk) {
      const items = bot.inventory.items().filter(i => i.name === jName);
      for (const it of items) {
        // keep at least 1 stone_pickaxe or stone_sword if we don't have iron, but we have iron_sword and iron_pickaxe!
        try {
          await chest.deposit(it.type, null, it.count);
          console.log(`Deposited ${it.name} x${it.count}`);
        } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {}
}

const start = Date.now();
const MAX_WAIT = 45000; // 45s

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  // Check ground pickup
  try { await lib.pickup(6.0); } catch (e) {}

  // Check Base Chest
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      const pow = cItems.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`Found ${pow.count} blaze_powder in chest! Withdrawing...`);
        await chest.withdraw(pow.type, null, pow.count);
      }
      const rods = cItems.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`Found ${rods.count} blaze_rod in chest! Withdrawing...`);
        await chest.withdraw(rods.type, null, rods.count);
      }
      // Also check food in chest
      const food = cItems.find(i => i.name.includes('cooked') || i.name === 'bread' || i.name === 'apple' || i.name === 'carrot');
      if (food && lib.count(food.name) === 0) {
        console.log(`Found food ${food.name} x${food.count} in chest! Withdrawing...`);
        await chest.withdraw(food.type, null, Math.min(food.count, 16));
      }
      chest.close();
    } catch (e) {}
  }

  // If we have blaze_rod, craft to powder
  if (lib.count('blaze_rod') > 0) {
    const rCount = lib.count('blaze_rod');
    try {
      await lib.craft('blaze_powder', rCount * 2);
      console.log(`Crafted ${rCount * 2} blaze_powder!`);
    } catch (e) {
      console.log('Craft blaze_powder error:', e.message);
    }
  }

  // If we have blaze_powder and ender_pearl, craft ender_eye
  const powCount = lib.count('blaze_powder');
  const pearlCount = lib.count('ender_pearl');
  if (powCount > 0 && pearlCount > 0) {
    const toCraft = Math.min(powCount, pearlCount);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`SUCCESS! Crafted ${toCraft} ender_eye! Total now: ${lib.count('ender_eye')}`);
      bot.chat(`Beta: Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft ender_eye error:', e.message);
    }
  }

  if (lib.count('ender_eye') >= 12) {
    console.log(`TARGET REACHED: ${lib.count('ender_eye')} Eyes of Ender in inventory!`);
    break;
  }

  // Check players
  for (const name of ['gamma', 'alpha', 'delta']) {
    const pl = bot.players[name];
    if (pl && pl.entity && bot.entity.position.distanceTo(pl.entity.position) < 8) {
      // Teammate is near!
      console.log(`Teammate ${name} is near: ${lib.fmt(pl.entity.position)}`);
    }
  }

  await sleep(2000);
}

// Eat food if available and hungry
if (bot.food < 18) {
  try {
    await lib.eat();
  } catch (e) {}
}

console.log('Ending Program 976. Inventory:');
for (const [k, v] of Object.entries(lib.inv())) {
  console.log(`  ${k}: ${v}`);
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  food: bot.food,
  hp: bot.health
};
