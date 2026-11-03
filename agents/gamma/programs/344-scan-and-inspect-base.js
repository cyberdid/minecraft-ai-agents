// programs/344-scan-and-inspect-base.js
console.log('=== SCAN PLAYERS & DIMENSIONS ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player: ${name} at ${lib.fmt(p.entity.position)} in dimension ${bot.game.dimension}`);
  } else {
    console.log(`Player: ${name} (entity not loaded)`);
  }
}
console.log('Gamma at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Time info:', JSON.stringify(lib.time()));

// Enter base safely
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('goTo door step error:', e.message);
}

try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor error:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('manual door open error:', e2.message);
  }
}

// Pickup any drops in base
try {
  const drops = await lib.pickup(8);
  console.log('Picked up drops in base:', drops);
} catch (e) {}

// Check chest
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
    console.log('Base chest contents:', JSON.stringify(contents));
  } catch (e) {
    console.log('Chest error:', e.message);
  }
} else {
  console.log('No chest at', lib.fmt(chestPos));
}

// Check nearby furnaces
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    console.log(`Furnace at ${lib.fmt(fPos)}: ${fb.name}`);
  }
}

console.log('Gamma inventory:', JSON.stringify(lib.inv()));
return { pos: bot.entity.position, inv: lib.inv() };
