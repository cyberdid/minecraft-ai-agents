// programs/794-return-to-base-and-regear.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 794: Return to Base & Regear ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Walk to base at (293, 72, -55)
bot.chat('Beta: Sprinting back to base from spawn to set spawn, craft shield, and gather bartering supplies!');

const waypoints = [
  new Vec3(205, 64, -48),
  new Vec3(235, 68, -50),
  new Vec3(265, 70, -52),
  new Vec3(290, 72, -54),
  new Vec3(293, 72, -55)
];

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 3.0) continue;
  console.log(`Walking to waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    console.log(`Pathfinder retry to ${lib.fmt(wp)}: ${e.message}`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.5, { timeoutMs: 12000 });
    } catch (e2) {}
  }
}

// Step 2: Enter base door at (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(293, 72, -55, 1.0); } catch (e2) {}
}

console.log('Pos inside base:', lib.fmt(bot.entity.position));

// Step 3: Set spawn in bed at (294, 72, -55)
const bedBlock = bot.findBlock({
  matching: b => b && b.name.endsWith('_bed'),
  maxDistance: 6
});
if (bedBlock) {
  console.log('Setting bed spawn point...');
  try {
    await lib.setSpawn();
    console.log('Spawn set successfully!');
  } catch (e) {
    console.log('setSpawn notice:', e.message);
  }
}

// Step 4: Access Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.items();
    console.log('Base Chest contains:', items.map(i => `${i.name}x${i.count}`).join(', '));

    // Deposit iron_boots so we never lose golden_boots
    const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
    if (ib) {
      await chest.deposit(ib.type, null, ib.count);
      console.log('Deposited iron_boots into chest.');
    }

    // Deposit surplus weapons/pickaxes
    const stonePicks = bot.inventory.items().filter(i => i.name === 'stone_pickaxe');
    if (stonePicks.length > 1) {
      for (let p of stonePicks.slice(1)) {
        await chest.deposit(p.type, null, p.count);
      }
    }
    const woodPicks = bot.inventory.items().filter(i => i.name === 'wooden_pickaxe');
    for (let p of woodPicks) {
      await chest.deposit(p.type, null, p.count);
    }
    const stoneSwords = bot.inventory.items().filter(i => i.name === 'stone_sword');
    if (stoneSwords.length > 1) {
      for (let s of stoneSwords.slice(1)) {
        await chest.deposit(s.type, null, s.count);
      }
    }

    // Check if chest has a shield
    const shieldInChest = chest.items().find(i => i.name === 'shield');
    if (shieldInChest) {
      await chest.withdraw(shieldInChest.type, null, 1);
      console.log('Withdrew shield from chest!');
    }

    // Check if chest has iron ingots for shield crafting if needed
    const ironInChest = chest.items().find(i => i.name === 'iron_ingot');
    if (ironInChest && lib.count('shield') === 0) {
      await chest.withdraw(ironInChest.type, null, Math.min(ironInChest.count, 3));
    }

    // Check for wood planks
    const woodInChest = chest.items().find(i => i.name.endsWith('_planks'));
    if (woodInChest && lib.count('shield') === 0) {
      await chest.withdraw(woodInChest.type, null, Math.min(woodInChest.count, 12));
    }

    // Withdraw food if available
    const foodInChest = chest.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken'].includes(i.name));
    if (foodInChest) {
      await chest.withdraw(foodInChest.type, null, Math.min(foodInChest.count, 8));
      console.log(`Withdrew ${foodInChest.name}x${Math.min(foodInChest.count, 8)} from chest.`);
    }

    // Withdraw gold ingots if any for bartering
    const goldInChest = chest.items().find(i => i.name === 'gold_ingot');
    if (goldInChest && goldInChest.count > 0) {
      await chest.withdraw(goldInChest.type, null, goldInChest.count);
      console.log(`Withdrew ${goldInChest.count} gold ingots for bartering!`);
    }

    await chest.close();
  } catch (e) {
    console.log('Chest interaction error:', e.message);
  }
}

// Step 5: Craft shield if missing and have materials
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield at crafting table...');
  try {
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Craft shield notice:', e.message);
  }
}

// Step 6: Equip gear properly
try { await lib.equipArmor(); } catch (e) {}
// Crucial: Re-verify golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Re-equipped golden_boots!'); } catch (e) {}
  }
}

// Equip shield in offhand (slot 45)
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) {
  try {
    await bot.equip(sh, 'off-hand');
    console.log('Equipped shield in off-hand!');
  } catch (e) {
    console.log('Equip shield error:', e.message);
  }
}

// Equip iron sword in main hand
const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sword) {
  try { await bot.equip(sword, 'hand'); } catch (e) {}
}

console.log('=== Program 794 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Feet:', bot.inventory.slots[8]?.name);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  shield: bot.inventory.slots[45]?.name === 'shield',
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
