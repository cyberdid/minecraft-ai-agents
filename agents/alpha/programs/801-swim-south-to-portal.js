// programs/801-swim-south-to-portal.js
console.log('=== Program 801: Swim South across Lava to Portal Camp ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

bot.chat('alpha: Swimming South across lava lake holding flint & steel to relight Nether portal at (46, 66, 2)!');

const targetXZ = new Vec3(48.0, 32.0, -6.0);
const start = Date.now();
const maxDuration = 60000; // 60s

while (Date.now() - start < maxDuration && !checkCancelled()) {
  const cur = bot.entity.position;
  const distZ = Math.abs(cur.z - targetXZ.z);
  
  if (cur.z >= -10) {
    console.log(`Reached near Portal Camp shoreline! Pos: ${lib.fmt(cur)}`);
    break;
  }

  // Face target
  await bot.lookAt(new Vec3(targetXZ.x, cur.y, targetXZ.z), true);

  // Swim forward on lava surface
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);

  // Check if obstacle directly ahead
  const aheadFeet = bot.blockAt(cur.offset(0, 0, 1));
  const aheadHead = bot.blockAt(cur.offset(0, 1, 1));
  
  if (aheadFeet && aheadFeet.boundingBox === 'block' && aheadFeet.name !== 'lava') {
    // If solid block ahead, try jumping onto it or dig if blocking
    if (aheadHead && aheadHead.name === 'air') {
      bot.setControlState('jump', true);
    } else if (aheadFeet && (aheadFeet.name === 'netherrack' || aheadFeet.name === 'soul_sand')) {
      try {
        await bot.dig(aheadFeet, true);
      } catch (e) {}
    }
  }

  await sleep(250);

  if ((Date.now() - start) % 5000 < 300) {
    console.log(`Pos: ${lib.fmt(cur)} - remaining Z: ${distZ.toFixed(1)}m`);
  }
}

bot.clearControlStates();
console.log('Swim loop complete. Current pos:', lib.fmt(bot.entity.position));

// Scan for nearby solid blocks / shorelines
const shore = bot.findBlocks({
  matching: b => b && b.boundingBox === 'block' && b.name !== 'lava',
  maxDistance: 8,
  count: 5
});
console.log(`Solid blocks within 8m: ${shore.length}`);
for (const s of shore) {
  console.log(`- ${bot.blockAt(s)?.name} at ${lib.fmt(s)}`);
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  distToPortal: bot.entity.position.distanceTo(new Vec3(46, 66, 2)).toFixed(1),
  inv: lib.inv()
};
