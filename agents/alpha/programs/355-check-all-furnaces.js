// programs/355-check-all-furnaces.js
console.log('=== Program 355: Check Furnace 2 & 3 ===');

const fPositions = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const p of fPositions) {
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    const f = await bot.openFurnace(b);
    const inItem = f.inputItem();
    const fuel = f.fuelItem();
    const outItem = f.outputItem();
    console.log(`Furnace at ${lib.fmt(p)}: in=${inItem?.name}x${inItem?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${outItem?.name}x${outItem?.count}`);
    if (outItem && outItem.name === 'iron_ingot') {
      console.log(`Collecting ${outItem.count} iron_ingot from furnace!`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(p)} note:`, e.message);
  }
}

console.log('Alpha iron_ingots count:', lib.count('iron_ingot'));

if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots!');
  await lib.craft('iron_boots', 1);
  await lib.equipArmor();
  console.log('CRAFTED AND EQUIPPED IRON BOOTS!');
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha status: ${JSON.stringify(lib.tools())}, wearing: iron_helmet, iron_chestplate, iron_leggings.`);
