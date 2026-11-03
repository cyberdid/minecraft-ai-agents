// programs/752-find-lava-or-obsidian.js
console.log('=== Program 752: Scan for Lava and Obsidian ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Find any lava blocks up to 128 distance
const lavas = bot.findBlocks({
  matching: b => b && (b.name === 'lava' || b.name.includes('lava')),
  maxDistance: 128,
  count: 20
});

console.log(`Lava blocks within 128m (${lavas.length}):`);
for (const p of lavas.slice(0, 10)) {
  console.log(` - Lava at: ${lib.fmt(p)}, block: ${bot.blockAt(p)?.name}, above: ${bot.blockAt(p.offset(0,1,0))?.name}`);
}

// Find any obsidian blocks up to 64 distance
const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 64,
  count: 20
});
console.log(`Obsidian blocks within 64m (${obs.length}):`);
for (const p of obs) {
  console.log(` - Obsidian at: ${lib.fmt(p)}`);
}

// Check other players' inventories/equipment if visible
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

return { lavas: lavas.length, obs: obs.length };
