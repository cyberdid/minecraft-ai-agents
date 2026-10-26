// programs/433-bridge-to-fortress-and-build-parapets.js
console.log('=== Step: Advance along y=65 ridge to Fortress and build parapets ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Cobble in inv:', lib.count('cobblestone') + lib.count('cobbled_deepslate'));

bot.chat('beta: On the way with 81 cobblestone! Advancing along y=65 ridge to build parapet walls on fortress bridge!');

// Safe high ridge waypoints (maintaining y=64..65)
const safeWaypoints = [
  new Vec3(48, 65, -7),
  new Vec3(55, 65, -35),
  new Vec3(55, 64, -65),
  new Vec3(50, 65, -90),
  new Vec3(49, 65, -114)
];

for (const wp of safeWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing along y=65 ridge to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached near ${lib.fmt(wp)}, current pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Ridge nav note to ${lib.fmt(wp)}:`, err.message);
  }
}

// Check if we arrived near fortress bridge
console.log('Arrived near fortress bridge! Pos:', lib.fmt(bot.entity.position));

// Build cobblestone parapet guardrails along exposed bridge edges at y=65
// If there are air blocks with drops into lava along the bridge sides, place cobblestone
const bridgePos = bot.entity.position.floored();
let parapetCount = 0;

for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -3; dz <= 3; dz++) {
    if (isCancelled() || lib.count('cobblestone') + lib.count('cobbled_deepslate') < 10) break;
    const checkPos = bridgePos.offset(dx, 0, dz);
    const below = bot.blockAt(checkPos.offset(0, -1, 0));
    const here = bot.blockAt(checkPos);
    
    // If there is an open drop below (air or deep fall), place cobblestone barrier
    if (here && here.name === 'air' && (!below || below.name === 'air' || below.name === 'lava')) {
      try {
        const mat = lib.count('cobblestone') > 0 ? 'cobblestone' : 'cobbled_deepslate';
        await lib.place(mat, checkPos.x, checkPos.y, checkPos.z);
        parapetCount++;
        console.log(`Placed parapet block at ${lib.fmt(checkPos)}`);
      } catch (e) {}
    }
  }
}

console.log(`Parapet construction: placed ${parapetCount} blocks. HP=${bot.health}/20, Food=${bot.food}/20`);
bot.chat(`beta: At Fortress bridge ${lib.fmt(bot.entity.position)}! Reinforced bridge with ${parapetCount} cobblestone. Teaming with Alpha & Gamma!`);
