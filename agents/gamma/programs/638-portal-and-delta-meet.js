// programs/638-portal-and-delta-meet.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 638: PORTAL DIAGNOSTIC, DELTA SYNC & BLAST-PROOFING ===');
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

// 2. Scan players
let players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
for (const p of players) {
  console.log(`Player ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

const delta = players.find(p => p.username === 'delta');
const beta = players.find(p => p.username === 'beta');

bot.chat('gamma: delta: You have flint_and_steel! Meet me at Portal Frame (46, 66, 2) to relight it!');

// 3. Move to Portal Bunker entrance (46, 65, -3) to (46, 65, 0)
try {
  await bot.pathfinder.goto(new goals.GoalNear(46.0, 65.0, 0.0, 1.2));
} catch (e) {}

console.log('Current Gamma pos:', lib.fmt(bot.entity.position));

// 4. Map the portal frame around (43..47, 65..69, 1..3)
const obsidians = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 10,
  count: 30
});
console.log(`Obsidian count near portal: ${obsidians.length}`);

// Find bottom sill of portal (lowest Y obsidians)
const sillBlocks = obsidians.filter(o => o.z === 2 && (o.y === 65 || o.y === 66));
console.log(`Sill blocks at z=2:`, sillBlocks.map(b => lib.fmt(b)));

// Check air spaces directly above sill
for (const sb of sillBlocks) {
  const up1 = bot.blockAt(sb.offset(0, 1, 0));
  const up2 = bot.blockAt(sb.offset(0, 2, 0));
  console.log(`Above sill ${lib.fmt(sb)}: up1=${up1 ? up1.name : 'null'}, up2=${up2 ? up2.name : 'null'}`);
}

// 5. If Delta arrives within 6m, wait for Delta to strike with flint_and_steel
const waitStart = Date.now();
while (Date.now() - waitStart < 15000 && !isCancelled()) {
  const newPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (newPortals.length > 0) {
    console.log(`Portal is active! ${newPortals.length} portal blocks detected.`);
    bot.chat('gamma: Portal is LIT and ACTIVE at (46, 66, 2)!');
    break;
  }
  await sleep(1000);
}

// 6. Scan for Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 64
);
console.log(`Endermen in sight: ${endermen.length}`);
for (const em of endermen) {
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

// 7. Check final status
const curPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
console.log(`=== END PROGRAM 638: Portals=${curPortals.length}, Pearls=${lib.count('ender_pearl')}/12, HP=${bot.health.toFixed(1)} ===`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  portals: curPortals.length,
  pearls: lib.count('ender_pearl'),
  players: players.map(p => ({ name: p.username, pos: p.position }))
};
