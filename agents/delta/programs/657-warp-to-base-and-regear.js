console.log('=== DELTA: WARP TO OVERWORLD BASE & REGEAR ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dimension: ${bot.game.dimension}`);

// 1. Warp to Overworld if in Nether
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 6
  });

  if (!portalBlock) {
    throw new Error('No nether_portal block within 6m!');
  }

  console.log(`Stepping into nether_portal at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);

  const startWarp = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - startWarp < 25000 && !isCancelled()) {
    // Keep centered in portal if drifting
    const p = bot.entity.position;
    if (Math.abs(p.z - (-7.0)) > 0.8) {
      bot.setControlState('forward', true);
      await sleep(200);
      bot.setControlState('forward', false);
    }
    await sleep(300);
  }

  if (bot.game.dimension !== 'overworld') {
    throw new Error(`Failed to warp to overworld within 25s (current dimension: ${bot.game.dimension})`);
  }
}

console.log(`Warped! Current dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// 2. Walk into Base (293, 72, -55)
// Check if outside base door
if (bot.entity.position.z > -54.0) {
  console.log('Passing through base door (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door passage info:', e.message);
  }
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
} catch (e) {
  try { await lib.goToXZ(293.5, -56.0, { timeoutMs: 6000 }); } catch (e2) {}
}

console.log(`At Base Chest area: ${lib.fmt(bot.entity.position)}`);

// 3. Inspect Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (!chestBlock) {
  throw new Error(`No block at chest position ${lib.fmt(chestPos)}`);
}

console.log(`Opening chest at ${lib.fmt(chestPos)}...`);
const chest = await bot.openContainer(chestBlock);
const chestItems = chest.containerItems();
console.log('Chest Contents:');
for (const it of chestItems) {
  console.log(`  ${it.name} x${it.count}`);
}

// Check blaze_powder
const blazePowder = chestItems.find(i => i.name === 'blaze_powder');
console.log(`Base Chest blaze_powder: ${blazePowder ? blazePowder.count : 0}`);

// Check ender_pearl
const pearlsInChest = chestItems.find(i => i.name === 'ender_pearl');
console.log(`Base Chest ender_pearl: ${pearlsInChest ? pearlsInChest.count : 0}`);

// Deposit junk items from Delta inventory
const junkNames = ['diorite', 'gravel', 'soul_sand', 'soul_soil', 'netherrack', 'oak_planks', 'oak_log', 'stick'];
for (const jName of junkNames) {
  const it = bot.inventory.items().find(i => i.name === jName);
  if (it) {
    try {
      await chest.deposit(it.type, null, it.count);
      console.log(`Deposited ${jName} x${it.count}`);
    } catch (e) {}
  }
}

// Deposit extra stone swords (keep 1 weapon)
const stoneSwords = bot.inventory.items().filter(i => i.name === 'stone_sword');
for (let s = 1; s < stoneSwords.length; s++) {
  try {
    await chest.deposit(stoneSwords[s].type, null, 1);
    console.log('Deposited extra stone_sword');
  } catch (e) {}
}

// Withdraw cooked food if available
const foodItem = chestItems.find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple');
if (foodItem) {
  const takeCount = Math.min(foodItem.count, 16);
  await chest.withdraw(foodItem.type, null, takeCount);
  console.log(`Withdrew ${foodItem.name} x${takeCount}`);
}

// Withdraw shield if chest has a spare and Delta's is worn out
const spareShield = chestItems.find(i => i.name === 'shield');
if (spareShield && bot.inventory.items().filter(i => i.name === 'shield').length <= 1) {
  await chest.withdraw(spareShield.type, null, 1);
  console.log('Withdrew fresh shield from chest');
}

// Withdraw gold ingots if any in chest
const goldInChest = chestItems.find(i => i.name === 'gold_ingot');
if (goldInChest) {
  await chest.withdraw(goldInChest.type, null, goldInChest.count);
  console.log(`Withdrew gold_ingot x${goldInChest.count} from chest`);
}

chest.close();

// 4. Eat food if Delta has food and hunger < 20
const invFood = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple');
if (invFood && bot.food < 20) {
  console.log(`Eating ${invFood.name}...`);
  await bot.equip(invFood.type, 'hand');
  await bot.consume();
  console.log(`Ate food! New Food: ${bot.food}/20, HP: ${bot.health}/20`);
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

bot.chat(`delta: Regeared at base. Food: ${bot.food}/20, HP: ${bot.health}/20. Pearls: ${lib.count('ender_pearl')}/12, Gold: ${lib.count('gold_ingot')}. Ready!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  inv: lib.inv()
};
