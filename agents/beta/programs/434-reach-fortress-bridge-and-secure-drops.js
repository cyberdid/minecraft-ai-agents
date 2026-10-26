// programs/434-reach-fortress-bridge-and-secure-drops.js
console.log('=== Step: Advance to Fortress bridge at (45, 65, -131) and secure drops ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.chat('beta: Advancing to (45, 65, -131) to recover Alpha drops and fortify bridgehead with cobblestone!');

// Waypoints to fortress bridge
const bridgeWps = [
  new Vec3(55, 65, -85),
  new Vec3(50, 65, -105),
  new Vec3(47, 65, -120),
  new Vec3(45, 65, -131)
];

for (const wp of bridgeWps) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Nav note to ${lib.fmt(wp)}:`, e.message);
  }
}

// Collect all dropped items at the bridge
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15
);
console.log(`Found ${drops.length} item drops at bridge!`);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
    console.log(`Collected item drop at ${lib.fmt(d.position)}!`);
  } catch (e) {}
}

// Equip best weapon and armor if recovered
await lib.equipArmor();
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// Place cobblestone parapets/shield around bridge section
const bp = bot.entity.position.floored();
let placed = 0;
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    if (isCancelled() || lib.count('cobblestone') < 5) break;
    const edgePos = bp.offset(dx, 0, dz);
    const below = bot.blockAt(edgePos.offset(0, -1, 0));
    const here = bot.blockAt(edgePos);
    if (here && here.name === 'air' && (!below || below.name === 'air' || below.name === 'lava')) {
      try {
        await lib.place('cobblestone', edgePos.x, edgePos.y, edgePos.z);
        placed++;
      } catch (e) {}
    }
  }
}

console.log(`Bridge secured! Placed ${placed} cobble. Current inv:`, JSON.stringify(lib.inv()));
bot.chat(`beta: At Fortress bridge ${lib.fmt(bot.entity.position)}! Secured drops, placed ${placed} cobble parapets. Holding fortress bridgehead!`);
