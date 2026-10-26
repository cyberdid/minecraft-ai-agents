// programs/193-check-chat-and-gear.js
console.log('--- Checking Chat, Armor, and Nearby Resources ---');

// 1. Check Alpha's armor
const armorSlots = {
  head: bot.inventory.slots[5],
  torso: bot.inventory.slots[6],
  legs: bot.inventory.slots[7],
  feet: bot.inventory.slots[8],
  offhand: bot.inventory.slots[45]
};
console.log('Alpha armor:');
for (const [slot, item] of Object.entries(armorSlots)) {
  console.log(`  ${slot}: ${item ? item.name : 'empty'}`);
}

// 2. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    console.log(`Player ${name} pos: ${p.entity ? lib.fmt(p.entity.position) : 'unknown'}, held: ${p.entity?.heldItem?.name}`);
  }
}

// 3. Scan entities up to 80 blocks for animals
const animals = ['cow', 'pig', 'sheep', 'chicken'];
const targets = Object.values(bot.entities)
  .filter(e => e && animals.includes(e.name) && e.position)
  .map(e => ({
    name: e.name,
    dist: e.position.distanceTo(bot.entity.position).toFixed(1),
    pos: lib.fmt(e.position)
  }))
  .sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));

console.log(`Found ${targets.length} animals within 80 blocks:`, JSON.stringify(targets.slice(0, 5)));

// 4. Check oak leaves nearby (for apples)
const oakLeaves = bot.findBlocks({
  matching: b => b.name === 'oak_leaves',
  maxDistance: 32,
  count: 10
});
console.log(`Found ${oakLeaves.length} oak leaves within 32 blocks.`);

console.log('Time info:', JSON.stringify(lib.time()));
