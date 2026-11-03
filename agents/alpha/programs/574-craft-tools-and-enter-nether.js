// programs/574-craft-tools-and-enter-nether.js
console.log('=== Program 574: Craft Tools & Enter Nether Spawner Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

// 1. Craft birch planks and sticks
if (lib.count('birch_log') > 0) {
  console.log('Crafting birch planks...');
  try { await lib.craft('birch_planks', 8); } catch (e) { console.log('Planks note:', e.message); }
}

if (lib.count('stick') < 4 && lib.count('birch_planks') >= 2) {
  console.log('Crafting sticks...');
  try { await lib.craft('stick', 4); } catch (e) { console.log('Sticks note:', e.message); }
}

// 2. Craft wooden pickaxe using base crafting table at (291, 72, -60)
console.log('Crafting wooden pickaxe...');
try {
  await lib.craft('wooden_pickaxe', 1);
} catch (e) {
  console.log('Wooden pickaxe note:', e.message);
}

// 3. Mine 3 cobblestone and craft stone pickaxe
console.log('Mining 3 cobblestone for stone pickaxe...');
try {
  await lib.collect('cobblestone', 3);
  await lib.craft('stone_pickaxe', 1);
} catch (e) {
  console.log('Stone pickaxe note:', e.message);
}

// 4. Mine 24 cobblestone and craft 2 stone swords
console.log('Mining 24 cobblestone and crafting stone swords...');
try {
  await lib.collect('cobblestone', 24);
  if (lib.count('stick') < 2 && lib.count('birch_planks') >= 2) {
    await lib.craft('stick', 4);
  }
  await lib.craft('stone_sword', 2);
} catch (e) {
  console.log('Stone swords/cobble note:', e.message);
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv());
bot.chat(`alpha: Armed with stone tools & ${lib.count('cobblestone')} cobble! Entering Nether portal!`);

// 5. Walk directly into Nether portal block at (299.5, 73.0, -54.0)
console.log('Walking into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(2500);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
}

// 6. Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 20000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 7. Sprint Nether Trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting safe corridor to Spawner Balcony!');
  
  // Step out of Nether portal bunker
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  
  const safeTrail = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),  // Excavated tunnel entrance at y=64
    new Vec3(63, 65, -20), // Inside tunnel
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
    new Vec3(34, 67, -187)  // Delta's Spawner Balcony connection!
  ];
  
  for (let i = 0; i < safeTrail.length; i++) {
    if (isCancelled()) break;
    const wp = safeTrail[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${safeTrail.length}: ${lib.fmt(wp)}...`);
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
  
  // Fight Blazes
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
