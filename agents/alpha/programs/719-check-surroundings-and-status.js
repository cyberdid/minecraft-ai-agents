// programs/719-check-surroundings-and-status.js
console.log('=== Program 719: Check Surroundings and Status ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Check inventory and armor slots
console.log('Inventory items:');
for (const item of bot.inventory.items()) {
  console.log(` - slot ${item.slot}: ${item.name} x${item.count}`);
}
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Armor:', {
  head: bot.inventory.slots[5]?.name,
  torso: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name
});

// Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${dist}m), held: ${p.entity.heldItem?.name}`);
  }
}

// Check nearby entities (piglins, endermen, items, blazes)
const entities = Object.values(bot.entities).filter(e => e.isValid && e !== bot.entity);
const items = entities.filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 15);
const piglins = entities.filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 30);
const endermen = entities.filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 30);
const blazes = entities.filter(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 30);

console.log(`Nearby items (${items.length}):`);
for (const it of items) {
  console.log(` - item at ${lib.fmt(it.position)} dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

console.log(`Nearby piglins (${piglins.length}):`);
for (const pig of piglins) {
  console.log(` - piglin at ${lib.fmt(pig.position)} dist ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}

console.log(`Nearby endermen (${endermen.length}):`);
for (const end of endermen) {
  console.log(` - enderman at ${lib.fmt(end.position)} dist ${bot.entity.position.distanceTo(end.position).toFixed(1)}m`);
}

console.log(`Nearby blazes (${blazes.length}):`);
for (const b of blazes) {
  console.log(` - blaze at ${lib.fmt(b.position)} dist ${bot.entity.position.distanceTo(b.position).toFixed(1)}m`);
}

// Check blocks nearby
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 24,
  count: 10
});
console.log(`Nether gold ores found nearby (${goldOres.length}):`);
for (const p of goldOres) {
  console.log(` - ore at ${lib.fmt(p)} dist ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

return { hp: bot.health, food: bot.food, pos: bot.entity.position, inv: lib.inv() };
