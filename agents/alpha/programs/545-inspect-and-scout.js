// programs/545-inspect-and-scout.js
console.log('=== Program 545: Inspect & Scout Around Alpha ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)} dist=${d.toFixed(1)}m`);
  } else if (name !== 'alpha') {
    console.log(`Teammate ${name}: not in visual range`);
  }
}

// 2. Hostiles
const hostiles = lib.hostiles(24);
console.log(`Hostiles in 24m: ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

// 3. Fire / Soul Fire within 16m
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire' || b.name === 'lava'),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${fires.length} dangerous blocks (fire/soul_fire/lava) within 16m:`);
for (const fp of fires) {
  console.log(`  ${bot.blockAt(fp)?.name} at ${lib.fmt(fp)} (dist ${bot.entity.position.distanceTo(fp).toFixed(1)}m)`);
}

// 4. Check terrain towards WP 1 (63, 65, -5)
console.log('Block underfoot:', bot.blockAt(bot.entity.position.offset(0, -1, 0))?.name);
