// programs/257-walk-out-and-check-beta.js
console.log('=== Program 257: Walk Out & Check Beta Obsidian ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position));

// 1. Walk forward onto the cleared stairs at (336, 23, -68)
try {
  await lib.walkTo(336, -68);
  console.log('Walked onto stairs! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('walkTo note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(336, 23, -68));
  } catch (e2) {}
}

// 2. Check Beta
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

// 3. Check portal frame at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame status:', JSON.stringify(mat));

bot.chat(`beta: Alpha out at y=23! How many obsidian do you hold? Portal frame missing: ${JSON.stringify(mat.missing)}.`);
console.log('Alpha pos now:', lib.fmt(bot.entity.position));
