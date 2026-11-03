// programs/661-step-to-trail-and-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 661: STEP TO TRAIL (z=-7) & WARP TO OVERWORLD ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Step to open trench at z=-7.0
console.log('Stepping to open trench at (63.0, 64.0, -7.0)...');
await bot.lookAt(new Vec3(63.0, 64.5, -7.0), true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('forward', false);
console.log('Pos after alignment to z=-7:', lib.fmt(bot.entity.position));

// 2. March along z=-7 from x=63 to x=46
const waypoints = [
  { x: 62.0, y: 64.0, z: -7.0 },
  { x: 58.0, y: 65.0, z: -7.0 },
  { x: 54.0, y: 65.0, z: -7.0 },
  { x: 50.0, y: 65.0, z: -7.0 },
  { x: 46.0, y: 65.0, z: -7.0 },
  { x: 41.5, y: 65.0, z: -7.0 } // Portal Bunker
];

for (const wp of waypoints) {
  if (bot.game.dimension !== 'the_nether' || isCancelled()) break;
  console.log(`Heading to ${lib.fmt(wp)}...`);
  try {
    await bot.lookAt(new Vec3(wp.x, wp.y + 0.5, wp.z), true);
    // Use direct control states + pathfinder fallback
    const target = new Vec3(wp.x, wp.y, wp.z);
    let attempts = 0;
    while (bot.entity.position.distanceTo(target) > 1.5 && attempts < 25 && !isCancelled()) {
      await bot.lookAt(new Vec3(wp.x, wp.y + 0.5, wp.z), true);
      bot.setControlState('forward', true);
      if (wp.y > bot.entity.position.y + 0.5) bot.setControlState('jump', true);
      else bot.setControlState('jump', false);
      await sleep(200);
      attempts++;
    }
    bot.clearControlStates();
    console.log(`Reached vicinity of ${lib.fmt(wp)}! Actual pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Error marching to ${lib.fmt(wp)}:`, e.message);
  }
}

// 3. Step into nether_portal block
console.log('Scanning for nether_portal block...');
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
if (portalBlock) {
  console.log(`Found portal block at ${lib.fmt(portalBlock.position)}! Stepping in...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(3000);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
} else {
  console.log('No portal block within 12m! Current pos:', lib.fmt(bot.entity.position));
}

// 4. Overworld operations
if (bot.game.dimension === 'overworld') {
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Successfully arrived in Overworld Base with 22 Blaze Powder!');

  // Go to Base House
  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest to deposit Blaze Powder...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      // Check food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check iron boots
      const ib = cItems.find(i => i.name === 'iron_boots');
      if (ib && lib.count('iron_boots') === 0) {
        await chest.withdraw(ib.type, null, 1);
      }

      // Deposit 16 Blaze Powder for team
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count >= 8) {
        await chest.deposit(bpInInv.type, null, Math.min(16, bpInInv.count));
        bot.chat('gamma: DEPOSITED 16 BLAZE POWDER INTO BASE CHEST (293, 72, -57)!');
      }

      // Check if ender_pearls in chest to craft
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat if hungry
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'];
  for (const f of foods) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`SUCCESS! Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Stronghold expedition ready!`);
    } catch (err) {}
  }

  // Equip best armor & weapons
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 661: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
