// programs/555-return-base-sleep-and-gold-check.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: RETURN BASE, AUDIT GOLD & SLEEP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Walk to Base (293, 72, -55)
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2)); } catch (e2) {}
}

// Step 2: Enter base door
if (bot.entity.position.z > -54.0) {
  console.log('Entering base door (294, 72, -54)...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

console.log(`Inside base at: ${lib.fmt(bot.entity.position)}`);

// Confirm spawn at bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bedBlock) {
  try {
    await lib.setSpawn(bedBlock.position.x, bedBlock.position.y, bedBlock.position.z);
    console.log('Spawn locked at base bed!');
  } catch (e) {}
}

// Step 3: Inspect Base Chest for gold, armor, shield
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
let chestItems = [];
if (cBlock && cBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(cBlock);
    chestItems = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('=== BASE CHEST FULL AUDIT ===');
    console.log(JSON.stringify(chestItems));

    // Check for gold items
    const goldIngot = chest.containerItems().find(i => i.name === 'gold_ingot');
    const rawGold = chest.containerItems().find(i => i.name === 'raw_gold');
    const goldBoots = chest.containerItems().find(i => i.name === 'golden_boots');
    const goldHelmet = chest.containerItems().find(i => i.name === 'golden_helmet');
    const shield = chest.containerItems().find(i => i.name === 'shield');

    console.log(`Gold status: ingots=${goldIngot ? goldIngot.count : 0}, raw_gold=${rawGold ? rawGold.count : 0}, golden_boots=${goldBoots ? 'YES' : 'NO'}, shield=${shield ? 'YES' : 'NO'}`);

    if (goldBoots) {
      console.log('Withdrawing golden_boots from chest!');
      await chest.withdraw(goldBoots.type, null, 1);
    } else if (goldIngot && goldIngot.count >= 4) {
      console.log(`Withdrawing ${Math.min(goldIngot.count, 8)} gold ingots to craft golden_boots!`);
      await chest.withdraw(goldIngot.type, null, Math.min(goldIngot.count, 8));
    }

    if (shield && lib.count('shield') === 0) {
      console.log('Withdrawing shield from chest!');
      await chest.withdraw(shield.type, null, 1);
    }

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Step 4: Craft golden_boots if we have 4 gold ingots
if (lib.count('golden_boots') === 0 && lib.count('gold_ingot') >= 4) {
  try {
    console.log('Crafting golden_boots for 100% Piglin neutrality...');
    await lib.craft('golden_boots', 1);
    console.log('Golden boots crafted successfully!');
  } catch (e) {
    console.log('Golden boots craft error:', e.message);
  }
}

// Equip armor & shield
try { await lib.equipArmor(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// Step 5: Night sleep coordination
const t = bot.time.timeOfDay;
console.log(`Time of day: ${t}, night in ${lib.time().secondsUntilNight}s`);
if (t >= 12542 && t <= 23460) {
  console.log('Night is active! Sleeping in bed...');
  if (bedBlock) {
    try {
      await bot.sleep(bedBlock);
      bot.chat('delta: Sleeping in bed with Alpha!');
      while (bot.isSleeping && !isCancelled()) {
        await sleep(500);
      }
      bot.chat('delta: Morning! Night skipped!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  }
}

bot.chat(`delta: Base status — HP: ${bot.health.toFixed(1)}, Food: ${bot.food}, Boots: ${bot.inventory.slots[8]?.name}, Shield: ${bot.inventory.slots[45]?.name}`);

console.log('=== SUMMARY ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  boots: bot.inventory.slots[8]?.name,
  shield: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
