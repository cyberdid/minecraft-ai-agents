// programs/795-finish-sprint-to-base.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 795: Finish Sprint to Base & Regear ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Configure fast overland movement
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  new Vec3(265, 70, -52),
  new Vec3(290, 72, -54),
  new Vec3(293, 72, -55)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 8000 });
    } catch (e2) {}
  }
}

// Enter through base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(293, 72, -55, 1.0); } catch (e2) {}
}

console.log('Pos inside base:', lib.fmt(bot.entity.position));

// Set spawn at base bed
try {
  await lib.setSpawn();
  bot.chat('Beta: Spawn permanently locked at base bed!');
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('setSpawn notice:', e.message);
}

// Access Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest items:', chest.items().map(i => `${i.name}x${i.count}`).join(', '));

    // Deposit iron_boots to ensure golden_boots stay on
    const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
    if (ib) {
      await chest.deposit(ib.type, null, ib.count);
      console.log('Deposited iron_boots.');
    }

    // Deposit redundant pickaxes and stone swords
    for (const name of ['wooden_pickaxe', 'stone_pickaxe', 'stone_sword']) {
      const items = bot.inventory.items().filter(i => i.name === name);
      if (items.length > 1 || name === 'wooden_pickaxe') {
        const toDeposit = name === 'wooden_pickaxe' ? items : items.slice(1);
        for (const item of toDeposit) {
          try { await chest.deposit(item.type, null, item.count); } catch (e) {}
        }
      }
    }

    // Withdraw shield if present
    const shieldInChest = chest.items().find(i => i.name === 'shield');
    if (shieldInChest && lib.count('shield') === 0) {
      await chest.withdraw(shieldInChest.type, null, 1);
      console.log('Withdrew shield from chest!');
    }

    // Withdraw cooked food
    const foodInChest = chest.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken'].includes(i.name));
    if (foodInChest) {
      const takeCount = Math.min(foodInChest.count, 12);
      await chest.withdraw(foodInChest.type, null, takeCount);
      console.log(`Withdrew ${foodInChest.name}x${takeCount} from chest.`);
    }

    // Withdraw gold ingots
    const goldInChest = chest.items().find(i => i.name === 'gold_ingot');
    if (goldInChest && goldInChest.count > 0) {
      await chest.withdraw(goldInChest.type, null, goldInChest.count);
      console.log(`Withdrew ${goldInChest.count} gold ingots from chest for bartering!`);
    }

    // Check if chest has iron ingots & planks to craft shield if still missing
    if (lib.count('shield') === 0) {
      const iron = chest.items().find(i => i.name === 'iron_ingot');
      const planks = chest.items().find(i => i.name.endsWith('_planks'));
      if (iron && planks && planks.count >= 6) {
        await chest.withdraw(iron.type, null, 1);
        await chest.withdraw(planks.type, null, 6);
      }
    }

    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Craft shield if needed
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield!');
  } catch (e) {
    console.log('Shield craft notice:', e.message);
  }
}

// Equip shield in offhand
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) {
  try {
    await bot.equip(sh, 'off-hand');
    console.log('Equipped shield in offhand!');
  } catch (e) {}
}

// Verify golden_boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Re-equipped golden_boots!'); } catch (e) {}
  }
}

// Equip iron weapon
const weapon = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (weapon) {
  try { await bot.equip(weapon, 'hand'); } catch (e) {}
}

console.log('=== Program 795 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Feet:', bot.inventory.slots[8]?.name);
console.log('Hand:', bot.inventory.slots[bot.getEquipmentDestSlot('hand')]?.name);
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  shield: bot.inventory.slots[45]?.name === 'shield',
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
