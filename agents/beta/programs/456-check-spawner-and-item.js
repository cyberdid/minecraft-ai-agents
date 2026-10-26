// programs/456-check-spawner-and-item.js
console.log('Item 303 name:', mcData.items[303]?.name);

const spawnerPos = new Vec3(32, 68, -190);
const block = bot.blockAt(spawnerPos);
console.log('Block at (32, 68, -190):', block?.name);

// Check path or terrain between (44, 65, -129) and (32, 68, -190)
// Also check the wither skeleton exact location
for (const e of Object.values(bot.entities)) {
  if (e.name === 'wither_skeleton') {
    console.log(`Wither skeleton at ${lib.fmt(e.position)}, dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}m`);
  }
}
