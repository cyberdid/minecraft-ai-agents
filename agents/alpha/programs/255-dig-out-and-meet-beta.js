// programs/255-dig-out-and-meet-beta.js
console.log('=== Program 255: Unseal Hole & Ascend to Base Portal Site ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position));

// 1. Dig out the ceiling above head
const pos = bot.entity.position.floored();
for (let dy = 1; dy <= 3; dy++) {
  const p = pos.offset(0, dy, 0);
  const blk = bot.blockAt(p);
  console.log(`Checking above at ${lib.fmt(p)}: ${blk?.name}`);
  if (blk && blk.name !== 'air') {
    console.log(`Digging ${blk.name} at ${lib.fmt(p)}...`);
    try {
      await lib.dig(p.x, p.y, p.z);
    } catch (e) {}
  }
}

// Jump / step up to y=23
try {
  await bot.pathfinder.goto(new goals.GoalBlock(pos.x, pos.y + 2, pos.z));
  console.log('Stepped up! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step up note:', e.message);
}

// 2. Chat with Beta and Delta
bot.chat('delta: Alpha heading up to base portal site (298, 72, -54)! Please check base chest for food. Beta has 3/10 obsidian mining the rest!');

// 3. Ascend to base
console.log('Ascending to base...');
const route = [
  { x: 335, y: 35, z: -65 },
  { x: 345, y: 65, z: -40 },
  { x: 298, y: 72, z: -54 }
];

for (let i = 0; i < route.length; i++) {
  if (isCancelled()) break;
  const target = route[i];
  try {
    await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 25000 });
    console.log(`Reached step ${i+1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Step ${i+1} note:`, e.message);
  }
}

console.log('Alpha pos now:', lib.fmt(bot.entity.position));
// Inspect portal frame
const frame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal frame status:', JSON.stringify(lib.materials(frame)));
bot.chat(`beta: Alpha at base portal site (298, 72, -54). Waiting for the 10 obsidian!`);
