// programs/716-advance-to-dragon-perch.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== ADVANCE TO CENTRAL PERCH (0, 65, 0) ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Find bedrock fountain / exit portal blocks
const bedrock = bot.findBlocks({
  matching: b => b && b.name === 'bedrock',
  maxDistance: 48,
  count: 32
});

console.log(`Found ${bedrock.length} bedrock blocks near center:`);
if (bedrock.length > 0) {
  console.log(`Closest bedrock at ${lib.fmt(bedrock[0])}, dist=${bot.entity.position.distanceTo(bedrock[0]).toFixed(1)}m`);
}

// Find Dragon
const dragon = Object.values(bot.entities).find(e => e && e.name === 'ender_dragon' && e.isValid);
if (dragon) {
  console.log(`Ender Dragon at ${lib.fmt(dragon.position)}, dist=${bot.entity.position.distanceTo(dragon.position).toFixed(1)}m`);
}

// Keep gaze low to avoid Endermen
await bot.lookAt(new Vec3(bot.entity.position.x - 5, bot.entity.position.y - 1, bot.entity.position.z));

// Walk towards (5, 62, 0)
const target = new Vec3(5.0, 62.0, 0.0);
console.log(`Walking towards center ${lib.fmt(target)}...`);

try {
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);
  await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 3.0));
} catch (e) {
  console.log('Pathfinder near center notice:', e.message);
  // Manual step West
  bot.clearControlStates();
  bot.setControlState('forward', true);
  const startWalk = Date.now();
  while (bot.entity.position.x > 8.0 && Date.now() - startWalk < 4000 && !isCancelled()) {
    await bot.lookAt(new Vec3(0, bot.entity.position.y, 0), true);
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.clearControlStates();
}

console.log('Pos after advance:', lib.fmt(bot.entity.position));

// Equip netherite sword and shield
const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (ns) await bot.equip(ns, 'hand');
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) await bot.equip(sh, 'off-hand');

// Check dragon position again
const d2 = Object.values(bot.entities).find(e => e && e.name === 'ender_dragon' && e.isValid);
if (d2) {
  const dDist = bot.entity.position.distanceTo(d2.position);
  console.log(`Dragon is now at ${lib.fmt(d2.position)}, dist=${dDist.toFixed(1)}m`);
  // If dragon is within melee reach (<= 6m), strike!
  if (dDist <= 6.5) {
    console.log('DRAGON IN STRIKING RANGE! EXECUTING CRITICAL STRIKE!');
    bot.setControlState('jump', true);
    await sleep(150);
    bot.attack(d2);
    bot.setControlState('jump', false);
    bot.chat('gamma: LANDED CRITICAL MELEE HIT ON ENDER DRAGON WITH NETHERITE SWORD!');
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  dragonDist: d2 ? bot.entity.position.distanceTo(d2.position) : null
};
