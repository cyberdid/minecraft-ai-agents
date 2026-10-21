// Agree in chat
bot.chat("Agreed alpha! I will clear and prep the foundation at (40, 79, -21) and gather stone.");

// Check hostiles
const hostiles = globalThis.getNearbyHostiles(16);
if (hostiles.length > 0) {
  console.log(`Warning: ${hostiles.length} hostiles nearby:`, hostiles.map(h => `${h.name} at ${h.position.floored()}`));
} else {
  console.log('No hostiles within 16 blocks.');
}

// Survey the build site: X: [37..43], Z: [-24..-18]
console.log('Surveying building plot around (40, 79, -21)...');
const plotInfo = [];
for (let x = 37; x <= 43; x++) {
  for (let z = -24; z <= -18; z++) {
    for (let y = 85; y >= 75; y--) {
      const pos = bot.entity.position.clone().set(x, y, z);
      const b = bot.blockAt(pos);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        plotInfo.push({ x, z, surfaceY: y, blockName: b.name });
        break;
      }
    }
  }
}

console.log(`Plot surveyed (${plotInfo.length} surface columns).`);
const yVals = plotInfo.map(p => p.surfaceY);
const minY = Math.min(...yVals);
const maxY = Math.max(...yVals);
console.log(`Elevation range on plot: Y=${minY} to Y=${maxY}`);

// Also find nearby wood
const wood = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 16,
  count: 8
});
console.log(`Nearby logs (${wood.length}):`, wood.map(p => `${p.x},${p.y},${p.z}`));

return { minY, maxY, woodFound: wood.length, hostiles: hostiles.length };
