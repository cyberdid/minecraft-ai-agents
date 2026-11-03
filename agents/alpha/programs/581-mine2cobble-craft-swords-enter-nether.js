// programs/581-mine2cobble-craft-swords-enter-nether.js
console.log('=== Program 581: Craft Swords, Enter Nether & Harvest Blaze Rods ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', lib.inv());

// 1. Craft planks and sticks from oak logs
if (lib.count('oak_log') > 0 && lib.count('oak_planks') < 4) {
  console.log('Crafting oak planks...');
  try { await lib.craft('oak_planks', 4); } catch (e) { console.log('Planks note:', e.message); }
}

if (lib.count('stick') < 4 && lib.count('oak_planks') >= 2) {
  console.log('Crafting sticks...');
  try { await lib.craft('stick', 4); } catch (e) { console.log('Sticks note:', e.message); }
}

// 2. Mine 4 cobblestone nearby
console.log('Mining 4 cobblestone...');
try {
  await lib.collect('cobblestone', 4);
} catch (e) {
  console.log('Cobblestone collect note:', e.message);
}

// 3. Craft stone swords
console.log('Crafting stone swords...');
try {
  await lib.craft('stone_sword', 2);
} catch (e) {
  console.log('Stone swords note:', e.message);
}

// Equip shield in offhand and stone sword in main hand
await lib.equipArmor();
await lib.equipWeapon();
console.log('Armed & shielded! Inv:', lib.inv());
bot.chat(`alpha: Armed with shield & stone swords! Heading to Nether portal!`);

// 4. Staged walk straight North to Nether portal at (299.5, 73.0, -54.0)
console.log('Walking to Nether portal...');
const portalApproach = [
  new Vec3(299, 71, -75),
  new Vec3(299, 72, -60),
  new Vec3(299.5, 73.0, -54.0)
];

for (const p of portalApproach) {
  try {
    await lib.goTo(p.x, p.y, p.z, 1, { timeoutMs: 8000 });
  } catch (e) {
    await bot.lookAt(new Vec3(p.x, p.y + 0.5, p.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

// Await Nether dimension change
console.log('Inside portal, awaiting dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 20000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 5. In Nether: Sprint verified safe trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with shield! Sprinting to Spawner Balcony to harvest Blaze Rods!');
  
  // Exit portal bunker towards x=44
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
    new Vec3(34, 67, -187)  // Spawner Balcony connection!
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
  
  // 6. Farm Blazes with Shield Cover
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  
  while (Date.now() - combatStart < 60000 && !isCancelled() && bot.health > 6) {
    await lib.equipWeapon();
    await lib.equipArmor();
    
    const blazes = Object.values(bot.entities).filter(e => 
      e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 5.0
    );
    
    if (blazes.length > 0) {
      blazes.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
      const target = blazes[0];
      console.log(`Striking Blaze at ${lib.fmt(target.position)}...`);
      await bot.lookAt(target.position.offset(0, 1.0, 0), true);
      bot.attack(target);
      await sleep(400);
      if (target.isValid) {
        bot.attack(target);
        await sleep(400);
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
      console.log(`TARGET REACHED: ${currentRods} Blaze Rods!`);
      bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
      break;
    }
    
    await sleep(400);
  }
  
  const finalRods = lib.count('blaze_rod');
  console.log('=== Final Status ===');
  console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  console.log('Blaze rods harvested:', finalRods);
  console.log('Inventory:', lib.inv());
  bot.chat(`alpha: Spawner engagement complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
}
