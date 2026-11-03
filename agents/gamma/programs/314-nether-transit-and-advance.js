// programs/314-nether-transit-and-advance.js
console.log('=== NETHER TRANSIT & EXPEDITION ADVANCE ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Step out base door to overworld Nether Portal at (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  console.log('Exiting base door...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await lib.walkTo(294.5, -51.5, 3000);
      await lib.door(294, 72, -54, false);
    } catch (e2) {}
  }

  console.log('Outside base! Moving to Nether Portal at (299.5, 73.0, -54.0)...');
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  try {
    await lib.goTo(298, 72, -53, 1, { timeoutMs: 8000 });
  } catch (e) {}

  // Jump into portal frame
  bot.setControlState('jump', true);
  await lib.walkTo(portalTarget.x, portalTarget.z, 3000);
  bot.clearControlStates();

  console.log('Standing in portal frame, waiting for dimension shift...');
  const t0 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
    await sleep(500);
  }

  console.log('Dimension after portal wait:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
}

// 2. Nether arrival check
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Failed to transit to Nether!');
  bot.chat('gamma: Nether transit attempt failed, still in overworld');
  return;
}

bot.chat(`gamma arrived in Nether at ${lib.fmt(bot.entity.position)} with 2 stone swords & ${lib.count('cobblestone')} cobble! Advancing to Spawner!`);

// Step out of portal hitbox into bunker
console.log('Stepping out of Nether portal hitbox into bunker...');
bot.clearControlStates();
await bot.lookAt(new Vec3(46, 65, -7), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.clearControlStates();
console.log('Now at:', lib.fmt(bot.entity.position));

// Equip weapon
await lib.equipWeapon();

// Check and extinguish any soul fire within 6 blocks
const fireBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 6,
  count: 5
});
for (const fp of fireBlocks) {
  try {
    console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
    const b = bot.blockAt(fp);
    if (b) await bot.dig(b);
  } catch (e) {}
}

// 3. Move from Nether Portal bunker to East Ridge Trail: (63, 65, -8)
console.log('Moving from bunker to East Ridge Trail (63, 65, -8)...');
const toRidge = [
  new Vec3(44.0, 65.0, -8),
  new Vec3(52.0, 65.0, -8),
  new Vec3(63.0, 65.0, -8)
];

for (const wp of toRidge) {
  if (isCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 8000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

// 4. March along verified safe East Ridge waypoints to Fortress Workshop
console.log('Marching along East Ridge trail...');
const waypoints = [
  { name: 'Ridge South (63, 65, -15)', pos: new Vec3(63.0, 65.0, -15) },
  { name: 'Ridge Mid-South (62.5, 66, -30)', pos: new Vec3(62.5, 66.0, -30) },
  { name: 'Ridge Mid (62.0, 65, -55)', pos: new Vec3(62.0, 65.0, -55) },
  { name: 'Ridge North (62.0, 66, -80)', pos: new Vec3(62.0, 66.0, -80) },
  { name: 'Ridge Bend (61.0, 66, -100)', pos: new Vec3(61.0, 66.0, -100) },
  { name: 'Fortress Approach (50, 65, -115)', pos: new Vec3(50.0, 65.0, -115) },
  { name: 'Fortress Workshop (44, 65, -127)', pos: new Vec3(44.0, 65.0, -127) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name}...`);
  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 14000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {}
  }

  // Extinguish any fire in path
  const localFire = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4,
    count: 3
  });
  for (const fp of localFire) {
    try { await bot.dig(bot.blockAt(fp)); } catch (e) {}
  }

  try { await lib.pickup(5); } catch (e) {}
}

console.log('\n=== EXPEDITION PROGRESS ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma report: reached ${lib.fmt(bot.entity.position)} in Nether! Cobblestone: ${lib.count('cobblestone')}, HP: ${bot.health}/20`);
