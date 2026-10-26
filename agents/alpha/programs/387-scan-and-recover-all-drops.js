// programs/387-scan-and-recover-all-drops.js
console.log('=== Program 387: Scan & Recover All Dropped Items at Fortress ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Scan for dropped item entities
const droppedItems = Object.values(bot.entities).filter(e => 
  e && (e.name === 'item' || e.type === 'object') && e.position && bot.entity.position.distanceTo(e.position) < 32
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${droppedItems.length} dropped item entities within 32m:`);
for (const item of droppedItems) {
  console.log(`  Item at ${lib.fmt(item.position)}, dist=${bot.entity.position.distanceTo(item.position).toFixed(1)}m`);
}

// 2. Approach and collect each item cluster
for (const item of droppedItems) {
  if (isCancelled()) break;
  if (!bot.entities[item.id]) continue; // already collected
  console.log(`Collecting item at ${lib.fmt(item.position)}...`);
  try {
    await lib.goTo(item.position.x, item.position.y, item.position.z, 1, { timeoutMs: 12000 });
    await sleep(300);
    await lib.pickup(4);
  } catch (err) {
    console.log('Collect note:', err.message);
    // Try moving near
    try {
      await lib.goToXZ(item.position.x, item.position.z, { timeoutMs: 8000 });
      await lib.pickup(4);
    } catch (e2) {}
  }
}

// 3. Equip recovered armor and tools
await lib.equipArmor();

// 4. Eat food if in inventory
const foods = bot.inventory.items().filter(i => 
  ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef'].includes(i.name)
);
for (const f of foods) {
  while (bot.food < 20 && bot.inventory.count(f.type) > 0) {
    console.log(`Eating ${f.name}...`);
    try { await globalThis.safeEat(f.name); } catch (e) { break; }
  }
}

// 5. Check if Gamma arrived
const gamma = bot.players['gamma'];
if (gamma && gamma.entity) {
  console.log(`Gamma arrived! At ${lib.fmt(gamma.entity.position)}, dist=${bot.entity.position.distanceTo(gamma.entity.position).toFixed(1)}m`);
}

bot.chat(`team: Alpha recovered inventory! Tools: ${JSON.stringify(lib.tools())}, HP: ${bot.health}/20, Food: ${bot.food}/20.`);

console.log('Current inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
