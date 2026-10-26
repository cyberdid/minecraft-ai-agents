// programs/116-inspect-items-and-bunker.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Inspect bunker blocks around Delta
console.log('--- Bunker surroundings ---');
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dy = -1; dy <= 3; dy++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        // Only log non-air or interesting blocks
        if (b.name.includes('chest') || b.name.includes('table') || b.name.includes('furnace')) {
          console.log(`Special block ${b.name} at ${lib.fmt(p)}`);
        }
      }
    }
  }
}

// 2. Check dropped items in detail
console.log('--- Dropped Items ---');
const items = Object.values(bot.entities).filter(e => e.name === 'item');
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  // Mineflayer entity metadata for items:
  // often metadata[8] or entity.getDroppedItem()
  let itemName = 'unknown';
  let itemCount = 1;
  try {
    if (typeof it.getDroppedItem === 'function') {
      const itemObj = it.getDroppedItem();
      if (itemObj) {
        itemName = itemObj.name;
        itemCount = itemObj.count;
      }
    }
  } catch (e) {}
  
  if (itemName === 'unknown' && it.metadata) {
    for (const val of it.metadata) {
      if (val && typeof val === 'object' && val.itemId !== undefined) {
        const itemDef = mcData.items[val.itemId];
        itemName = itemDef ? itemDef.name : `id:${val.itemId}`;
        itemCount = val.itemCount || 1;
        break;
      }
    }
  }
  console.log(`Item: ${itemCount}x ${itemName} at ${lib.fmt(it.position)} (dist ${d.toFixed(1)}m)`);
}

// 3. Check hostile mobs in detail
console.log('--- Mobs ---');
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob' || e.type === 'hostile');
for (const m of mobs) {
  const d = bot.entity.position.distanceTo(m.position);
  if (d < 35) {
    console.log(`Mob: ${m.name} at ${lib.fmt(m.position)} dist ${d.toFixed(1)}m`);
  }
}
