// programs/781-lock-spawn-regear-and-warp.js
console.log('=== Program 781: Lock Bed Spawn, Regear & Enter Nether ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Step inside Base House
console.log('Entering Base house via door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Successfully passed through door into Base House!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(294, 72, -55, 1.0, { timeoutMs: 5000 });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Step 2: Lock spawn point at Base Bed
console.log('Setting bed spawn point with lib.setSpawn()...');
try {
  const spawnRes = await lib.setSpawn();
  console.log('Spawn result:', spawnRes);
  bot.chat('Beta: Spawn point permanently locked at Base Bed (294, 72, -55)!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// Step 3: Check base chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));

    // Withdraw any gold ingots or nuggets
    const cIngot = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (cIngot) {
      await chest.withdraw(cIngot.type, null, cIngot.count);
      console.log(`Withdrew ${cIngot.count} gold_ingot!`);
    }
    const cNugget = chest.containerItems().find(i => i.name === 'gold_nugget');
    if (cNugget) {
      await chest.withdraw(cNugget.type, null, cNugget.count);
      console.log(`Withdrew ${cNugget.count} gold_nugget!`);
    }

    // Deposit junk (soul_sand, soul_soil, excess netherrack)
    const ss = bot.inventory.items().find(i => i.name === 'soul_sand');
    if (ss) await chest.deposit(ss.type, null, ss.count);
    const ssoil = bot.inventory.items().find(i => i.name === 'soul_soil');
    if (ssoil) await chest.deposit(ssoil.type, null, ssoil.count);
    const nr = bot.inventory.items().find(i => i.name === 'netherrack');
    if (nr && nr.count > 16) await chest.deposit(nr.type, null, nr.count - 16);

    await chest.close();
  } catch (e) {
    console.log('Chest note:', e.message);
  }
}

// Ensure golden_boots equipped in feet slot!
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet slot:', bot.inventory.slots[8]?.name);

// Equip shield in offhand
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// Equip best weapon (iron_sword)
try { await lib.equipWeapon(); } catch (e) {}

// Step 4: Exit house and enter Nether Portal
console.log('Exiting house through door to portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.door(294, 72, -54, true); await lib.goTo(296, 72, -53, 1.5); } catch (e2) {}
}

console.log('Stepping into Nether Portal at (299, 73, -54)...');
try {
  await lib.goTo(298.5, 73.0, -53.5, 1.0, { timeoutMs: 5000 });
} catch (e) {}

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
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

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4 || cur.y < targetPortal.y - 0.2) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      if (cur.y < targetPortal.y) bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension === 'the_nether') {
  console.log('SUCCESS: Beta in the_nether at:', lib.fmt(bot.entity.position));
  bot.activateItem(true); // Raise shield immediately
  configureFireAvoidance();
  bot.chat(`Beta: In Nether! Spawn locked at Base Bed! Wearing golden_boots, armed with iron sword! Joining team!`);
}

console.log('=== Program 781 Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet:', bot.inventory.slots[8]?.name);
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots_worn: bot.inventory.slots[8]?.name === 'golden_boots',
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget')
};
