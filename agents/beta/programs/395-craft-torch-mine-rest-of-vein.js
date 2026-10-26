// programs/395-craft-torch-mine-rest-of-vein.js
console.log('=== Step: Torch area, collect drops, and finish mining iron vein ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Craft torches from coal + stick
if (lib.count('torch') === 0 && lib.count('coal') > 0 && lib.count('stick') > 0) {
  try {
    const torchRecipe = bot.recipesFor(mcData.itemsByName.torch.id, null, 1, null)[0];
    if (torchRecipe) {
      await bot.craft(torchRecipe, 1, null);
      console.log('Crafted 4 torches! Torch count:', lib.count('torch'));
    }
  } catch (e) {
    console.log('Craft torch error:', e.message);
  }
}

// 2. Place a torch to illuminate
if (lib.count('torch') > 0) {
  try {
    await lib.placeTorch();
    console.log('Placed torch!');
  } catch (e) {
    console.log('Place torch error:', e.message);
  }
}

// 3. Collect all nearby item drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
console.log(`Found ${drops.length} nearby item drops`);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}
console.log(`raw_iron after collecting drops: ${lib.count('raw_iron')}`);

// 4. Scan and mine remaining iron ore blocks within 10 blocks
const remaining = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 10,
  count: 15
});
console.log(`Remaining iron ore blocks to mine: ${remaining.length}`);

for (const p of remaining) {
  if (isCancelled()) break;
  try {
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    console.log(`Mining iron ore at ${lib.fmt(p)}...`);
    await lib.dig(p.x, p.y, p.z);
    console.log(`Mined iron ore at ${lib.fmt(p)}!`);
    await sleep(200);
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
  }
}

// 5. Collect any newly dropped raw_iron
const newDrops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of newDrops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

console.log(`Final raw_iron in inventory: ${lib.count('raw_iron')}`);
bot.chat(`beta: Vein secured! raw_iron in inventory: ${lib.count('raw_iron')}. Health: ${bot.health}/20, pos: ${lib.fmt(bot.entity.position)}.`);
