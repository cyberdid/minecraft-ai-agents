// programs/767-step-in-portal-and-heal.js
console.log('=== Program 767: Step in Portal & Overworld Full Heal ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Step up and into Nether portal at (46.5, 66.0, 2.0)
if (bot.game.dimension === 'the_nether') {
  const portalTarget = new Vec3(46.5, 66.0, 2.0);
  console.log('Entering portal block at:', lib.fmt(portalTarget));

  await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(700);
  bot.setControlState('jump', false);
  await sleep(300);
  bot.setControlState('forward', false);

  console.log('Bot pos inside portal frame:', lib.fmt(bot.entity.position));
  console.log('Holding position for survival 4.0s warp timer...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - portalTarget.x) > 0.5 || Math.abs(cur.z - portalTarget.z) > 0.5 || cur.y < 65.8) {
      await bot.lookAt(portalTarget, true);
      bot.setControlState('forward', true);
      if (cur.y < 65.8) bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension !== 'overworld') {
  throw new Error(`Failed to warp; still in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

console.log('SUCCESS: Warped to Overworld base! Pos:', lib.fmt(bot.entity.position));

// Step 2: Step into base room
await sleep(400);
try {
  await lib.goTo(294, 72, -56, 1.0, { timeoutMs: 5000 });
} catch (e) {}

// Step 3: Sleep if night
if (lib.time().canSleep) {
  console.log('Night in Overworld, sleeping in bed...');
  try {
    await lib.sleepInBed();
    await sleep(3000);
  } catch (e) {}
}

// Step 4: Check base chest at (293, 72, -57) for food, gold ingots, and armor
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
    for (const item of chest.containerItems()) {
      if (['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'baked_potato'].includes(item.name)) {
        console.log(`Withdrawing ${item.count} ${item.name}...`);
        await chest.withdraw(item.type, null, item.count);
      }
      if (item.name === 'gold_ingot') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.count} gold_ingot for bartering!`);
      }
      if (item.name === 'iron_chestplate' && !bot.inventory.slots[6]) {
        await chest.withdraw(item.type, null, 1);
      }
      if (item.name === 'iron_helmet' && !bot.inventory.slots[5]) {
        await chest.withdraw(item.type, null, 1);
      }
      if (item.name === 'iron_leggings' && !bot.inventory.slots[7]) {
        await chest.withdraw(item.type, null, 1);
      }
    }
    await chest.close();
  } catch (e) {
    console.log('Chest note:', e.message);
  }
}

// Step 5: Eat food if available
let foodItems = bot.inventory.items().filter(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'].includes(i.name));
if (foodItems.length > 0) {
  console.log('Eating food to restore hunger...');
  try {
    await lib.eat();
    console.log('Ate food! Hunger level:', bot.food);
  } catch (e) {}
} else if (bot.food < 18) {
  console.log('No food in chest. Hunting 2 cows near base...');
  try {
    await lib.hunt('cow', 2);
    if (lib.count('raw_beef') > 0) {
      console.log('Smelting raw beef in base furnace...');
      await lib.smelt('raw_beef', '*_planks', lib.count('raw_beef'));
      await lib.eat();
    }
  } catch (e) {
    try {
      await lib.hunt('sheep', 2);
      if (lib.count('raw_mutton') > 0) {
        await lib.smelt('raw_mutton', '*_planks', lib.count('raw_mutton'));
        await lib.eat();
      }
    } catch (e2) {}
  }
}

// Step 6: Wait for health regeneration if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log(`Healing (HP: ${bot.health})...`);
  const healStart = Date.now();
  while (bot.health < 19 && Date.now() - healStart < 12000 && !isCancelled()) {
    await sleep(500);
  }
  console.log('HP after heal:', bot.health);
}

// Step 7: Equip gear
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Regear & Heal Finished ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet armor slot:', bot.inventory.slots[8]?.name);
console.log('Gold ingots for bartering:', lib.count('gold_ingot'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  gold_ingots: lib.count('gold_ingot'),
  pickaxes: lib.count('*_pickaxe'),
  swords: lib.count('*_sword')
};
