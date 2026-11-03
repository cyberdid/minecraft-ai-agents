// programs/453-find-all-containers.js
console.log('=== FIND ALL CONTAINERS AROUND BASE ===');

const containers = bot.findBlocks({
  matching: b => b && (b.name.includes('chest') || b.name.includes('barrel') || b.name.includes('furnace')),
  maxDistance: 24,
  count: 20
});

console.log(`Found ${containers.length} containers nearby:`);

for (const cpos of containers) {
  const b = bot.blockAt(cpos);
  console.log(`- ${b.name} at ${lib.fmt(cpos)}`);
  try {
    if (b.name.includes('chest') || b.name.includes('barrel')) {
      const c = await bot.openContainer(b);
      const items = c.items().map(i => `${i.name}x${i.count}`).join(', ');
      console.log(`  Items: ${items || 'empty'}`);
      c.close();
    } else if (b.name.includes('furnace')) {
      const f = await bot.openFurnace(b);
      console.log(`  Input: ${f.inputItem()?.name}x${f.inputItem()?.count || 0}, Fuel: ${f.fuelItem()?.name}x${f.fuelItem()?.count || 0}, Output: ${f.outputItem()?.name}x${f.outputItem()?.count || 0}`);
      f.close();
    }
  } catch (e) {
    console.log(`  Error opening: ${e.message}`);
  }
}
