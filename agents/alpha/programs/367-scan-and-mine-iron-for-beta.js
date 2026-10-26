// programs/367-scan-and-mine-iron-for-beta.js
console.log('=== Program 367: Mine Iron for Beta (Chestplate & Boots) ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Eat cooked beef if food < 20
while (bot.food < 20 && lib.count('cooked_beef') > 0) {
  await globalThis.safeEat('cooked_beef');
}

// 2. Step outside base
console.log('Stepping outside base...');
try {
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 3. Navigate towards East Hill (345, 65, -35)
console.log('Heading to East Hill iron area (345, 65, -35)...');
try {
  await lib.goTo(345, 65, -35, 3, { timeoutMs: 30000 });
  console.log('Arrived at East Hill:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('East Hill travel note:', e.message);
  try {
    await lib.goToXZ(345, -35, { timeoutMs: 25000 });
  } catch (e2) {}
}

// 4. Find iron ore nearby (safe filter: not deep in aquifer)
const ores = bot.findBlocks({
  matching: (b) => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 20
});
console.log(`Found ${ores.length} iron ore blocks nearby!`);
for (const p of ores.slice(0, 5)) {
  console.log(`  Iron ore at ${lib.fmt(p)}`);
}

// 5. Mine up to 12 iron ore
let mined = 0;
for (const pos of ores) {
  if (isCancelled()) break;
  if (mined >= 12) break;
  if (lib.time().secondsUntilNight < 120) {
    console.log('Dusk approaching, stopping mining to return home.');
    break;
  }
  // Avoid deep flooded blocks (y < 55 near aquifer)
  if (pos.y < 50 && pos.x < 300) continue;

  try {
    console.log(`Mining iron ore at ${lib.fmt(pos)}...`);
    await lib.dig(pos.x, pos.y, pos.z);
    await lib.pickup(4);
    mined++;
    console.log(`Mined ${mined} iron ore. Total raw_iron: ${lib.count('raw_iron')}`);
  } catch (err) {
    console.log(`Mine error at ${lib.fmt(pos)}:`, err.message);
  }
}

// 6. Return to base
console.log('Returning to base shelter...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 30000 });
  await globalThis.passDoorIn();
  console.log('Inside base shelter!');
} catch (e) {
  console.log('Return error:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Raw iron:', lib.count('raw_iron'));
bot.chat(`team: Alpha mined ${lib.count('raw_iron')} raw iron for Beta armor! In base at ${lib.fmt(bot.entity.position)}`);
