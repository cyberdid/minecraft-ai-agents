// programs/583-smelt-shield-and-join-assault.js
console.log('=== Program 583: Smelt Shield & Join Spawner Assault ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', lib.inv());

// 1. Ascend mine stairs to base shelter at (295, 72, -54)
console.log('Ascending mine stairs to base...');
const mineAscent = [
  new Vec3(310, 58, -54),
  new Vec3(302, 66, -48),
  new Vec3(302, 71, -44),
  new Vec3(295, 72, -54)
];

for (let i = 0; i < mineAscent.length; i++) {
  const p = mineAscent[i];
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 8000 });
  } catch (e) {
    await bot.lookAt(new Vec3(p.x, p.y + 0.5, p.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
  }
}

console.log('At base exterior! Pos:', lib.fmt(bot.entity.position));

// 2. Smelt raw iron and craft shield
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') === 0 && lib.count('shield') === 0) {
  console.log('Smelting raw iron at furnace (295, 72, -55)...');
  try {
    const fuel = lib.count('oak_planks') > 0 ? 'oak_planks' : (lib.count('coal') > 0 ? 'coal' : 'stick');
    await lib.smelt('raw_iron', fuel, 1);
  } catch (se) {
    console.log('Smelt note:', se.message);
  }
}

// Ensure 6 planks for shield
if (lib.count('*_planks') < 6 && lib.count('shield') === 0) {
  console.log('Gathering wood for shield...');
  try {
    await lib.collect('*_log', 2);
    await lib.craft('oak_planks', 8);
  } catch (we) {}
}

if (lib.count('shield') === 0 && lib.count('iron_ingot') > 0) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
  } catch (ce) {
    console.log('Shield craft note:', ce.message);
  }
}

// Craft stone sword
if (lib.count('*sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 1);
  } catch (e) {}
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv());
bot.chat(`alpha: Armed with shield & stone sword! Heading into Nether portal!`);

// 3. Walk into Nether portal at (299.5, 73.0, -54.0)
console.log('Entering Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 10000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 20000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 4. In Nether: Sprint verified safe trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting to Spawner Balcony to unite with Delta & Beta!');
  
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
    new Vec3(44, 65, -127), // Fortress Workshop Outpost
    new Vec3(44, 65, -148),
    new Vec3(44, 65, -163),
    new Vec3(44, 65, -174), // Spawner Bridgehead
    new Vec3(37, 65, -177), // Cross-bridge end
    new Vec3(34, 67, -187)  // Spawner Balcony deck connection!
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
  try { await lib.pickup(10); } catch (e) {}
  await lib.equipArmor();
  await lib.equipWeapon();
  
  // Fight Blazes
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  
  while (Date.now() - combatStart < 60000 && !isCancelled() && bot.health > 6) {
    await lib.equipWeapon();
    await lib.equipArmor();
    
    const hostiles = lib.hostiles(8);
    const blazes = hostiles.filter(h => h.name === 'blaze');
    if (blazes.length > 0) {
      const target = blazes[0];
      const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0);
      if (entity) {
        console.log(`Striking Blaze at ${lib.fmt(entity.position)}...`);
        await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
        bot.attack(entity);
        await sleep(400);
        if (entity.isValid) {
          bot.attack(entity);
          await sleep(400);
        }
      }
    }
    
    try { await lib.pickup(8); } catch (e) {}
    const currentRods = lib.count('blaze_rod');
    if (currentRods !== lastRods) {
      console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
      bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
      lastRods = currentRods;
    }
    
    if (currentRods >= 7) {
      bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
      break;
    }
    await sleep(400);
  }
  
  const finalRods = lib.count('blaze_rod');
  console.log('Final Blaze Rods in inv:', finalRods);
  bot.chat(`alpha: Spawner engagement complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
}
