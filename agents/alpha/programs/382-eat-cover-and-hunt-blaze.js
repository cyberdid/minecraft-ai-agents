// programs/382-eat-cover-and-hunt-blaze.js
console.log('=== Program 382: Eat, Take Cover, & Defeat Blaze ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Immediately eat cooked_beef to restore food to 20
if (lib.count('cooked_beef') > 0) {
  console.log('Eating cooked_beef to trigger health regen...');
  try {
    await globalThis.safeEat('cooked_beef');
  } catch (e) {
    try { await lib.eat(); } catch (e2) {}
  }
}
console.log(`Food after eating: ${bot.food}/20, Health: ${bot.health}/20`);

// 2. Place cobblestone safety barrier at z=-120 if open to protect against fireballs
const barrierPos = new Vec3(45, 65, -120);
const barrierBlock = bot.blockAt(barrierPos);
if (barrierBlock && barrierBlock.name === 'air' && lib.count('cobblestone') > 2) {
  console.log('Placing tactical cobblestone barrier at (45, 65, -120)...');
  try {
    await lib.place('cobblestone', 45, 65, -120);
    await lib.place('cobblestone', 45, 66, -120);
  } catch (e) {
    console.log('Barrier note:', e.message);
  }
}

// 3. Wait behind cover for health to regenerate towards 20
console.log('Regenerating health behind cover...');
for (let i = 0; i < 12 && bot.health < 18; i++) {
  if (isCancelled()) break;
  await sleep(1500);
  console.log(`Regen tick ${i}: Health=${bot.health}/20, Food=${bot.food}/20`);
}

// 4. Locate Blaze near (45, 64, -139)
const blazes = Object.values(bot.entities).filter(e => 
  e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 32
);
console.log(`Blazes detected: ${blazes.length}`);

// 5. Engage Blaze with iron_sword + shield
if (blazes.length > 0) {
  const blaze = blazes[0];
  console.log(`Approaching Blaze at ${lib.fmt(blaze.position)} (dist: ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m)...`);
  
  // Equip best iron sword and armor
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sword) await bot.equip(sword, 'hand');
  await lib.equipArmor();

  try {
    await lib.goTo(blaze.position.x, blaze.position.y, blaze.position.z, 2, { timeoutMs: 15000 });
    
    // Attack sequence
    for (let strike = 0; strike < 5; strike++) {
      if (!bot.entities[blaze.id]) break;
      await bot.lookAt(blaze.position.offset(0, 0.9, 0), true);
      await bot.attack(blaze);
      await sleep(650);
    }
    
    // Pick up Blaze Rod drop!
    await sleep(500);
    await lib.pickup(6);
    console.log(`Combat complete! Blaze rods in inventory: ${lib.count('blaze_rod')}`);
    if (lib.count('blaze_rod') > 0) {
      bot.chat(`team: BLAZE ROD ACQUIRED! Alpha inventory has ${lib.count('blaze_rod')} blaze_rod!`);
    }
  } catch (err) {
    console.log('Blaze combat note:', err.message);
  }
}

// 6. Check for spawner block at Blaze position (45, 64, -139)
const spawners = bot.findBlocks({
  matching: mcData.blocksByName.spawner?.id,
  maxDistance: 32,
  count: 5
});
console.log(`Spawners in area: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`  >>> BLAZE SPAWNER AT: ${lib.fmt(sp)} <<<`);
  bot.chat(`team: BLAZE SPAWNER VERIFIED AT ${lib.fmt(sp)}!`);
}

bot.chat(`team: Alpha status at Fortress (${lib.fmt(bot.entity.position)}): HP=${bot.health}/20, Blaze rods=${lib.count('blaze_rod')}.`);

console.log('Alpha status:', JSON.stringify(lib.status()));
