// programs/648-sprint-to-base-and-sleep.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 648: SPRINT TO BASE & NIGHT SLEEP ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Stop any prior pathfinder goals
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

bot.chat('gamma: Sprinting to Base House (293, 72, -55) before nightfall!');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

// Sprint towards base
const basePos = new Vec3(293, 72, -55);
const dist = bot.entity.position.distanceTo(basePos);
console.log(`Distance to base: ${dist.toFixed(1)}m`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 1.5));
  console.log('Successfully arrived at Base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Direct pathfinder goto base ended/interrupted:', e.message);
  try {
    await lib.goToXZ(293, -55, { timeoutMs: 30000 });
  } catch (e2) {
    console.log('lib.goToXZ error:', e2.message);
  }
}

// Enter through door if outside
if (bot.entity.position.z > -54.2 || bot.entity.position.distanceTo(basePos) > 3.0) {
  try {
    console.log('Entering through door at (294, 72, -54)...');
    await lib.goThroughDoor(294, 72, -54);
  } catch (de) {
    console.log('goThroughDoor error:', de.message);
  }
}

console.log('Inside Base check, Pos:', lib.fmt(bot.entity.position));

// Check time & sleep
let time = bot.time.timeOfDay;
console.log(`Current Time of Day: ${time}`);

// If night (12542..23460) or close to night, wait inside and sleep
if (time >= 12000 && time <= 23460) {
  console.log('Night is falling / active. Finding bed inside base...');
  bot.chat('gamma: Inside base ready to sleep!');

  const startSleepWait = Date.now();
  while (Date.now() - startSleepWait < 35000 && !isCancelled()) {
    time = bot.time.timeOfDay;
    if (time >= 12542 && time <= 23460) {
      const beds = bot.findBlocks({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
      for (const bp of beds) {
        try {
          const bedBlock = bot.blockAt(bp);
          await bot.sleep(bedBlock);
          console.log(`Sleeping in bed at ${lib.fmt(bp)}...`);
          await sleep(6000);
          break;
        } catch (se) {
          // Bed may be occupied by teammate, try next bed
        }
      }
    }
    if (time < 12000 || time > 23500) {
      console.log('Dawn reached! Time:', time);
      break;
    }
    await sleep(1000);
  }
}

// Inspect Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock && chestBlock.name.includes('chest') && bot.entity.position.distanceTo(chestPos) <= 4.0) {
  try {
    console.log('Inspecting Base Chest...');
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log(`Base Chest holds ${items.length} stacks:`);
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }

    // Check if food
    const food = items.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
    if (food && bot.food < 18) {
      await chest.withdraw(food.type, null, Math.min(food.count, 4));
    }

    // Check if blaze_powder and ender_pearl
    const bp = items.find(i => i.name === 'blaze_powder');
    const ep = items.find(i => i.name === 'ender_pearl');
    if (bp && ep) {
      const craftCount = Math.min(bp.count, ep.count);
      console.log(`Withdrawing ${craftCount} blaze_powder & ender_pearl to craft Eyes of Ender!`);
      await chest.withdraw(bp.type, null, craftCount);
      await chest.withdraw(ep.type, null, craftCount);
    }

    chest.close();
  } catch (ce) {
    console.log('Chest error:', ce.message);
  }
}

// Craft eye_of_ender if we hold ingredients
const bpCount = lib.count('blaze_powder');
const epCount = lib.count('ender_pearl');
if (bpCount > 0 && epCount > 0) {
  const toCraft = Math.min(bpCount, epCount);
  console.log(`Crafting ${toCraft} eye_of_ender...`);
  try {
    await lib.craft('eye_of_ender', toCraft);
    console.log(`CRAFTED! Total eye_of_ender in inventory: ${lib.count('eye_of_ender')}`);
    bot.chat(`gamma: Crafted ${lib.count('eye_of_ender')} Eyes of Ender! Ready for Stronghold triangulation!`);
  } catch (err) {
    console.log('Craft error:', err.message);
  }
}

// Equip armor & weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const finalEyes = lib.count('eye_of_ender');
console.log(`=== END PROGRAM 648: Eyes=${finalEyes}, Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food} ===`);
return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  eyes: finalEyes,
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
