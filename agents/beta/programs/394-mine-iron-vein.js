// programs/394-mine-iron-vein.js
console.log('=== Step: Mine iron vein at (354, 33, -37) ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Scan for iron ore within 8 blocks
let ironBlocks = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 8,
  count: 20
});
console.log(`Iron ore blocks nearby (${ironBlocks.length}):`);
for (const p of ironBlocks) {
  console.log(`  Iron ore at ${lib.fmt(p)}`);
}

// 2. Mine each block in the vein
let minedCount = 0;
for (const p of ironBlocks) {
  if (isCancelled()) break;
  try {
    console.log(`Mining iron ore at ${lib.fmt(p)}...`);
    // Ensure we equip stone pickaxe
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    
    await lib.dig(p.x, p.y, p.z);
    minedCount++;
    console.log(`Successfully mined ${lib.fmt(p)}!`);
    await sleep(200);
  } catch (err) {
    console.log(`Error mining ${lib.fmt(p)}:`, err.message);
  }
}

// 3. Scan for nearby item drops (raw_iron) and collect them
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
console.log(`Item drops nearby (${drops.length}):`);
for (const d of drops) {
  if (isCancelled()) break;
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {
    console.log('Collect drop note:', e.message);
  }
}

// 4. Also scan again in case digging revealed adjacent iron ore blocks
const moreIron = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 6,
  count: 10
});
for (const p of moreIron) {
  if (isCancelled()) break;
  try {
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(p.x, p.y, p.z);
    minedCount++;
    console.log(`Mined additional vein ore at ${lib.fmt(p)}!`);
  } catch (err) {}
}

console.log(`Mining completed. raw_iron in inventory: ${lib.count('raw_iron')}`);
bot.chat(`beta: Mined iron vein! raw_iron in inventory: ${lib.count('raw_iron')}, pos=${lib.fmt(bot.entity.position)}.`);
