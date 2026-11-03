// programs/658-tunnel-through-soul-sand-to-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 658: DIG SHORT TUNNEL & STEP INTO PORTAL ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// Dig straight tunnel from x=62 down to x=48 along z=-8 at y=65..66
bot.chat('gamma: Excavating 1x2 breach through soul sand hill to Portal (47, 66, 2)!');

for (let x = 62; x >= 48 && !isCancelled(); x--) {
  const feetPos = new Vec3(x, 65, -8);
  const headPos = new Vec3(x, 66, -8);

  const headBlock = bot.blockAt(headPos);
  if (headBlock && headBlock.boundingBox === 'block') {
    try {
      await bot.lookAt(headPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(headBlock, true);
    } catch (e) {}
  }

  const feetBlock = bot.blockAt(feetPos);
  if (feetBlock && feetBlock.boundingBox === 'block') {
    try {
      await bot.lookAt(feetPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(feetBlock, true);
    } catch (e) {}
  }

  // Step forward
  try {
    await bot.lookAt(new Vec3(x, 65.0, -8.0), true);
    bot.setControlState('forward', true);
    await sleep(250);
    bot.setControlState('forward', false);
  } catch (e) {}
}

console.log('Breached soul sand hill! Pos:', lib.fmt(bot.entity.position));

// Now search portal block
let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
if (!portalBlock) {
  portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 32 });
}

if (portalBlock) {
  console.log(`Stepping into nether_portal at ${lib.fmt(portalBlock.position)}...`);
  try {
    const moves = new Movements(bot, mcData);
    moves.canDig = true;
    bot.pathfinder.setMovements(moves);
    await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.5));
  } catch (pe) {}

  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(2500);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(300);
  }
}

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Arrived in Overworld Base with 22 Blaze Powder! Heading to Base House (293, 72, -55)...');

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

      // Check for food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check for iron boots
      const ib = cItems.find(i => i.name === 'iron_boots');
      if (ib && lib.count('iron_boots') === 0) {
        await chest.withdraw(ib.type, null, 1);
      }

      // Deposit 16 Blaze Powder for team
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count >= 8) {
        await chest.deposit(bpInInv.type, null, Math.min(16, bpInInv.count));
        bot.chat('gamma: Deposited 16 Blaze Powder into Base Chest (293, 72, -57)!');
      }

      // Check if ender_pearls in chest to craft eyes
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
      console.log(`Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Ready to march to Stronghold!`);
    } catch (err) {}
  }

  // Equip best gear
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 658: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
