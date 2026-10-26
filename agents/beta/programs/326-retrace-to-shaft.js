// programs/326-retrace-to-shaft.js
console.log('=== Step: Retrace path down cave to lava lake junction and up main shaft ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Unstuck if needed
const p = bot.entity.position;
const bx = Math.floor(p.x);
const by = Math.floor(p.y);
const bz = Math.floor(p.z);
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');

// Clear any block around head or feet that could wedge
for (const dy of [0, 1]) {
  for (const [dx, dz] of [[0,0], [1,0], [-1,0], [0,1], [0,-1]]) {
    const blk = bot.blockAt(new Vec3(bx + dx, by + dy, bz + dz));
    if (blk && blk.boundingBox === 'block' && bot.entity.position.distanceTo(blk.position) < 1.2) {
      console.log(`Clearing wedge block at ${lib.fmt(blk.position)} (${blk.name})...`);
      await bot.dig(blk);
    }
  }
}

// 2. Walk down cave towards (297, 30, 12)
console.log('Walking down cave to (297, 30, 12)...');
try {
  await lib.goTo(297, 30, 12, 2, { timeoutMs: 25000 });
  console.log('Reached (297, 30, 12):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Cave walk note:', e.message);
}

// 3. Walk to lava lake junction at (288, 19, 8)
console.log('Walking to lava lake junction (288, 19, 8)...');
try {
  await lib.goTo(288, 19, 8, 3, { timeoutMs: 25000 });
  console.log('At lava lake junction:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Lava junction note:', e.message);
}

// 4. Walk to shaft connection at (299, 27, -30)
console.log('Walking to shaft connection (299, 27, -30)...');
try {
  await lib.goTo(299, 27, -30, 3, { timeoutMs: 25000 });
  console.log('At shaft connection (299, 27, -30):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft connection note:', e.message);
}

// 5. Ascend shaft to (304, 54, -34)
console.log('Ascending shaft to (304, 54, -34)...');
try {
  await lib.goTo(304, 54, -34, 3, { timeoutMs: 30000 });
  console.log('At shaft y=54:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft y=54 note:', e.message);
}

// 6. Ascend to surface shaft top (302, 71, -44)
console.log('Ascending to surface shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 30000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Surface top note:', e.message);
}

console.log('Final position:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Position update: ${lib.fmt(bot.entity.position)}. Holding 10 obsidian & flint/steel!`);
