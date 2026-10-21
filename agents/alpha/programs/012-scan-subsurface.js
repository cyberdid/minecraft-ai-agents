// programs/012-scan-subsurface.js
// Scan the subsurface directly underneath the base (y=71 down to 50)

console.log('Scanning subsurface below base floor (x: 292..296, z: -58..-54)...');

let airBlocks = 0;
let waterBlocks = 0;
let lavaBlocks = 0;
const ores = [];

for (let y = 71; y >= 50; y--) {
  for (let x = 292; x <= 296; x++) {
    for (let z = -58; z <= -54; z++) {
      const b = lib.blockAt(x, y, z);
      if (!b) continue;
      if (b.name === 'air' || b.name === 'cave_air') {
        airBlocks++;
      } else if (b.name === 'water') {
        waterBlocks++;
      } else if (b.name === 'lava') {
        lavaBlocks++;
      } else if (b.name.includes('ore')) {
        ores.push(`${b.name} at (${x}, ${y}, ${z})`);
      }
    }
  }
}

console.log(`Subsurface scan under 5x5 footprint (y: 71..50):`);
console.log(`Air blocks: ${airBlocks}`);
console.log(`Water blocks: ${waterBlocks}`);
console.log(`Lava blocks: ${lavaBlocks}`);
console.log(`Ores found directly below base:\n` + (ores.length ? ores.join('\n') : 'none'));

// Also check coal nearby in 15 blocks
const coal = lib.find('coal_ore', { maxDistance: 15, count: 5 });
console.log('Coal within 15 blocks:');
coal.forEach(c => console.log(`  (${c.position.x}, ${c.position.y}, ${c.position.z}) dist: ${bot.entity.position.distanceTo(c.position).toFixed(1)}`));

const time = lib.time();
console.log('Time:', time.phase, 'timeOfDay:', time.timeOfDay);
console.log('Hostiles within 16:', JSON.stringify(lib.hostiles(16)));

return {
  air: airBlocks,
  water: waterBlocks,
  lava: lavaBlocks,
  ores: ores,
  coalNearby: coal.map(c => lib.fmt(c.position)),
  time: time
};
