// programs/563-find-gravel-and-iron.js
console.log('=== FIND GRAVEL AND IRON ORES NEARBY ===');
const gravels = bot.findBlocks({
  matching: b => b && b.name === 'gravel',
  maxDistance: 32,
  count: 10
});
console.log('Found gravel blocks:', gravels.length);
for (const gp of gravels) {
  console.log(`Gravel at ${lib.fmt(gp)}`);
}

const irons = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 10
});
console.log('Found iron ore blocks:', irons.length);
for (const ip of irons) {
  console.log(`Iron ore at ${lib.fmt(ip)}`);
}

const golds = bot.findBlocks({
  matching: b => b && (b.name === 'gold_ore' || b.name === 'deepslate_gold_ore'),
  maxDistance: 32,
  count: 10
});
console.log('Found gold ore blocks:', golds.length);
for (const gp of golds) {
  console.log(`Gold ore at ${lib.fmt(gp)}`);
}
