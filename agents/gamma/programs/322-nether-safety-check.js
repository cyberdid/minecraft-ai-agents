// programs/322-nether-safety-check.js
console.log('=== NETHER SAFETY CHECK ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check ground and standing block
const feet = bot.entity.position.floored();
console.log('Block at feet:', bot.blockAt(feet)?.name);
console.log('Block under feet:', bot.blockAt(feet.offset(0, -1, 0))?.name);
console.log('Block at head:', bot.blockAt(feet.offset(0, 1, 0))?.name);

// Check fire/lava within 4 blocks
const hazards = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire' || b.name.includes('lava')),
  maxDistance: 6,
  count: 10
});
console.log(`Hazards nearby (${hazards.length}):`, hazards.map(p => `${bot.blockAt(p)?.name} at ${lib.fmt(p)}`));

// If on fire, extinguish
for (const p of hazards) {
  const b = bot.blockAt(p);
  if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
    try {
      console.log(`Extinguishing ${b.name} at ${lib.fmt(p)}...`);
      await bot.dig(b);
    } catch (e) {}
  }
}

// Check nearby hostiles
const hostiles = lib.hostiles(16);
console.log('Hostiles nearby:', JSON.stringify(hostiles));

// Find nearest netherrack/stone to quarry or solid floor
console.log('Netherrack blocks adjacent:');
const netherrack = bot.findBlocks({
  matching: b => b && b.name === 'netherrack',
  maxDistance: 4,
  count: 5
});
console.log(netherrack.map(p => lib.fmt(p)));

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    console.log(`Player ${name} visible at ${lib.fmt(p.entity.position)}`);
  }
}
