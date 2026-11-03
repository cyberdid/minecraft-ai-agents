console.log('=== DELTA: BASE RESTOCK & SLEEP PROTOCOL ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Time: ${bot.time.timeOfDay}, night in ~${Math.round((12542 - (bot.time.timeOfDay % 24000)) / 20)}s`);

// 1. Ensure inside base
try {
  await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 0.8));
} catch (e) {}

// 2. Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  console.log('Opening Base Chest (293, 72, -57)...');
  const chest = await bot.openContainer(chestBlock);
  const items = chest.containerItems();
  console.log('--- Chest Contents ---');
  for (const it of items) {
    console.log(`  ${it.name} x${it.count}`);
  }

  // Confirm Blaze Powder
  const bp = items.find(i => i.name === 'blaze_powder');
  console.log(`Blaze Powder in chest: ${bp ? bp.count : 0}`);

  // Confirm Ender Pearls
  const ep = items.find(i => i.name === 'ender_pearl');
  console.log(`Ender Pearls in chest: ${ep ? ep.count : 0}`);

  // Deposit clutter from Delta inventory
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

  // Deposit extra stone weapons / tools
  const stoneSwords = bot.inventory.items().filter(i => i.name === 'stone_sword');
  for (let s = 1; s < stoneSwords.length; s++) {
    try {
      await chest.deposit(stoneSwords[s].type, null, 1);
    } catch (e) {}
  }

  // Withdraw food
  const food = items.find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name.includes('beef') || i.name.includes('porkchop'));
  if (food) {
    const qty = Math.min(food.count, 16);
    await chest.withdraw(food.type, null, qty);
    console.log(`Withdrew ${food.name} x${qty}`);
  }

  // Withdraw shield if chest has a spare
  const shield = items.find(i => i.name === 'shield');
  if (shield) {
    await chest.withdraw(shield.type, null, 1);
    console.log('Withdrew spare shield');
  }

  // Check if chest has gold ingots
  const gold = items.find(i => i.name === 'gold_ingot');
  if (gold) {
    console.log(`Gold ingots in chest: ${gold.count}`);
  }

  chest.close();
}

// 3. Eat food if hunger < 20
const invFood = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name.includes('beef') || i.name.includes('porkchop'));
if (invFood && bot.food < 20) {
  console.log(`Eating ${invFood.name}...`);
  await bot.equip(invFood.type, 'hand');
  await bot.consume();
  if (bot.food < 18) {
    await bot.consume();
  }
  console.log(`Food now: ${bot.food}/20, HP: ${bot.health}/20`);
}

// 4. Equip best gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 5. Sleep protocol if night
console.log('Checking night for sleep...');
const curTime = bot.time.timeOfDay % 24000;
console.log(`Current timeOfDay: ${curTime} (sleep window is 12542 - 23460)`);

if (curTime < 12542 && curTime > 11500) {
  const waitMs = (12542 - curTime) * 50 + 500;
  console.log(`Waiting ${Math.round(waitMs / 1000)}s for sleep tick 12542...`);
  await sleep(Math.min(waitMs, 15000));
}

// Find bed
const bedBlock = bot.findBlock({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 6
});

if (bedBlock) {
  console.log(`Found bed at ${lib.fmt(bedBlock.position)}`);
  const now = bot.time.timeOfDay % 24000;
  if (now >= 12541 && now <= 23460) {
    console.log('Attempting to sleep in bed...');
    try {
      await bot.sleep(bedBlock);
      console.log('Sleeping in bed! Waiting for morning...');
      await sleep(5000);
      bot.chat('delta: Slept peacefully in base bed. Morning arrived!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  } else {
    console.log(`Not sleep time yet (${now} < 12542). Safe inside base.`);
  }
}

bot.chat(`delta: Base operations update — Food: ${bot.food}/20, HP: ${bot.health}/20, Pearls: ${lib.count('ender_pearl')}/12, Gold: ${lib.count('gold_ingot')}.`);

return {
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  timeOfDay: bot.time.timeOfDay,
  inv: lib.inv()
};
