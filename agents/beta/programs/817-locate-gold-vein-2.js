// programs/817-locate-gold-vein-2.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 817: Locate Vein 2 at z=-114 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Step to (46, 65, -120)
try {
  await lib.goTo(46, 65, -120, 1.2, { timeoutMs: 5000 });
} catch (e) {}

console.log('Pos at z=-120:', lib.fmt(bot.entity.position));

const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_block'),
  maxDistance: 24,
  count: 20
});
console.log(`Found ${ores.length} gold ores near z=-114:`, ores.map(p => `${lib.fmt(p)} dist=${bot.entity.position.distanceTo(p).toFixed(1)}`).join(', '));

// Also check the Piglin at (45, 67, -151)
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 32);
console.log(`Piglins tracked (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

// Check teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates nearby:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));
