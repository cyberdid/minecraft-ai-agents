// programs/019-check-shaft-entrance.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Open door and step outside
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlock) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -52));

// Close door behind
const doorBlockAfter = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlockAfter && doorBlockAfter._properties?.open === 'true') {
  await bot.activateBlock(doorBlockAfter);
  await sleep(300);
}

console.log('Outside base at', lib.fmt(bot.entity.position));

// Walk to mine shaft entrance at (302, 71, -44)
await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 1));
console.log('At mine shaft entrance:', lib.fmt(bot.entity.position));

// Check nearby players (Beta!)
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat('gamma at main mine shaft entrance (302, 71, -44). Looking for Beta and coal!');
