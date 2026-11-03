console.log('=== INSPECT PORTAL SILL AND LAVA ===');
for (let y = 71; y <= 74; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    console.log(`(${x}, ${y}, -54): ${b ? b.name : 'null'}`);
  }
}
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
console.log('Portal active:', portal ? 'YES' : 'NO');

// Check players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}
