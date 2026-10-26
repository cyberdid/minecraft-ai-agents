// programs/256-staircase-out-and-check-beta.js
console.log('=== Program 256: Staircase Out & Check Beta Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

// 1. Dig stairs forward (+z direction towards -69, -68)
const p = bot.entity.position.floored();
console.log('Digging 2-high stair steps forward at z=-69...');
for (const pt of [
  new Vec3(p.x, p.y + 1, p.z + 1),
  new Vec3(p.x, p.y + 2, p.z + 1),
  new Vec3(p.x, p.y + 2, p.z + 2),
  new Vec3(p.x, p.y + 3, p.z + 2)
]) {
  const blk = bot.blockAt(pt);
  if (blk && blk.name !== 'air') {
    console.log(`Digging ${blk.name} at ${lib.fmt(pt)}`);
    try { await lib.dig(pt.x, pt.y, pt.z); } catch (e) {}
  }
}

// Walk forward up the stairs
try {
  await lib.walkTo(p.x, p.z + 2);
  console.log('Walked up stairs! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk note:', e.message);
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

bot.chat(`beta: Obsidian update? Portal frame missing: ${JSON.stringify(mat.missing)}. Light ready!`);
console.log('Alpha pos now:', lib.fmt(bot.entity.position));
