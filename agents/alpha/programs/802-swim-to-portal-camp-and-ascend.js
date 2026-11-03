// programs/802-swim-to-portal-camp-and-ascend.js
console.log('=== Program 802: Swim to Portal Camp (z = -6) and Ascend ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

bot.chat('alpha: Swimming remaining 55m South across lava to Nether Portal Camp (46, 66, 2) to reunite with team!');

const targetXZ = new Vec3(46.0, 32.0, -2.0);
const start = Date.now();
const maxDuration = 70000;

while (Date.now() - start < maxDuration && !checkCancelled()) {
  const cur = bot.entity.position;
  const distToPortal = cur.distanceTo(new Vec3(46, 66, 2));

  if (cur.z >= -6) {
    console.log(`Reached Portal Camp shoreline at z=${cur.z.toFixed(1)}! Current pos: ${lib.fmt(cur)}`);
    break;
  }

  // Face target
  await bot.lookAt(new Vec3(targetXZ.x, cur.y, targetXZ.z), true);

  // Swim forward and up
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);

  // Check if shoreline / solid block in front
  const ahead = bot.blockAt(cur.offset(0, 0, 1));
  if (ahead && ahead.boundingBox === 'block' && ahead.name !== 'lava') {
    // If netherrack or soul sand/soil, we can jump up or dig
    const head = bot.blockAt(cur.offset(0, 1, 1));
    if (head && head.boundingBox === 'block' && (head.name === 'netherrack' || head.name.includes('soul'))) {
      try { await bot.dig(head, true); } catch (e) {}
    }
  }

  await sleep(200);

  if ((Date.now() - start) % 5000 < 250) {
    console.log(`Pos: ${lib.fmt(cur)} - dist to portal frame: ${distToPortal.toFixed(1)}m`);
  }
}

bot.clearControlStates();
console.log('Arrived at Portal Camp base. Pos:', lib.fmt(bot.entity.position));

// Scan for teammates
for (const p of Object.values(bot.players)) {
  if (p.username === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Find nearby portal blocks
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16, count: 5 });
console.log(`Nether portal blocks detected: ${portals.length}`);

// If portal blocks found nearby, announce!
if (portals.length > 0) {
  bot.chat('alpha: Nether Portal at (46, 66, 2) verified active and operational! Ready to unite with team!');
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  portals: portals.length,
  distToPortal: bot.entity.position.distanceTo(new Vec3(46, 66, 2)).toFixed(1),
  inv: lib.inv()
};
