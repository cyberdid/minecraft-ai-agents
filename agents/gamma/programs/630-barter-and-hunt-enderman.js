// programs/630-barter-and-hunt-enderman.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 630: PIGLIN BARTERING & ENDERMAN HUNT ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Ensure golden boots are on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Step 1: Scan for Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${piglins.length} Piglin(s) nearby:`);
for (const p of piglins) {
  console.log(`- Piglin at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// Step 2: Barter with closest Piglin
const totalIngots = lib.count('gold_ingot');
console.log(`Gold ingots ready to barter: ${totalIngots}`);

if (piglins.length > 0 && totalIngots > 0) {
  const targetPiglin = piglins[0];
  console.log(`Navigating to Piglin at ${lib.fmt(targetPiglin.position)}...`);
  
  // Approach within 4-5 blocks
  try {
    await lib.goTo(targetPiglin.position.x, targetPiglin.position.y, targetPiglin.position.z, 4.0, { dig: false, timeoutMs: 5000 });
  } catch (e) {}

  bot.chat(`gamma: Bartering ${totalIngots} gold ingots with neutral Piglin at ${lib.fmt(targetPiglin.position)} for Ender Pearls!`);

  for (let r = 0; r < totalIngots && !isCancelled(); r++) {
    const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!ingot) break;

    // Look at Piglin chest/feet
    await bot.lookAt(targetPiglin.position.offset(0, 1.0, 0), true);
    await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
    bot.tossStack(bot.heldItem);
    console.log(`Tossed gold ingot ${r + 1}/${totalIngots}! Waiting 8s for inspection & barter drop...`);
    
    // Wait for Piglin inspection animation
    await sleep(8000);
    
    // Pickup drop
    await lib.pickup(6.0);
    console.log(`Barter round ${r + 1} complete. Inventory:`, lib.inv());
  }
}

// Step 3: Scan for Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${endermen.length} Enderman/Endermen nearby:`);
for (const em of endermen) {
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

if (endermen.length > 0) {
  const targetEnderman = endermen[0];
  console.log(`Targeting Enderman at ${lib.fmt(targetEnderman.position)}!`);

  // Ensure under 2-high ceiling
  // Covered tunnel from (44, 65, -127) to (44, 65, -145) has roof at y=67
  const curPos = bot.entity.position;
  const roof = bot.blockAt(curPos.offset(0, 2, 0));
  console.log('Roof block above player:', roof ? roof.name : 'null');

  // Equip sword
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');

  // Look directly at Enderman eyes (height ~2.8) to aggro
  console.log('Looking at Enderman eyes to draw aggro into 2-high opening...');
  await bot.lookAt(targetEnderman.position.offset(0, 2.7, 0), true);
  bot.chat(`gamma: Drawing Enderman into 2-high covered tunnel for safe melee combat!`);
  await sleep(1500);

  // Melee combat loop (stay stationary under ceiling)
  const combatStart = Date.now();
  let hits = 0;
  while (Date.now() - combatStart < 15000 && targetEnderman.isValid && !isCancelled()) {
    const dist = bot.entity.position.distanceTo(targetEnderman.position);
    if (dist <= 4.2) {
      bot.deactivateItem();
      if (sw) await bot.equip(sw, 'hand');
      bot.attack(targetEnderman);
      hits++;
      await sleep(650);
    } else {
      await bot.lookAt(targetEnderman.position.offset(0, 2.7, 0), true);
      await sleep(250);
    }
  }

  console.log(`Combat finished. Hits dealt: ${hits}`);
  await sleep(1000);
  await lib.pickup(6.0);
}

// Step 4: Final status & inventory report
await lib.pickup(6.0);
const curPearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 630: Ender Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}, Food: ${bot.food} ===`);
bot.chat(`gamma: Milestone 9 status — Ender Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: curPearls,
  inv: lib.inv()
};
