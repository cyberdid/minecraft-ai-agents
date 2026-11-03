// programs/765-retreat-eat-and-regear.js
console.log('=== Program 765: Retreat to Base, Secure Food, Heal & Re-enter Nether ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// Step 1: In Nether, safely navigate to Nether Portal bunker at (40, 65, -7)
if (bot.game.dimension === 'the_nether') {
  console.log('Navigating to Nether Portal bunker at (40, 65, -7)...');
  if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(40.0, 65.0, -7.0, 2.0));
  } catch (e) {
    console.log('Goto portal bunker note:', e.message);
  }

  // Find portal blocks
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 12,
    count: 10
  });
  console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

  if (portals.length > 0) {
    portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
    const targetPortal = portals[0];
    console.log('Entering portal block at:', lib.fmt(targetPortal));

    const pCenter = targetPortal.offset(0.5, 0.2, 0.5);
    await bot.lookAt(pCenter, true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);

    console.log('Waiting for warp to Overworld base...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      const cur = bot.entity.position;
      if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4) {
        await bot.lookAt(pCenter, true);
        bot.setControlState('forward', true);
        await sleep(150);
        bot.setControlState('forward', false);
      }
      await sleep(250);
    }
  }
}

if (bot.game.dimension !== 'overworld') {
  console.log('Still in Nether at:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  return { dimension: bot.game.dimension, hp: bot.health, pos: bot.entity.position };
}

console.log('Arrived in Overworld base! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Step 2: Step out of portal into base room
try {
  await lib.goTo(294, 72, -56, 1.0, { timeoutMs: 5000 });
} catch (e) {}

// If night or thunderstorm, sleep in bed to skip night
if (lib.time().canSleep) {
  console.log('Night detected in Overworld, sleeping in bed...');
  try {
    await lib.sleepInBed();
    await sleep(4000);
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// Step 3: Check base chest for food or raw food to smelt
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    for (const item of chest.containerItems()) {
      if (['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'baked_potato'].includes(item.name)) {
        await chest.withdraw(item.type, null, item.count);
      }
    }
    // Deposit spare netherrack
    const nr = bot.inventory.items().find(i => i.name === 'netherrack');
    if (nr && nr.count > 16) await chest.deposit(nr.type, null, nr.count - 16);
    await chest.close();
  } catch (e) {}
}

// Step 4: If no cooked food, hunt cows/sheep near base
const foodCount = lib.count('cooked_beef') + lib.count('cooked_porkchop') + lib.count('cooked_mutton') + lib.count('bread') + lib.count('apple');
console.log('Cooked food in inventory:', foodCount);

if (foodCount === 0 && bot.food < 18) {
  console.log('No food in inventory. Hunting 2 animals near base...');
  try {
    await lib.hunt('cow', 2);
  } catch (e) {
    try { await lib.hunt('sheep', 2); } catch (e2) {}
  }

  // Smelt raw meat in furnace
  if (lib.count('raw_beef') > 0) {
    console.log('Smelting raw_beef in furnace...');
    try { await lib.smelt('raw_beef', '*_planks', lib.count('raw_beef')); } catch (e) {}
  } else if (lib.count('raw_mutton') > 0) {
    console.log('Smelting raw_mutton in furnace...');
    try { await lib.smelt('raw_mutton', '*_planks', lib.count('raw_mutton')); } catch (e) {}
  }
}

// Step 5: Eat to heal
try {
  await lib.eat();
  console.log('Ate food! Food level now:', bot.food);
} catch (e) {
  console.log('Eat note:', e.message);
}

// Step 6: Wait briefly for natural health regeneration if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log(`Regenerating health (current HP: ${bot.health})...`);
  const healStart = Date.now();
  while (bot.health < 18 && Date.now() - healStart < 12000 && !isCancelled()) {
    await sleep(500);
  }
  console.log('HP after regen:', bot.health);
}

// Step 7: Collect 16 cobblestone and craft stone pickaxes
if (lib.count('cobblestone') < 16) {
  console.log('Collecting cobblestone for building and tools...');
  try {
    await lib.collect('stone', 16 - lib.count('cobblestone'));
  } catch (e) {}
}

if (lib.count('stone_pickaxe') < 2 && lib.count('cobblestone') >= 3) {
  try { await lib.craft('stone_pickaxe', 2); } catch (e) {}
}

// Ensure golden_boots remain equipped!
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Base Regear Finished ===');
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Pickaxes:', lib.count('*_pickaxe'), 'Cobblestone:', lib.count('cobblestone'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  pickaxes: lib.count('*_pickaxe'),
  cobblestone: lib.count('cobblestone'),
  gold_nuggets: lib.count('gold_nugget')
};
