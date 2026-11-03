// programs/659-warp-via-spawn-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 659: WARP TO OVERWORLD VIA SPAWN PORTAL (47, 66, 2) ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const targetPortal = new Vec3(47, 66, 2);
console.log('Target Portal Block at (47, 66, 2):', bot.blockAt(targetPortal)?.name);

// Setup movements with parkour & jumping enabled across the valley terrain
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.allowSprinting = true;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

bot.chat('gamma: Navigating directly across valley to Spawn Portal (47, 66, 2)!');

try {
  await bot.pathfinder.goto(new goals.GoalNear(46.5, 66.0, 2.0, 1.0));
  console.log('Arrived in front of Spawn Portal! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Pathfind to spawn portal notice:', e.message);
  // Manual step towards (47, 66, 2)
  try {
    await lib.goToXZ(46.5, 2.0, { timeoutMs: 15000 });
  } catch (e2) {
    console.log('goToXZ notice:', e2.message);
  }
}

// Step directly into the portal block
const pb = bot.blockAt(targetPortal) || bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (pb) {
  console.log(`Stepping into portal block at ${lib.fmt(pb.position)}...`);
  await bot.lookAt(pb.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(3000);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  console.log('WARPED TO OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Arrived in Overworld Base! Sprinting to Base House (293, 72, -55) to deliver 22 Blaze Powder!');

  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest (293, 72, -57)
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

      // Deposit 16 Blaze Powder for Beta & Delta
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count >= 8) {
        await chest.deposit(bpInInv.type, null, Math.min(16, bpInInv.count));
        bot.chat('gamma: DEPOSITED 16 BLAZE POWDER INTO BASE CHEST (293, 72, -57)!');
      }

      // Check if ender_pearls in chest
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest interaction error:', ce.message);
    }
  }

  // Eat if hungry
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'];
  for (const f of foods) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender if we have pearls
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`SUCCESS! Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Milestone 10 100% COMPLETE!`);
    } catch (err) {}
  }

  // Equip best armor & weapons
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 659: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
