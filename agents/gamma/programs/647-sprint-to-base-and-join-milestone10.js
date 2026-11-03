// programs/647-sprint-to-base-and-join-milestone10.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 647: SPRINT TO BASE & ASSEMBLE MILESTONE 10 ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Move to Base House (293, 72, -55)
bot.chat('gamma: Sprinting to Base House (293, 72, -55) to join team for Milestone 10 (Eyes of Ender)!');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2.0));
  console.log('Arrived at Base area! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Pathfinder goto base error, using lib.goTo:', e.message);
  try {
    await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 25000 });
  } catch (e2) {
    console.log('lib.goTo error:', e2.message);
  }
}

// Ensure inside base through door if outside
if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 2.5) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// 2. Scan teammates at base
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Teammates at Base (${teammates.length}):`);
for (const tm of teammates) {
  console.log(`- ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}

// 3. Check time / sleep if night
const timeOfDay = bot.time.timeOfDay;
console.log(`Overworld Time of Day: ${timeOfDay}`);
if (timeOfDay >= 12542 && timeOfDay <= 23460) {
  console.log('Night is active! Attempting to sleep in bed...');
  const beds = bot.findBlocks({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
  for (const bp of beds) {
    try {
      const b = bot.blockAt(bp);
      await bot.sleep(b);
      console.log(`Sleeping in bed at ${lib.fmt(bp)}...`);
      await sleep(6000);
      break;
    } catch (se) {
      console.log(`Could not sleep in bed at ${lib.fmt(bp)}:`, se.message);
    }
  }
}

// 4. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();
    console.log(`Base Chest items (${cItems.length}):`);
    for (const it of cItems) {
      console.log(`  - ${it.name} x${it.count}`);
    }

    // Check for food
    const foodItem = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
    if (foodItem && bot.food < 18) {
      console.log(`Withdrawing ${foodItem.name} to eat...`);
      await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 4));
    }

    // Check for iron armor if available in chest
    for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots']) {
      const p = cItems.find(i => i.name === piece);
      if (p && lib.count(piece) === 0) {
        console.log(`Withdrawing ${piece}...`);
        await chest.withdraw(p.type, null, 1);
      }
    }

    // Check for blaze_powder & ender_pearl in chest
    const bp = cItems.find(i => i.name === 'blaze_powder');
    const ep = cItems.find(i => i.name === 'ender_pearl');
    console.log(`Chest Status: blaze_powder=${bp ? bp.count : 0}, ender_pearl=${ep ? ep.count : 0}`);

    // If both are in chest or inventory, craft Eyes of Ender!
    const invBP = lib.count('blaze_powder');
    const invEP = lib.count('ender_pearl');

    if (bp && ep) {
      const craftCount = Math.min(bp.count, ep.count);
      console.log(`Withdrawing ${craftCount} blaze_powder and ender_pearl to craft Eyes of Ender!`);
      await chest.withdraw(bp.type, null, craftCount);
      await chest.withdraw(ep.type, null, craftCount);
    }

    chest.close();
  } catch (ce) {
    console.log('Chest access error:', ce.message);
  }
}

// 5. Craft eye_of_ender if we hold both ingredients
const bpCount = lib.count('blaze_powder');
const epCount = lib.count('ender_pearl');
if (bpCount > 0 && epCount > 0) {
  const eyesToCraft = Math.min(bpCount, epCount);
  console.log(`Crafting ${eyesToCraft} eye_of_ender...`);
  try {
    await lib.craft('eye_of_ender', eyesToCraft);
    console.log(`SUCCESS! Crafted eye_of_ender! Inventory eyes: ${lib.count('eye_of_ender')}`);
    bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Milestone 10 ready for Stronghold triangulation!`);
  } catch (err) {
    console.log('lib.craft eye_of_ender failed:', err.message);
  }
}

// 6. Equip armor and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const finalEyes = lib.count('eye_of_ender');
console.log(`=== END PROGRAM 647: Eyes of Ender held: ${finalEyes}, HP: ${bot.health}, Food: ${bot.food} ===`);
return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  eyes: finalEyes,
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  teammates: teammates.map(t => ({ name: t.username, pos: t.position })),
  inv: lib.inv()
};
