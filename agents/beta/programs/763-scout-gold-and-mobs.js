// programs/763-scout-gold-and-mobs.js
console.log('=== Program 763: Scout Gold, Piglins & Endermen in Nether ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
configureFireAvoidance();

// Scan for nether_gold_ore up to 48 blocks
const ores = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 48,
  count: 25
});
console.log(`Found ${ores.length} nether_gold_ore blocks within 48m:`);
for (const p of ores.slice(0, 10)) {
  console.log(` - Gold ore at ${lib.fmt(p)}, dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

// Scan for all entities within 32m
const nearbyMobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 32
);

const piglins = nearbyMobs.filter(e => e.name === 'piglin');
const endermen = nearbyMobs.filter(e => e.name === 'enderman');
const players = nearbyMobs.filter(e => e.type === 'player' && e.username !== bot.username);
const hostiles = nearbyMobs.filter(e => ['ghast', 'blaze', 'magma_cube', 'wither_skeleton', 'zombified_piglin'].includes(e.name));

console.log(`Entities within 32m: Piglins: ${piglins.length}, Endermen: ${endermen.length}, Teammates: ${players.length}, Hostiles: ${hostiles.length}`);

for (const p of players) {
  console.log(`Teammate ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}
for (const pig of piglins) {
  console.log(`Piglin at ${lib.fmt(pig.position)}, dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}
for (const em of endermen) {
  console.log(`Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}
for (const h of hostiles) {
  console.log(`Hostile ${h.name} at ${lib.fmt(h.position)}, dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
}

// If gold ore found within reachable path, mine up to 5 blocks
let mined = 0;
if (ores.length > 0) {
  const reachableOres = ores.filter(p => Math.abs(p.y - bot.entity.position.y) <= 4);
  console.log(`Reachable gold ores (within 4 vertical blocks): ${reachableOres.length}`);

  for (const p of reachableOres.slice(0, 5)) {
    if (isCancelled()) break;
    console.log(`Mining gold ore at ${lib.fmt(p)}...`);
    await clearFireAhead();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 2.2));
      const b = bot.blockAt(p);
      if (b && b.name === 'nether_gold_ore') {
        const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        await bot.dig(b);
        mined++;
        await sleep(200);
        await lib.pickup(3.5);
      }
    } catch (e) {
      console.log(`Mine error at ${lib.fmt(p)}:`, e.message);
    }
  }
  await lib.pickup(4.0);
}

const nuggets = lib.count('gold_nugget');
console.log(`Nuggets now on Beta: ${nuggets}`);
bot.chat(`Beta: Scout complete. Mined: ${mined} ores. Holding ${nuggets} nuggets. Piglins nearby: ${piglins.length}, Endermen: ${endermen.length}`);

return {
  ores_found: ores.length,
  mined,
  gold_nuggets: nuggets,
  piglins: piglins.length,
  endermen: endermen.length,
  pos: bot.entity.position,
  hp: bot.health
};
