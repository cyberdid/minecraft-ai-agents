const feet = bot.entity.position.floored();
console.log('Bot feet at:', lib.fmt(feet));

// Inspect hostiles
const hostiles = lib.hostiles(24);
console.log('Hostiles within 24:', JSON.stringify(hostiles.map(h => ({ name: h.name, pos: lib.fmt(h.pos), dist: Math.round(h.dist) }))));

// Inspect blocks around feet to see if bot is stuck in shelter walls
const stuck = [];
for (let dy = 0; dy <= 1; dy++) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const p = feet.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.boundingBox === 'block') {
        stuck.push({ name: b.name, pos: lib.fmt(p) });
      }
    }
  }
}
console.log('Solid blocks around bot body:', JSON.stringify(stuck));

// Dig away blocks directly in front or beside to open a wide clear exit
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = 0; dz <= 2; dz++) {
    for (let dy = 0; dy <= 1; dy++) {
      const p = feet.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && (b.name === 'dirt' || b.name === 'oak_planks')) {
        console.log('Digging obstacle:', b.name, 'at', lib.fmt(p));
        await lib.dig(p.x, p.y, p.z);
      }
    }
  }
}

// Now take short manual walks away from shelter and creeper
console.log('Stepping out into the open...');
// Let's walk towards z = -40 (open area)
await lib.goToXZ(feet.x, feet.z + 5);
console.log('Bot now safely in open at:', lib.fmt(bot.entity.position));
