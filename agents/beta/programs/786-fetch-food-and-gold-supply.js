// programs/786-fetch-food-and-gold-supply.js
console.log('=== Program 786: Fetch Food Supply & Return to Team ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: In the_nether, march South along verified safe waypoints to Nether portal (46, 66, 2)
if (bot.game.dimension === 'the_nether') {
  bot.chat('Beta: Stepping back to base to gather food & steaks for team HP regen! Be right back!');

  const returnWps = [
    new Vec3(50, 65, -115),
    new Vec3(61, 66, -100),
    new Vec3(62, 67, -80),
    new Vec3(61.5, 67, -65),
    new Vec3(62, 67, -50),
    new Vec3(63, 66, -35),
    new Vec3(63, 65, -20),
    new Vec3(63, 64, -7),
    new Vec3(54, 65, -7),
    new Vec3(46, 65, -7),
    new Vec3(46.5, 66.0, 2.0)
  ];

  configureFireAvoidance();
  bot.activateItem(true); // Raise shield

  for (let i = 0; i < returnWps.length && !isCancelled(); i++) {
    const wp = returnWps[i];
    if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
      } catch (e2) {}
    }
  }

  // Step directly into portal block at (46.5, 66.0, 2.0)
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 10
  });

  if (portals.length > 0) {
    portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
    const targetPortal = portals[0];
    const pCenter = targetPortal.offset(0.5, 0.2, 0.5);

    await bot.lookAt(pCenter, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
    await sleep(600);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);

    console.log('Standing in portal block, waiting for warp...');
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
  console.log('Warp not completed; current pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health };
}

console.log('SUCCESS: Warped to Overworld Base! Pos:', lib.fmt(bot.entity.position));

// Step 2: Step into base room
try {
  await lib.goTo(294, 72, -56, 1.0, { timeoutMs: 5000 });
} catch (e) {}

// Step 3: Sleep if night
if (lib.time().canSleep) {
  console.log('Sleeping in base bed...');
  try {
    await lib.sleepInBed();
    await sleep(3000);
  } catch (e) {}
}

// Step 4: Hunt cows/sheep for food
console.log('Hunting animals for food supply...');
try {
  await lib.hunt('cow', 3);
} catch (e) {
  try { await lib.hunt('sheep', 3); } catch (e2) {}
}

// Smelt raw meat in furnace
if (lib.count('raw_beef') > 0) {
  console.log('Smelting raw beef in furnace...');
  try { await lib.smelt('raw_beef', '*_planks', lib.count('raw_beef')); } catch (e) {}
} else if (lib.count('raw_mutton') > 0) {
  console.log('Smelting raw mutton in furnace...');
  try { await lib.smelt('raw_mutton', '*_planks', lib.count('raw_mutton')); } catch (e) {}
}

// Eat to 20/20 food
try {
  await lib.eat();
  console.log('Ate food! Hunger now:', bot.food);
} catch (e) {}

// Wait for natural healing
if (bot.food >= 18 && bot.health < 20) {
  console.log(`Healing (HP: ${bot.health})...`);
  const healStart = Date.now();
  while (bot.health < 19 && Date.now() - healStart < 12000 && !isCancelled()) {
    await sleep(500);
  }
  console.log('HP after heal:', bot.health);
}

// Step 5: Deposit half the cooked food into Base Chest for teammates
const totalCooked = lib.count('cooked_beef') + lib.count('cooked_mutton');
console.log(`Total cooked food secured: ${totalCooked}`);

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && totalCooked > 4) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cb = bot.inventory.items().find(i => i.name === 'cooked_beef' || i.name === 'cooked_mutton');
    if (cb && cb.count > 4) {
      await chest.deposit(cb.type, null, Math.floor(cb.count / 2));
      console.log(`Deposited ${Math.floor(cb.count / 2)} cooked meat in Base Chest!`);
    }
    await chest.close();
  } catch (e) {}
}

// Verify golden_boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Program 786 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Cooked food in inv for Gamma:', lib.count('cooked_beef') + lib.count('cooked_mutton'));
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  cooked_food: lib.count('cooked_beef') + lib.count('cooked_mutton'),
  gold_ingots: lib.count('gold_ingot')
};
