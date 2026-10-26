// programs/454-inspect-bunker-and-delta.js
console.log('=== Step: Inspect Bunker Interior & Delta ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check Delta entity
const delta = bot.players['delta']?.entity;
if (delta) {
  console.log('Delta entity found at', lib.fmt(delta.position));
  console.log('Delta held item:', delta.heldItem ? delta.heldItem.name : 'empty');
  console.log('Delta equipment:', delta.equipment?.map(e => e ? e.name : 'empty'));
} else {
  console.log('Delta entity not found!');
}

// 2. Check Alpha entity
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha entity found at', lib.fmt(alpha.position));
  console.log('Alpha held item:', alpha.heldItem ? alpha.heldItem.name : 'empty');
}

// 3. Scan all containers / functional blocks in 8m radius
const containers = ['chest', 'trapped_chest', 'barrel', 'crafting_table', 'furnace'];
for (const c of containers) {
  const id = mcData.blocksByName[c]?.id;
  if (!id) continue;
  const found = bot.findBlocks({ matching: id, maxDistance: 8, count: 5 });
  console.log(`${c} count: ${found.length}`);
  for (const p of found) {
    console.log(`  ${c} at ${lib.fmt(p)}`);
  }
}

// 4. Check all dropped items within 12m
const items = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 12
);
console.log(`Dropped items within 12m (${items.length}):`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  console.log(`  Item at ${lib.fmt(it.position)} dist=${d.toFixed(1)}m`);
}

// 5. Ask Delta for food and tools in chat
bot.chat('delta: please toss cooked food, tools, and spare blocks to beta and alpha!');
