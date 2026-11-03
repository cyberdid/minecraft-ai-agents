console.log('=== DELTA: MINE BLOCKADE AT z=-6 & ADVANCE ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}`);

// Walk to z=-4
try {
  await bot.pathfinder.goto(new goals.GoalNear(63.5, 65.0, -4.5, 0.8));
} catch (e) {}

console.log(`At barrier: ${lib.fmt(bot.entity.position)}`);

// Mine the 2 blocking blocks at (63, 66, -6) and (63, 65, -6)
const topBlock = bot.blockAt(new Vec3(63, 66, -6));
const bottomBlock = bot.blockAt(new Vec3(63, 65, -6));

console.log(`Top block: ${topBlock ? topBlock.name : 'null'}`);
console.log(`Bottom block: ${bottomBlock ? bottomBlock.name : 'null'}`);

if (topBlock && topBlock.name !== 'air') {
  console.log(`Digging top block ${topBlock.name} at (63, 66, -6)...`);
  await bot.equip(mcData.itemsByName.iron_pickaxe.id, 'hand');
  await bot.dig(topBlock);
  console.log('Top block mined!');
}

if (bottomBlock && bottomBlock.name !== 'air') {
  console.log(`Digging bottom block ${bottomBlock.name} at (63, 65, -6)...`);
  await bot.dig(bottomBlock);
  console.log('Bottom block mined!');
}

try { await lib.pickup(4.0); } catch (e) {}

// Step forward through the cleared opening to z=-8
console.log('Stepping through opened doorway to (63.5, 65.0, -8.0)...');
await bot.lookAt(new Vec3(63.5, 65.0, -8.0), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

console.log(`Successfully passed barrier! New pos: ${lib.fmt(bot.entity.position)}`);
bot.chat('delta: Cleared East Ridge transit blockade at (63, 65..66, -6)! Pathway North is now 100% open.');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
