// programs/718-ascend-to-surface-perch.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== ASCEND TO END ISLAND SURFACE & REACH BEDROCK PERCH ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Step 1: Dig staircase up to y=60
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

console.log('Digging staircase up to surface at y=60...');

// Dig blocks at x=25, 24, 23 to exit onto surface at y=60
const stairs = [
  { dig: [new Vec3(25, 58, 0), new Vec3(25, 59, 0), new Vec3(25, 60, 0)], stand: new Vec3(25.5, 58.0, 0.5) },
  { dig: [new Vec3(24, 59, 0), new Vec3(24, 60, 0), new Vec3(24, 61, 0)], stand: new Vec3(24.5, 60.0, 0.5) }
];

for (const s of stairs) {
  for (const bp of s.dig) {
    const b = bot.blockAt(bp);
    if (b && b.boundingBox === 'block') {
      console.log(`Mining ${b.name} at ${lib.fmt(bp)}...`);
      await bot.dig(b);
    }
  }
  // Step up
  await bot.lookAt(s.stand.offset(0, 1.2, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(400);
  bot.clearControlStates();
}

console.log('Pos after staircase:', lib.fmt(bot.entity.position));

// Step 2: Now on surface at y=60, walk towards bedrock perch at (4.0, 60.0, 0.0)
console.log('Marching along surface to Bedrock Perch (4, 60, 0)...');
bot.chat('team: gamma ascended to End Island surface at y=60! Marching to Bedrock Perch (4, 60, 0) with Netherite Sword!');

// Keep gaze slightly down to avoid looking at Enderman eyes
await bot.lookAt(new Vec3(0, 59, 0));

bot.setControlState('forward', true);
const walkStart = Date.now();
while (bot.entity.position.x > 5.0 && Date.now() - walkStart < 6000 && !isCancelled()) {
  await bot.lookAt(new Vec3(4.0, bot.entity.position.y, 0.0), true);
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(150);
    bot.setControlState('jump', false);
  }
  await sleep(50);
}
bot.clearControlStates();

console.log('Position near Bedrock Perch:', lib.fmt(bot.entity.position));

// Equip netherite sword and shield
const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (ns) await bot.equip(ns, 'hand');
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) await bot.equip(sh, 'off-hand');

// Find Dragon
const dragon = Object.values(bot.entities).find(e => e && e.name === 'ender_dragon' && e.isValid);
if (dragon) {
  const dDist = bot.entity.position.distanceTo(dragon.position);
  console.log(`Dragon at ${lib.fmt(dragon.position)}, dist=${dDist.toFixed(1)}m, HP=${dragon.health}`);

  // If dragon is within melee range (<= 7m), strike!
  if (dDist <= 7.0) {
    console.log('DRAGON IN RANGE! Striking with Netherite Sword!');
    bot.setControlState('jump', true);
    await sleep(150);
    bot.attack(dragon);
    bot.setControlState('jump', false);
    bot.chat('gamma: HIT ENDER DRAGON WITH NETHERITE SWORD AT PERCH!');
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  dragon: dragon ? { pos: lib.fmt(dragon.position), dist: bot.entity.position.distanceTo(dragon.position).toFixed(1) } : null
};
