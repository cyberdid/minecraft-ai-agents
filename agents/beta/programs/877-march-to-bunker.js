// programs/877-march-to-bunker.js
console.log('=== Program 877: March to Fortress Workshop Bunker & Covered Tunnel ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet (slot 8)
const feetSlot = bot.inventory.slots[8];
if (!feetSlot || feetSlot.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    console.log('Equipping golden_boots to slot 8 for 100% Piglin neutrality...');
    await bot.equip(gb, 'feet');
  }
}
console.log(`Wearing: feet=${bot.inventory.slots[8]?.name}`);

// Equip weapon and configure fire avoidance
await lib.equipWeapon();
globalThis.configureFireAvoidance();

bot.chat('Beta: Marching along safe East Ridge trail to Fortress Workshop Bunker (44, 65, -127)!');

// March waypoints to Bunker (44, 65, -127) and Covered Tunnel (44, 65, -145)
const bunkerWps = globalThis.NETHER_PILLBOX_WAYPOINTS.slice(0, 16);

let startIdx = 0;
for (let i = 0; i < bunkerWps.length; i++) {
  const wp = bunkerWps[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.0) {
    startIdx = i + 1;
  }
}

console.log(`Starting march from WP ${startIdx}/${bunkerWps.length}...`);

for (let i = startIdx; i < bunkerWps.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = bunkerWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Marching to WP ${i + 1}/${bunkerWps.length}: ${lib.fmt(wp)}`);

  // Low gaze to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    console.log(`Pathfinder step note: ${e.message}`);
    try {
      await globalThis.clearFireAhead();
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 7000 });
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  await lib.pickup(3.0);

  if (bot.health <= 8) {
    console.log(`HP low (${bot.health}), pausing march for safety.`);
    break;
  }
}

console.log(`March end. Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Scan for nearby mobs: Piglins and Endermen
const mobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 24 &&
  ['piglin', 'enderman', 'zombified_piglin', 'blaze', 'wither_skeleton'].includes(e.name)
);

console.log(`Nearby Nether mobs within 24m: ${mobs.length}:`);
for (const m of mobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m)`);
}

// Scan for gold ore blocks nearby
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 24,
  count: 20
});
console.log(`Found ${goldOres.length} gold ore blocks within 24m:`, goldOres.map(p => lib.fmt(p)));

// Scan for other players
for (const [name, pl] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)} (dist: ${bot.entity.position.distanceTo(pl.entity.position).toFixed(1)}m)`);
  }
}

bot.chat(`Beta: Arrived at ${lib.fmt(bot.entity.position)}! Piglins nearby: ${mobs.filter(m => m.name === 'piglin').length}, Gold veins: ${goldOres.length}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  mobs: mobs.map(m => m.name),
  goldOres: goldOres.length
};
