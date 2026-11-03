// programs/639-unite-bunker-and-hunt.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 639: PORTAL BUNKER RETREAT, RADAR & HUNT ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

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
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) await bot.equip(sw, 'hand');

// 2. Step up into the Nether Base Camp bunker floor at y=65
// If Gamma is at y=62..63, place a cobblestone step if needed or jump up
if (bot.entity.position.y < 64.5) {
  console.log('Stepping up to bunker floor y=65...');
  // Look towards (44, 65, -6)
  await bot.lookAt(new Vec3(43.0, 65.0, -6.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

// Ensure inside bunker at (42..44, 65, -6)
try {
  await bot.pathfinder.goto(new goals.GoalNear(42.0, 65.0, -6.0, 1.2));
} catch (e) {
  try { await lib.goTo(42.0, 65.0, -6.0, 1.5, { timeoutMs: 4000 }); } catch (e2) {}
}

console.log('Current Gamma pos inside bunker:', lib.fmt(bot.entity.position));

// 3. Verify active nether_portal blocks
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log(`Active nether_portal blocks detected: ${portals.length}`);
if (portals.length > 0) {
  console.log('Nether Portal is ACTIVE at:', lib.fmt(portals[0]));
}

// 4. Scan teammates
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Teammates nearby (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 5. Check if Alpha needs golden_boots
const alpha = players.find(p => p.username === 'alpha');
if (alpha) {
  const dAlpha = bot.entity.position.distanceTo(alpha.position);
  if (dAlpha <= 6.0) {
    const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
    if (extraBoots) {
      console.log('Delivering golden_boots to Alpha!');
      await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
      await bot.tossStack(extraBoots);
      bot.chat('gamma: alpha: Here are golden_boots! Equip them on feet for 100% Piglin neutrality!');
      await sleep(500);
    }
  }
}

// 6. Scan for Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 80
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Endermen tracked in Soul Sand Valley: ${endermen.length}`);
for (const em of endermen) {
  const dy = Math.abs(em.position.y - bot.entity.position.y);
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m, dY: ${dy.toFixed(1)}m`);
}

// 7. If Enderman exists and Gamma is under bunker ceiling (y=65, roof at y=67)
const roof = bot.blockAt(bot.entity.position.offset(0, 2, 0));
const isCovered = roof && roof.boundingBox === 'block';
console.log(`Is Gamma under safe 2-high ceiling? ${isCovered} (${roof ? roof.name : 'air'})`);

if (endermen.length > 0 && isCovered) {
  const em = endermen[0];
  console.log(`Targeting Enderman at ${lib.fmt(em.position)}!`);
  bot.chat(`gamma: Targeting Enderman at ${lib.fmt(em.position)} from 2-high bunker doorway!`);

  // Stare at Enderman eyes to provoke
  await bot.lookAt(em.position.offset(0, 2.7, 0), true);
  await sleep(2500);

  // Melee attack loop
  const combatStart = Date.now();
  let hits = 0;
  while (Date.now() - combatStart < 18000 && em.isValid && !isCancelled()) {
    const dist = bot.entity.position.distanceTo(em.position);
    if (dist <= 4.2) {
      if (sw) await bot.equip(sw, 'hand');
      bot.attack(em);
      hits++;
      await sleep(650);
    } else {
      await bot.lookAt(em.position.offset(0, 2.7, 0), true);
      await sleep(200);
    }
  }
  console.log(`Combat complete. Hits: ${hits}`);
  await sleep(1000);
  await lib.pickup(6.0);
}

// 8. Scan for ground-level Piglins for bartering (dY <= 2.5m, dist <= 16m)
const reachablePiglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid &&
  Math.abs(e.position.y - bot.entity.position.y) <= 2.5 &&
  bot.entity.position.distanceTo(e.position) <= 16
);

console.log(`Reachable Piglins on same level: ${reachablePiglins.length}`);
if (reachablePiglins.length > 0 && lib.count('gold_ingot') > 0) {
  const p = reachablePiglins[0];
  console.log(`Bartering 1 gold ingot with Piglin at ${lib.fmt(p.position)}...`);
  await bot.lookAt(p.position.offset(0, 0.5, 0), true);
  await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
  await sleep(8500);
  await lib.pickup(6.0);
}

// 9. Report status
const pearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 639: Pearls=${pearls}/12, HP=${bot.health.toFixed(1)}, Food=${bot.food} ===`);
bot.chat(`gamma: Base Camp status — Active Portals: ${portals.length}, Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  portals: portals.length,
  pearls,
  endermen: endermen.length,
  piglins: reachablePiglins.length,
  inv: lib.inv()
};
