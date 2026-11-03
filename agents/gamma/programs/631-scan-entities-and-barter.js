// programs/631-scan-entities-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 631: ENTITY SCAN & SAFE BARTER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Scan all entities within 32m
const allEntities = Object.values(bot.entities).filter(e => e.isValid && e !== bot.entity);
console.log(`Total entities in tracking range: ${allEntities.length}`);

const players = allEntities.filter(e => e.type === 'player');
for (const p of players) {
  console.log(`Player: ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

const piglins = allEntities.filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 32)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
console.log(`Piglins (${piglins.length}):`);
for (const p of piglins) {
  console.log(`- Piglin at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

const endermen = allEntities.filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 32)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
console.log(`Endermen (${endermen.length}):`);
for (const em of endermen) {
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

const itemsOnGround = allEntities.filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Ground items (${itemsOnGround.length}):`);
for (const it of itemsOnGround) {
  console.log(`- Item at ${lib.fmt(it.position)}, dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 3. If ground items exist nearby, pick them up first
if (itemsOnGround.length > 0) {
  await lib.pickup(8.0);
}

// 4. Barter with nearest Piglin
let ingots = lib.count('gold_ingot');
console.log(`Initial Gold Ingots: ${ingots}, Ender Pearls: ${lib.count('ender_pearl')}`);

if (piglins.length > 0 && ingots > 0) {
  const targetPiglin = piglins[0];
  console.log(`Targeting Piglin at ${lib.fmt(targetPiglin.position)} for bartering...`);

  // Move closer if > 5m away, but stay in safe covered corridor
  const dist = bot.entity.position.distanceTo(targetPiglin.position);
  if (dist > 5.0) {
    try {
      await lib.goTo(targetPiglin.position.x, bot.entity.position.y, targetPiglin.position.z, 3.5, { dig: false, timeoutMs: 4000 });
    } catch (e) {}
  }

  bot.chat(`gamma: Starting Piglin barter round with ${ingots} gold ingots!`);

  for (let round = 1; round <= ingots && !isCancelled(); round++) {
    const curIngot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!curIngot) {
      console.log('No more gold ingots in inventory.');
      break;
    }

    // Look at target Piglin
    await bot.lookAt(targetPiglin.position.offset(0, 0.5, 0), true);
    console.log(`[Round ${round}] Tossing 1 gold ingot towards Piglin at ${lib.fmt(targetPiglin.position)}...`);
    
    // Toss exactly 1 gold ingot
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
    
    // Wait for piglin to pick up, inspect (6 seconds), and toss barter drop
    console.log(`Waiting 8.5s for Piglin inspection...`);
    await sleep(8500);

    // Vacuum drop
    await lib.pickup(6.0);
    console.log(`After round ${round}: pearls=${lib.count('ender_pearl')}, ingots=${lib.count('gold_ingot')}`);
  }
} else if (piglins.length === 0) {
  console.log('No Piglins within 32m. Checking tunnel towards (44, 65, -145)...');
}

// 5. Check if Enderman is nearby and can be hunted safely
if (endermen.length > 0) {
  const em = endermen[0];
  const emDist = bot.entity.position.distanceTo(em.position);
  console.log(`Nearest Enderman at ${lib.fmt(em.position)}, dist: ${emDist.toFixed(1)}m`);
  
  // Verify ceiling above Gamma is <= 2 blocks (y+2 has block)
  const headBlock = bot.blockAt(bot.entity.position.offset(0, 2, 0));
  const isCovered = headBlock && headBlock.boundingBox === 'block';
  console.log(`Is Gamma under 2-high ceiling? ${isCovered} (block: ${headBlock ? headBlock.name : 'none'})`);

  if (isCovered && emDist <= 24) {
    console.log('Gamma is under safe 2-high ceiling! Drawing Enderman aggro with gaze...');
    const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
    if (sw) await bot.equip(sw, 'hand');
    
    await bot.lookAt(em.position.offset(0, 2.7, 0), true);
    bot.chat('gamma: Sighting Enderman from under 2-high protective tunnel!');
    await sleep(1500);

    // Combat window
    const combatStart = Date.now();
    let hits = 0;
    while (Date.now() - combatStart < 15000 && em.isValid && !isCancelled()) {
      const d = bot.entity.position.distanceTo(em.position);
      if (d <= 4.0) {
        if (sw) await bot.equip(sw, 'hand');
        bot.attack(em);
        hits++;
        await sleep(650);
      } else {
        await bot.lookAt(em.position.offset(0, 2.7, 0), true);
        await sleep(250);
      }
    }
    console.log(`Enderman combat resolved. Hits: ${hits}`);
    await sleep(1000);
    await lib.pickup(6.0);
  }
}

// 6. Summary
const finalPearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 631: Ender Pearls: ${finalPearls}/12, Gold Ingots: ${lib.count('gold_ingot')} ===`);
console.log('Current Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
