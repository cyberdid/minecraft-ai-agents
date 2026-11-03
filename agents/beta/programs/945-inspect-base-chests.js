console.log('=== Program 945: Inspect Base Chests & Team Inventory ===');
globalThis.isProgramCancelled = isCancelled;

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openChest(chestBlock);
  console.log('Chest (293, 72, -57) contents:');
  for (const item of chest.containerItems()) {
    console.log(`  ${item.name} x${item.count}`);
  }
  chest.close();
}

// Check if there are other chests nearby
const otherChests = bot.findBlocks({ matching: b => b && b.name.includes('chest'), maxDistance: 16 });
console.log(`Chests within 16m: ${otherChests.length}`);
for (const cp of otherChests) {
  console.log(`  Chest at ${lib.fmt(cp)}`);
}

// Teammates in base
for (const p of Object.values(bot.players)) {
  if (p.entity && p.username !== bot.username) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'none'}`);
  }
}

console.log('Beta inventory:', JSON.stringify(lib.inv()));
return {
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  blaze_rods: lib.count('blaze_rod')
};
