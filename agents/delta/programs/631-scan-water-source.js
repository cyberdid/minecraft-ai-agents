console.log('=== SCAN WATER SOURCE AROUND PORTAL ===');
for (let dx = -2; dx <= 2; dx++) {
  for (let dy = -1; dy <= 2; dy++) {
    for (let dz = -2; dz <= 2; dz++) {
      const pos = new Vec3(299 + dx, 72 + dy, -54 + dz);
      const b = bot.blockAt(pos);
      if (b && b.name.includes('water')) {
        console.log(`Water found at ${pos.x}, ${pos.y}, ${pos.z}: metadata = ${b.metadata}`);
      }
    }
  }
}

// Check nearby players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}
