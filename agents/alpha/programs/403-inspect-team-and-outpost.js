// programs/403-inspect-team-and-outpost.js
console.log('=== Program 403: Inspect Team, Workshop & Descent Shaft ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Check all teammates in Nether
console.log('--- Teammates in Nether ---');
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`  ${name}: at ${lib.fmt(p.entity.position)}, dist=${dist.toFixed(1)}m`);
  } else {
    console.log(`  ${name}: not loaded or in Overworld`);
  }
}

// 2. Scan for nearby chests or dropped items
const nearbyChests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 12, count: 3 });
console.log(`Chests near outpost: ${nearbyChests.length}`);
for (const cp of nearbyChests) {
  try {
    const items = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`  Chest at ${lib.fmt(cp)}:`, JSON.stringify(items));
    // If food or armor in chest, take it!
    const toTake = {};
    for (const [name, count] of Object.entries(items)) {
      if (['cooked_beef', 'bread', 'apple', 'cooked_porkchop', 'iron_chestplate', 'iron_helmet', 'iron_leggings', 'iron_boots', 'shield', 'cobblestone'].includes(name)) {
        toTake[name] = count;
      }
    }
    if (Object.keys(toTake).length > 0) {
      await lib.withdraw(toTake, cp.x, cp.y, cp.z);
      await lib.equipArmor();
    }
  } catch (e) {
    console.log('Chest read note:', e.message);
  }
}

// 3. Scan for dropped items within 8m
const drops = Object.values(bot.entities).filter(e => 
  e && (e.name === 'item' || e.type === 'object') && e.position && bot.entity.position.distanceTo(e.position) < 8
);
console.log(`Dropped items on floor: ${drops.length}`);
if (drops.length > 0) {
  await lib.pickup(6);
  await lib.equipArmor();
}

// 4. Eat food if available
const foods = bot.inventory.items().filter(it => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef'].includes(it.name)
);
for (const f of foods) {
  while (bot.food < 20 && bot.inventory.count(f.type) > 0) {
    console.log(`Eating ${f.name}...`);
    try { await globalThis.safeEat(f.name); } catch (e) { break; }
  }
}

// Wait for health regen if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside bunker...');
  for (let r = 0; r < 12 && bot.health < 20; r++) {
    if (isCancelled()) break;
    await sleep(1500);
    console.log(`HP: ${bot.health}/20, Food: ${bot.food}/20`);
  }
}

// 5. Inspect descent shaft from y=66 down to y=53 at (44..45, y, -128..-130)
console.log('Inspecting descent blocks:');
for (let y = 66; y >= 53; y--) {
  const b1 = bot.blockAt(new Vec3(44, y, -129));
  const b2 = bot.blockAt(new Vec3(45, y, -129));
  console.log(`  y=${y}: (44,-129)=${b1?.name}, (45,-129)=${b2?.name}`);
}

bot.chat(`team: Alpha status at Fortress Workshop (${lib.fmt(bot.entity.position)}): HP=${bot.health}/20, Food=${bot.food}/20, Tools=${JSON.stringify(lib.tools())}.`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
