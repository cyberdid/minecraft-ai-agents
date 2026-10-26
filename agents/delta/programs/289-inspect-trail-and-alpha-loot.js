// programs/289-inspect-trail-and-alpha-loot.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Check chest at (39, 65, -8) contents
try {
  const cb = bot.blockAt(new Vec3(39, 65, -8));
  if (cb) {
    const c = await bot.openContainer(cb);
    const items = c.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
      // Take useful items: cobblestone, swords, pickaxes, food
      if (item.name.includes('pickaxe') || item.name.includes('sword') || item.name.includes('cobble') || item.name.includes('shield')) {
        await c.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name} x${item.count}`);
      }
    }
    c.close();
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

// Check drop at (58, 68, -10)
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 30);
console.log(`Drops within 30m: ${drops.length}`);
for (const d of drops) {
  console.log(`Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}

// Scan ground from (40, 65, -8) to (63, 65, -8)
console.log('Scanning path at z=-8:');
for (let x = 40; x <= 63; x += 2) {
  const b = bot.blockAt(new Vec3(x, 64, -8));
  const bAt = bot.blockAt(new Vec3(x, 65, -8));
  const bAbove = bot.blockAt(new Vec3(x, 66, -8));
  console.log(`x=${x}, z=-8: floor(y=64)=${b?.name}, at(y=65)=${bAt?.name}, above(y=66)=${bAbove?.name}`);
}
