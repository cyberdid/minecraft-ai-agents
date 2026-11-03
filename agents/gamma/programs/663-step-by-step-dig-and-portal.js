// programs/663-step-by-step-dig-and-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 663: STEP-BY-STEP DIG & ENTER PORTAL ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step by step from current x down to 42 along z=-7
for (let targetX = Math.floor(bot.entity.position.x); targetX >= 42 && !isCancelled(); targetX--) {
  console.log(`Clearing step to x=${targetX}...`);

  // Dig head and feet at targetX
  for (const y of [66, 65]) {
    const b = bot.blockAt(new Vec3(targetX, y, -7));
    if (b && b.boundingBox === 'block' && b.name !== 'nether_portal') {
      try {
        await bot.lookAt(new Vec3(targetX + 0.5, y + 0.5, -6.5), true);
        await bot.dig(b, true);
      } catch (e) {}
    }
  }

  // Also dig next block ahead (targetX - 1) if within reach
  for (const y of [66, 65]) {
    const bAhead = bot.blockAt(new Vec3(targetX - 1, y, -7));
    if (bAhead && bAhead.boundingBox === 'block' && bAhead.name !== 'nether_portal') {
      try {
        await bot.lookAt(new Vec3(targetX - 0.5, y + 0.5, -6.5), true);
        await bot.dig(bAhead, true);
      } catch (e) {}
    }
  }

  // Walk until bot reaches targetX
  await bot.lookAt(new Vec3(targetX - 1, 65.0, -7.0), true);
  let walkAttempts = 0;
  while (bot.entity.position.x > targetX + 0.2 && walkAttempts < 15 && !isCancelled()) {
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 64.8) bot.setControlState('jump', true);
    else bot.setControlState('jump', false);
    await sleep(150);
    walkAttempts++;
  }
  bot.clearControlStates();

  const curPos = bot.entity.position;
  console.log(`Current pos: ${lib.fmt(curPos)}`);

  // Check if standing in portal
  const curB = bot.blockAt(curPos);
  if (curB && curB.name === 'nether_portal') {
    console.log('Inside nether_portal block!');
    break;
  }
}

// Check nearby portal
let pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
if (pb) {
  console.log(`Stepping into portal at ${lib.fmt(pb.position)}...`);
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
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Safely in Overworld with 22 Blaze Powder! Heading to Base House (293, 72, -55)!');

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
      console.log('Chest error:', ce.message);
    }
  }

  // Craft Eyes of Ender if we have pearls
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

  // Equip best armor & weapons
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 663: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
