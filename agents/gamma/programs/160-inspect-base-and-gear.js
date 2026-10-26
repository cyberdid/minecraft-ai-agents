// programs/160-inspect-base-and-gear.js
console.log('--- INSPECT BASE CHEST, FURNACES, AND INVENTORY ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Move to base entrance and enter
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo door note:', e.message);
}

// Check door
const door = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', door?.name);
if (door && door.name.includes('door')) {
  await lib.goThroughDoor(294, 72, -54);
} else {
  await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -56));
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Close door behind us
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Check all chests inside/near base
const chests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 8, count: 5 });
console.log(`Found ${chests.length} chests near base:`);
for (const cp of chests) {
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Chest at ${lib.fmt(cp)}:`, JSON.stringify(contents));
  } catch (e) {
    console.log(`Chest at ${lib.fmt(cp)} read error:`, e.message);
  }
}

// 3. Check furnaces
const furnaces = bot.findBlocks({ matching: b => b.name.includes('furnace'), maxDistance: 8, count: 5 });
console.log(`Found ${furnaces.length} furnaces:`);
for (const fp of furnaces) {
  try {
    const fBlock = bot.blockAt(fp);
    console.log(`Furnace at ${lib.fmt(fp)}: ${fBlock.name}`);
  } catch (e) {}
}

// 4. Check players nearby
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    console.log(`Teammate ${p.username}: ${p.entity ? lib.fmt(p.entity.position) : 'offline/far'}`);
  }
}

console.log('Gamma inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma at base ${lib.fmt(bot.entity.position)}. Spawn set! Checking gear and chests.`);
