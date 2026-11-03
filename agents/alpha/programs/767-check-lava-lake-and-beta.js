// programs/767-check-lava-lake-and-beta.js
console.log('=== Program 767: Check Base Items & Scout Lava Lake ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health);

// 1. Check ground items in base
const items = Object.values(bot.entities).filter(e =>
  e.name === 'item' && e.position && e.position.distanceTo(bot.entity.position) < 16
);
console.log(`Ground items nearby (${items.length}):`);
for (const it of items) {
  console.log(` - Item at ${lib.fmt(it.position)}`);
}

// 2. Check Beta
const beta = bot.players['beta']?.entity;
if (beta) {
  console.log(`Beta at ${lib.fmt(beta.position)}, held: ${beta.heldItem?.name}`);
}

// 3. Check distance and blocks toward (286, 18, 8)
const lavaLake = new Vec3(286, 18, 8);
const lavasNearLake = bot.findBlocks({
  matching: mcData.blocksByName.lava.id,
  maxDistance: 128,
  count: 50,
  point: lavaLake
});
console.log(`Lava blocks near (286, 18, 8): ${lavasNearLake.length}`);
if (lavasNearLake.length > 0) {
  console.log('Sample lava blocks near lake:', lavasNearLake.slice(0, 5).map(p => lib.fmt(p)));
}

// 4. Check if Alpha can craft another bucket (any iron in furnace?)
const fb = bot.blockAt(new Vec3(295, 72, -55));
let ironIngots = 0;
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace: in=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, out=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    if (f.outputItem()?.name === 'iron_ingot') {
      ironIngots = f.outputItem().count;
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

console.log('Iron ingots collected from furnace:', ironIngots);
console.log('Alpha inventory now:', lib.inv());

return {
  ironIngots,
  lavasNearLake: lavasNearLake.length,
  inv: lib.inv()
};
