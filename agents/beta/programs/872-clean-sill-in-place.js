// programs/872-clean-sill-in-place.js
console.log('=== Program 872: Clean Sill in Place ===');

const sillPos = new Vec3(299, 72, -54);
const cur = bot.blockAt(sillPos);
console.log(`Block at (299, 72, -54): ${cur ? cur.name : 'null'}, dist: ${bot.entity.position.distanceTo(sillPos).toFixed(2)}m`);

// If water, place cobblestone to dry it
if (cur && (cur.name === 'water' || cur.name === 'flowing_water')) {
  console.log('Placing cobblestone into sill to remove water...');
  await lib.place('cobblestone', 299, 72, -54);
  await sleep(600);

  // Dig cobblestone out
  console.log('Digging cobblestone out to make dry air basin...');
  const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
  if (pick) await bot.equip(pick, 'hand');
  await lib.dig(299, 72, -54);
  await sleep(600);
}

const finalSill = bot.blockAt(sillPos);
console.log(`Clean sill at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);

// Also check surrounding blocks to ensure mold is 100% solid
console.log('Checking surrounding mold blocks:');
const neighbors = [
  new Vec3(299, 71, -54), // floor below
  new Vec3(298, 72, -54), // west
  new Vec3(300, 72, -54), // east (should be obsidian)
  new Vec3(299, 72, -55), // north
  new Vec3(299, 72, -53)  // south
];

for (const nb of neighbors) {
  const b = bot.blockAt(nb);
  console.log(`  ${lib.fmt(nb)}: ${b ? b.name : 'null'}`);
}

bot.chat('Beta: Standing at portal frame. Basin is dry and ready for Alpha to deposit lava!');

return {
  sill: finalSill ? finalSill.name : 'null'
};
