// programs/662-dig-through-and-enter-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 662: DIG THROUGH & ENTER NETHER PORTAL ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

bot.chat('gamma: Digging through soul sand wall at z=-7 directly into Portal Bunker at x=41!');

// Equip pickaxe for fast digging
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Dig straight tunnel from x=58 down to x=42 along z=-7 at y=65..66
for (let x = 58; x >= 42 && !isCancelled(); x--) {
  const headPos = new Vec3(x, 66, -7);
  const feetPos = new Vec3(x, 65, -7);

  const head = bot.blockAt(headPos);
  if (head && head.boundingBox === 'block' && head.name !== 'nether_portal') {
    try {
      await bot.lookAt(headPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(head, true);
    } catch (e) {}
  }

  const feet = bot.blockAt(feetPos);
  if (feet && feet.boundingBox === 'block' && feet.name !== 'nether_portal') {
    try {
      await bot.lookAt(feetPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(feet, true);
    } catch (e) {}
  }

  // Step forward
  await bot.lookAt(new Vec3(x, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(250);
  bot.setControlState('forward', false);

  // Check if we hit the portal
  const curBlock = bot.blockAt(bot.entity.position);
  if (curBlock && curBlock.name === 'nether_portal') {
    console.log('Stepped inside nether_portal block! Position:', lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Tunneling complete. Pos:', lib.fmt(bot.entity.position));

// Find and step into nether_portal block
let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
if (portalBlock) {
  console.log(`Stepping into portal block at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
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
  bot.chat('gamma: Safely in Overworld with 22 Blaze Powder! Sprinting to Base House (293, 72, -55)!');

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
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Stronghold expedition ready!`);
    } catch (err) {}
  }

  // Equip best gear
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 662: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
