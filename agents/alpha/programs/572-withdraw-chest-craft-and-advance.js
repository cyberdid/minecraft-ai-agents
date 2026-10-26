// programs/572-withdraw-chest-craft-and-advance.js
console.log('=== Program 572: Withdraw from Chest, Craft & Nether Advance ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Open chest at (293, 72, -57) and withdraw cobblestone & planks
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(it => `${it.name} x${it.count}`));
    
    // Withdraw cobble, planks, tools
    for (const it of items) {
      if (it.name.includes('cobblestone') || it.name.includes('planks') || it.name.includes('sword') || it.name.includes('pickaxe')) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        await chest.withdraw(it.type, null, it.count);
        await sleep(100);
      }
    }
    await chest.close();
  } catch (ce) {
    console.log('Chest error:', ce.message);
  }
}

console.log('Inv after chest withdrawal:', lib.inv());

// 2. Craft sticks, stone pickaxe, and 2 stone swords if needed
if (lib.count('*_planks') > 0 && lib.count('stick') < 4) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

if (lib.count('cobblestone') >= 3 && lib.count('*pickaxe') === 0) {
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('*sword') < 2) {
  try { await lib.craft('stone_sword', 2); } catch (e) {}
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv());
bot.chat(`alpha: Armed with stone tools & ${lib.count('cobblestone')} cobble from chest! Entering Nether portal!`);

// 3. Exit base door at (294, 72, -54)
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(296, 72, -54), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 4. Enter Nether portal at (299, 73, -54)
console.log('Entering Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -54, 1, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 5. Sprint Nether Trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting safe corridor to Spawner Balcony!');
  
  // Strict low-elevation trail to tunnel entrance: stay at y=64..65, z=-7..-8
  const safeNetherTrail = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),  // Tunnel entrance at y=64
    new Vec3(63, 65, -20), // Inside excavated tunnel
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127),
    new Vec3(44, 65, -148),
    new Vec3(44, 65, -163),
    new Vec3(44, 65, -174), // Spawner Bridgehead
    new Vec3(37, 65, -177), // Cross-bridge end
    new Vec3(34, 67, -187)  // Delta's Spawner Balcony deck connection!
  ];
  
  for (let i = 0; i < safeNetherTrail.length; i++) {
    if (isCancelled()) break;
    const wp = safeNetherTrail[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${safeNetherTrail.length}: ${lib.fmt(wp)}...`);
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 10000 });
    } catch (err) {
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      await sleep(1200);
      bot.setControlState('forward', false);
      bot.setControlState('sprint', false);
    }
  }
  
  console.log('Arrived at Spawner Balcony! Pos:', lib.fmt(bot.entity.position));
  try { await lib.pickup(8); } catch (e) {}
  await lib.equipWeapon();
  
  // Slay Blazes
  const hostiles = lib.hostiles(16);
  console.log(`Hostiles near spawner (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));
  
  for (const h of hostiles) {
    if (isCancelled()) break;
    if (h.name === 'blaze' && h.dist < 5.0) {
      console.log(`Striking Blaze at ${lib.fmt(h.pos)}...`);
      try {
        await lib.fight('blaze');
        await lib.pickup(6);
      } catch (fe) {}
    }
  }
  
  const rods = lib.count('blaze_rod');
  console.log('Blaze rods harvested:', rods);
  bot.chat(`alpha: Slaying Blazes on Spawner Balcony ${lib.fmt(bot.entity.position)}! Blaze rods: ${rods}`);
}
