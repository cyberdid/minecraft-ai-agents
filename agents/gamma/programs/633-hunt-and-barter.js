// programs/633-hunt-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 633: FORTRESS OUTPOST RADAR & COMBAT/BARTER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Ensure shield in offhand, golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) await bot.equip(sw, 'hand');

// 1. Scan all entities within 64m
const all = Object.values(bot.entities).filter(e => e.isValid && e !== bot.entity);

const players = all.filter(e => e.type === 'player');
console.log(`Players (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

const piglins = all.filter(e => e.name === 'piglin')
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
console.log(`Piglins (${piglins.length}):`);
for (const p of piglins) {
  const dy = Math.abs(p.position.y - bot.entity.position.y);
  console.log(`- Piglin at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m, dY: ${dy.toFixed(1)}m`);
}

const endermen = all.filter(e => e.name === 'enderman')
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
console.log(`Endermen (${endermen.length}):`);
for (const em of endermen) {
  const dy = Math.abs(em.position.y - bot.entity.position.y);
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m, dY: ${dy.toFixed(1)}m`);
}

const items = all.filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16);
if (items.length > 0) {
  console.log(`Ground items nearby: ${items.length}`);
  await lib.pickup(6.0);
}

// 2. Check for reachable Piglins (dY <= 2.5m, dist <= 12m)
const reachablePiglins = piglins.filter(p =>
  Math.abs(p.position.y - bot.entity.position.y) <= 2.5 &&
  bot.entity.position.distanceTo(p.position) <= 12
);

if (reachablePiglins.length > 0 && lib.count('gold_ingot') > 0) {
  const targetPiglin = reachablePiglins[0];
  console.log(`Found reachable Piglin at ${lib.fmt(targetPiglin.position)}!`);
  
  // Barter 1 ingot at a time
  const totalToBarter = Math.min(lib.count('gold_ingot'), 4);
  bot.chat(`gamma: Bartering ${totalToBarter} gold ingots with reachable Piglin at ${lib.fmt(targetPiglin.position)}!`);
  
  for (let r = 0; r < totalToBarter && !isCancelled(); r++) {
    await bot.lookAt(targetPiglin.position.offset(0, 0.5, 0), true);
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
    console.log(`Tossed ingot ${r + 1}/${totalToBarter}. Waiting 8.5s...`);
    await sleep(8500);
    await lib.pickup(6.0);
  }
} else {
  console.log('No reachable Piglins on current floor level right now.');
}

// 3. Check for Endermen that can be aggroed safely from inside the 2-high bunker
if (endermen.length > 0) {
  const em = endermen[0];
  console.log(`Enderman spotted at ${lib.fmt(em.position)}, distance: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
  
  // Check if gamma is safely inside bunker (y=65, ceiling above)
  const roof = bot.blockAt(bot.entity.position.offset(0, 2, 0));
  const isProtected = roof && roof.boundingBox === 'block';
  console.log(`Is bunker ceiling solid? ${isProtected} (${roof ? roof.name : 'air'})`);

  if (isProtected) {
    bot.chat(`gamma: Targeting Enderman at ${lib.fmt(em.position)} from inside 2-high blast-proof bunker!`);
    if (sw) await bot.equip(sw, 'hand');
    
    // Look at Enderman's eyes (y + 2.7) to provoke
    await bot.lookAt(em.position.offset(0, 2.7, 0), true);
    await sleep(2000);

    // Melee attack loop while staying stationary inside the 2-high bunker
    const combatDeadline = Date.now() + 20000;
    let hits = 0;
    while (Date.now() < combatDeadline && em.isValid && !isCancelled()) {
      const d = bot.entity.position.distanceTo(em.position);
      if (d <= 4.2) {
        if (sw) await bot.equip(sw, 'hand');
        bot.attack(em);
        hits++;
        await sleep(650);
      } else {
        await bot.lookAt(em.position.offset(0, 2.7, 0), true);
        await sleep(200);
      }
    }
    console.log(`Enderman combat round completed. Total hits: ${hits}`);
    await sleep(1000);
    await lib.pickup(6.0);
  }
}

// 4. Check Gold Ore Veins above at staircase (44, 65, -134)
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore'),
  maxDistance: 24,
  count: 10
});
console.log(`Nearby gold ore blocks detected: ${goldOres.length}`);
for (const go of goldOres) {
  console.log(`- Gold ore at ${lib.fmt(go)}`);
}

// 5. Final report
const pearls = lib.count('ender_pearl');
const ingots = lib.count('gold_ingot');
const nuggets = lib.count('gold_nugget');
console.log(`=== END PROGRAM 633: Pearls=${pearls}/12, Gold Ingots=${ingots}, Gold Nuggets=${nuggets}, HP=${bot.health.toFixed(1)} ===`);
bot.chat(`gamma: Milestone 9 status — Pearls: ${pearls}/12, Gold ingots: ${ingots}, Nuggets: ${nuggets}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls,
  ingots,
  nuggets,
  piglins: piglins.length,
  endermen: endermen.length,
  goldOres: goldOres.length
};
