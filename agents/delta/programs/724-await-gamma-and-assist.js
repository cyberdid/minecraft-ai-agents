// programs/724-await-gamma-and-assist.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 724: AWAIT GAMMA & CHECK EYES STATUS ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);

const start = Date.now();
const TIMEOUT_MS = 25000;

while (Date.now() - start < TIMEOUT_MS && !isCancelled()) {
  // Check players
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== 'delta');
  
  // Look for gamma
  const gamma = players.find(p => p.username === 'gamma');
  const beta = players.find(p => p.username === 'beta');
  const alpha = players.find(p => p.username === 'alpha');

  if (gamma) {
    console.log(`GAMMA DETECTED at ${lib.fmt(gamma.position)}! Held: ${gamma.heldItem?.name}`);
  }
  if (beta) {
    console.log(`BETA DETECTED at ${lib.fmt(beta.position)}! Held: ${beta.heldItem?.name}`);
  }
  if (alpha) {
    console.log(`ALPHA DETECTED at ${lib.fmt(alpha.position)}! Held: ${alpha.heldItem?.name}`);
  }

  // Vacuum drops near portal (299, 73, -54) and base (293, 72, -55)
  try { await lib.pickup(4.0); } catch (e) {}

  // Check Base Chest
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openContainer(cb);
      const items = chest.containerItems();
      const pow = items.find(i => i.name === 'blaze_powder');
      const rods = items.find(i => i.name === 'blaze_rod');
      const eyes = items.find(i => i.name === 'ender_eye');
      const pearls = items.find(i => i.name === 'ender_pearl');

      if (pow || rods || eyes || pearls) {
        console.log(`Chest has: pow=${pow?.count}, rods=${rods?.count}, eyes=${eyes?.count}, pearls=${pearls?.count}`);
      }
      chest.close();
    } catch (e) {}
  }

  // Check delta inventory for rods/powder/pearls
  if (lib.count('blaze_rod') > 0) {
    console.log(`Delta has ${lib.count('blaze_rod')} blaze_rod! Crafting to blaze_powder...`);
    try {
      await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
    } catch (e) {}
  }

  if (lib.count('blaze_powder') > 0 && lib.count('ender_pearl') > 0) {
    const toCraft = Math.min(lib.count('blaze_powder'), lib.count('ender_pearl'));
    console.log(`Delta crafting ${toCraft} ender_eye!`);
    try {
      await lib.craft('ender_eye', toCraft);
      bot.chat(`Delta: Crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}`);
    } catch (e) {}
  }

  await sleep(1500);
}

return {
  deltaPos: bot.entity.position,
  deltaEyes: lib.count('ender_eye'),
  deltaPowder: lib.count('blaze_powder'),
  deltaPearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food
};
