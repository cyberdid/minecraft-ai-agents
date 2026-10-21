bot.chat("Agreed! 5x5 at (15, 67, -15). I will get wood for a pickaxe, then mine cobblestone & coal.");

const alpha = bot.players.alpha?.entity;
console.log('Alpha position:', alpha ? lib.fmt(alpha.position) : 'unknown');

// Search for surface logs within 128 blocks
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 128,
  count: 10
}).filter(p => p.y >= 62);

console.log('Surface logs within 128:', logs.length);
if (logs.length > 0) {
  console.log('Closest surface log:', lib.fmt(logs[0]));
} else {
  // Let's check where leaves are
  const leaves = bot.findBlocks({
    matching: b => b.name.endsWith('_leaves'),
    maxDistance: 128,
    count: 10
  }).filter(p => p.y >= 62);
  console.log('Surface leaves within 128:', leaves.length);
  if (leaves.length > 0) {
    console.log('Closest leaves:', lib.fmt(leaves[0]));
  }
}

// Also collect 16 dirt right here while we check, so we always have dirt for safety!
const dirtBefore = lib.count('dirt');
if (dirtBefore < 16) {
  console.log('Collecting dirt for safety...');
  await lib.collect('dirt', 16 - dirtBefore);
}
console.log('Dirt count now:', lib.count('dirt'));
