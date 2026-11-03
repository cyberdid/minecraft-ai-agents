// programs/348-scan-drops-and-ore.js
console.log('--- Step 1: Scan for dropped items nearby ---');
const items = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 48);
console.log(`Found ${items.length} dropped items nearby`);
for (const it of items) {
  console.log(`Item at ${lib.fmt(it.position)} dist ${it.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

if (items.length > 0) {
  try {
    const nearestItem = items.sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))[0];
    await bot.pathfinder.goto(new goals.GoalNear(nearestItem.position.x, nearestItem.position.y, nearestItem.position.z, 1));
    await lib.pickup(10);
  } catch (e) {
    console.log('Pickup error:', e.message);
  }
}

console.log('--- Step 2: Mine exposed coal ore at (306, 66, -63) ---');
try {
  await lib.goTo(306, 66, -62, 2);
  const coal1 = bot.blockAt(new Vec3(306, 66, -63));
  if (coal1 && coal1.name === 'coal_ore') {
    await lib.dig(306, 66, -63);
    await lib.pickup(4);
    console.log('Mined coal ore at (306, 66, -63)!');
  }
  const coal2 = bot.blockAt(new Vec3(306, 65, -64));
  if (coal2 && coal2.name === 'coal_ore') {
    await lib.dig(306, 65, -64);
    await lib.pickup(4);
    console.log('Mined coal ore at (306, 65, -64)!');
  }
} catch (e) {
  console.log('Coal mining error:', e.message);
}

console.log('--- Step 3: Scan for iron ore on exposed hill ---');
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 5 });
console.log('Iron ores found:', ironOres.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', ') || 'none');
for (const io of ironOres) {
  if (io.position.y >= 60 && lib.time().secondsUntilNight > 80) {
    console.log(`Mining iron ore at ${lib.fmt(io.position)}...`);
    try {
      await lib.dig(io.position.x, io.position.y, io.position.z);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig iron error:', e.message);
    }
  }
}

console.log('--- Step 4: Safety & Night check ---');
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, night in ${t.secondsUntilNight}s`);
if (t.secondsUntilNight < 90 || t.night) {
  console.log('Heading into base shelter...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
    console.log('Safely inside base!');
  } catch (e) {
    console.log('Base door error:', e.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
