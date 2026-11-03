console.log('=== DELTA: WARP TO OVERWORLD BASE ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dimension: ${bot.game.dimension}`);

// Stand inside portal block at (46.5, 66.0, 2.0)
const portalTarget = new Vec3(46.5, 66.0, 2.0);
console.log(`Stepping into nether_portal at ${lib.fmt(portalTarget)}...`);

await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Standing motionless inside portal to trigger warp...');
const startWarp = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - startWarp < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  // Keep centered inside portal frame
  if (Math.abs(cur.x - 46.5) > 0.6 || Math.abs(cur.z - 2.0) > 0.6) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(250);
    bot.setControlState('forward', false);
  }
  await sleep(300);
}

if (bot.game.dimension !== 'overworld') {
  throw new Error(`Failed to warp to overworld within 25s (dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)})`);
}

console.log(`WARPED TO OVERWORLD! Pos: ${lib.fmt(bot.entity.position)}`);

// Walk inside base
if (bot.entity.position.z > -54.0) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door passage notice:', e.message);
  }
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
} catch (e) {
  try { await lib.goToXZ(293.5, -56.0, { timeoutMs: 6000 }); } catch (e2) {}
}

console.log(`At Base Chest area: ${lib.fmt(bot.entity.position)}`);

// Open Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock) {
  const chest = await bot.openContainer(chestBlock);
  const items = chest.containerItems();
  console.log('--- Base Chest Contents ---');
  for (const it of items) {
    console.log(`  ${it.name} x${it.count}`);
  }

  // Confirm blaze_powder
  const bp = items.find(i => i.name === 'blaze_powder');
  console.log(`Blaze Powder in chest: ${bp ? bp.count : 0}`);

  // Confirm ender_pearl
  const ep = items.find(i => i.name === 'ender_pearl');
  console.log(`Ender Pearls in chest: ${ep ? ep.count : 0}`);

  // Deposit junk
  const junk = ['diorite', 'gravel', 'soul_sand', 'soul_soil', 'netherrack', 'oak_planks', 'oak_log', 'stick'];
  for (const j of junk) {
    const invIt = bot.inventory.items().find(i => i.name === j);
    if (invIt) {
      try {
        await chest.deposit(invIt.type, null, invIt.count);
        console.log(`Deposited ${j} x${invIt.count}`);
      } catch (e) {}
    }
  }

  // Withdraw cooked food
  const food = items.find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple');
  if (food) {
    const qty = Math.min(food.count, 16);
    await chest.withdraw(food.type, null, qty);
    console.log(`Withdrew ${food.name} x${qty}`);
  }

  // Withdraw spare shield
  const freshShield = items.find(i => i.name === 'shield');
  if (freshShield) {
    await chest.withdraw(freshShield.type, null, 1);
    console.log('Withdrew fresh shield from chest');
  }

  chest.close();
}

// Eat food if available
const foodInInv = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple');
if (foodInInv && bot.food < 20) {
  console.log(`Consuming ${foodInInv.name}...`);
  await bot.equip(foodInInv.type, 'hand');
  await bot.consume();
  console.log(`Food: ${bot.food}/20, HP: ${bot.health}/20`);
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

bot.chat(`delta: Overworld Base arrived. Food: ${bot.food}/20, HP: ${bot.health}/20. Gear restored!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  inv: lib.inv()
};
