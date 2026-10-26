// programs/306-unstuck-and-climb.js
console.log('=== Free beta and climb to base ===');

// 1. Equip pickaxe and break the block at feet
await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
const stuckBlock = bot.blockAt(new Vec3(315, 48, -32));
if (stuckBlock && stuckBlock.name !== 'air') {
  console.log('Digging stuck block at (315, 48, -32)...');
  await bot.dig(stuckBlock);
}

// Also check block at (315, 49, -32) or surrounding
const headBlock = bot.blockAt(new Vec3(315, 49, -32));
if (headBlock && headBlock.name !== 'air' && headBlock.name !== 'cave_air') {
  console.log('Digging head block at (315, 49, -32)...');
  await bot.dig(headBlock);
}

console.log('Freed! Current pos:', lib.fmt(bot.entity.position), 'onGround:', bot.entity.onGround);

// 2. Jump/walk towards (315, 48, -33) or towards (312, 49, -30)
try {
  await lib.goTo(312, 48, -30, 1, { dig: true, timeoutMs: 15000 });
  console.log('Reached intermediary (312, 48, -30):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Intermediary note:', e.message);
}

// 3. Go to (304, 54, -34)
try {
  await lib.goTo(304, 54, -34, 2, { dig: true, timeoutMs: 25000 });
  console.log('Reached shaft bottom (304, 54, -34):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft bottom note:', e.message);
}
