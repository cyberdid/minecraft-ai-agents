const cur = bot.entity.position;
const feet = cur.floored();
console.log('Current exact position:', lib.fmt(cur), 'feet:', lib.fmt(feet));

// Print all blocks in 5x5 around bot at feet level and eye level
const blocks = [];
for (let y = feet.y - 1; y <= feet.y + 2; y++) {
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const p = feet.offset(dx, y - feet.y, dz);
      const b = bot.blockAt(p);
      if (b && b.boundingBox === 'block') {
        blocks.push(`dy=${y - feet.y} (${dx},${dz}): ${b.name}`);
      }
    }
  }
}
console.log('Surrounding solid blocks:\n' + blocks.join('\n'));

// Now dig out everything at dy=0, dy=1, dy=2 in front of the bot (dx <= 0, dz >= 0) to ensure a wide open escape path!
for (let y = feet.y + 2; y >= feet.y; y--) {
  for (let dx = -2; dx <= 1; dx++) {
    for (let dz = -1; dz <= 2; dz++) {
      const p = new Vec3(feet.x + dx, y, feet.z + dz);
      const b = bot.blockAt(p);
      if (b && (b.name === 'sand' || b.name === 'dirt' || b.name === 'oak_planks' || b.name === 'sandstone')) {
        console.log(`Clearing ${b.name} at ${lib.fmt(p)}`);
        try {
          await lib.dig(p.x, p.y, p.z);
        } catch (e) {
          console.log(`Could not dig ${lib.fmt(p)}: ${e.message}`);
        }
      }
    }
  }
}

// Pick up all dropped items!
await lib.pickup(6);
console.log('Items picked up. Inventory now:', JSON.stringify(lib.inv()));

// Move with { dig: true } towards (25, 65, -35)
console.log('Moving to open terrain with { dig: true }...');
await lib.goTo(25, 66, -35, 2, { dig: true });
console.log('Successfully reached open terrain! Pos:', lib.fmt(bot.entity.position));

return lib.status();
