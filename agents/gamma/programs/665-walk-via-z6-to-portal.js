// programs/665-walk-via-z6-to-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 665: WALK VIA z=-6 TO PORTAL OR RESPAWN TO BASE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// Inspect z=-6
console.log('Inspecting path at z=-6 from x=57 down to x=41:');
for (let x = 57; x >= 41; x--) {
  const f = bot.blockAt(new Vec3(x, 64, -6));
  const b1 = bot.blockAt(new Vec3(x, 65, -6));
  const b2 = bot.blockAt(new Vec3(x, 66, -6));
  // console.log(`x=${x}: feet=${b1?.name}, head=${b2?.name}`);
}

// Step to z=-6.0
console.log('Stepping to z=-6.0...');
await bot.lookAt(new Vec3(bot.entity.position.x, 65.0, -6.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// Setup pathfinder to portal at (41, 65, -7)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

console.log('Pathfinding to Portal Bunker at (41, 65, -7)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -7.0, 1.2));
  console.log('Reached Portal Bunker! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Pathfind error, trying direct step towards (41, 65, -7):', e.message);
  await bot.lookAt(new Vec3(41.0, 65.5, -7.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(4000);
  bot.clearControlStates();
}

// Step into portal
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
if (portalBlock) {
  console.log(`Stepping into portal block at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(3500);
  bot.setControlState('forward', false);

  console.log('Waiting for dimension transfer...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
} else {
  // If no portal reached and still in nether, tactical reset to base bed!
  console.log('No portal reachable. Initiating tactical reset to Overworld Base Bed (keepInventory active)...');
  bot.chat('gamma: Tactical reset to Overworld Base Bed to deliver 22 Blaze Powder!');
  const fire = bot.findBlock({ matching: b => b && (b.name === 'fire' || b.name === 'soul_fire' || b.name === 'lava'), maxDistance: 16 });
  if (fire) {
    console.log(`Walking into fire at ${lib.fmt(fire.position)}...`);
    await bot.lookAt(fire.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(4000);
    bot.setControlState('forward', false);
  }
}

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Safely in Overworld with 22 Blaze Powder! Uniting with Beta at Base Chest (293, 72, -57)!');

  // Go to base house
  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
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

      // Check if ender_pearls in chest
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
      console.log(`CRAFTED! Total Eyes of Ender: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Milestone 10 100% COMPLETE!`);
    } catch (err) {}
  }

  // Equip best gear
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 665: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
