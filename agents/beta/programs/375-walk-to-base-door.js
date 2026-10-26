// programs/375-walk-to-base-door.js
console.log('=== Walk across surface to base door and enter ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Reached the surface at y=69! Walking straight into base before night!');

// Walk across surface to base door (294, 72, -53)
console.log('Walking to base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
  console.log('At base door! Going through door...');
  await lib.goThroughDoor(294, 72, -54);
  console.log('SAFELY INSIDE BASE WITH TEAM!');
  bot.chat('beta: Safely inside base with team! Nether portal lit, ready to gear up and eat!');
} catch (e) {
  console.log('Base door walk note:', e.message);
  // Direct entrance
  try {
    await lib.goTo(294, 72, -55, 1, { timeoutMs: 15000, dig: true });
    console.log('Inside base!');
  } catch (err) {
    console.log('Direct entrance note:', err.message);
  }
}

// Check time and sleep if night starts
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, canSleep: ${t.canSleep}, secondsUntilNight: ${t.secondsUntilNight}`);
if (t.canSleep) {
  console.log('Attempting sleep in bed...');
  try {
    const bed = bot.findBlock({ matching: b => b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      await bot.sleep(bed);
      console.log('Sleeping peacefully in bed!');
    }
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// Check chest for food
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && bot.entity.position.distanceTo(chestBlock.position) < 4) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems().map(i => `${i.name}x${i.count}`);
    console.log('Chest items:', items.join(', '));
    // Take any cooked food
    const cookedFoods = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
    for (const cf of cookedFoods) {
      const it = chest.containerItems().find(i => i.name === cf);
      if (it) {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Took ${cf}x${it.count} from chest!`);
        break;
      }
    }
    chest.close();
  } catch (err) {
    console.log('Chest note:', err.message);
  }
}

// Eat food if we have it
const foodNames = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const f of foodNames) {
  if (lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log('Ate! Food level:', bot.food, 'health:', bot.health);
    } catch (err) {
      console.log('Eat note:', err.message);
    }
  }
}

console.log('Beta final status: pos =', lib.fmt(bot.entity.position), 'health =', bot.health, 'food =', bot.food);
