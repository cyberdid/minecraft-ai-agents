// programs/467-find-materials.js
console.log('=== Step: Check Base and Chest for Materials ===');

// Check all items on ground in base
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8);
console.log(`Items on ground: ${items.length}`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}:`, JSON.stringify(it.metadata));
  try {
    await lib.goTo(it.position.x, it.position.y, it.position.z, 0.5);
  } catch (e) {}
}

// Check base chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  const chest = await bot.openChest(cb);
  console.log('Chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
  // Take crafting_table if present
  const ct = chest.containerItems().find(i => i.name === 'crafting_table');
  if (ct) await chest.withdraw(ct.type, null, 1);
  chest.close();
}

console.log('Inv:', JSON.stringify(lib.inv()));
