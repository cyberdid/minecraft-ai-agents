console.log('=== Nearby Resources Check ===');
const logs = lib.find('*_log', { maxDistance: 64, count: 10 });
console.log('Logs found nearby:');
for (const l of logs) {
  console.log(`  ${l.name} at ${l.position}, dist ${bot.entity.position.distanceTo(l.position).toFixed(1)}m`);
}

const stones = lib.find('stone', { maxDistance: 32, count: 5 });
console.log('Stone found nearby:', stones.length);
for (const s of stones) {
  console.log(`  stone at ${s.position}, dist ${bot.entity.position.distanceTo(s.position).toFixed(1)}m`);
}

// Check chests inside base
const chests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 10 });
console.log('Chests nearby:', chests);
for (const cPos of chests) {
  const cb = bot.blockAt(cPos);
  try {
    const c = await bot.openChest(cb);
    console.log(`Chest at ${cPos} items:`);
    for (const item of c.containerItems()) {
      console.log(`  ${item.name} x${item.count}`);
    }
    await c.close();
  } catch (e) {
    console.log(`Could not open chest at ${cPos}:`, e.message);
  }
}
