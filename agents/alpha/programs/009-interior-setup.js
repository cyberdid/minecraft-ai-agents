// programs/009-interior-setup.js
// Place furnace inside base, survey interior blocks and coordinate with beta

console.log('alpha at:', lib.fmt(bot.entity.position));

// Place furnace at (293, 72, -57) or (295, 72, -57)
if (lib.count('furnace') > 0) {
  const candidateSpots = [
    { x: 293, y: 72, z: -57 },
    { x: 295, y: 72, z: -57 },
    { x: 293, y: 72, z: -55 },
    { x: 295, y: 72, z: -55 }
  ];
  for (const s of candidateSpots) {
    const b = lib.blockAt(s.x, s.y, s.z);
    if (!b || b.boundingBox !== 'block') {
      try {
        console.log(`Placing furnace at ${lib.fmt(s)}...`);
        await lib.place('furnace', s.x, s.y, s.z);
        console.log('Furnace placed successfully at:', lib.fmt(s));
        break;
      } catch (e) {
        console.log(`Failed placing at ${lib.fmt(s)}:`, e.message);
      }
    }
  }
}

// Survey interior blocks (293..295, 72, -57..-55)
const interior = [];
for (let x = 292; x <= 296; x++) {
  for (let z = -58; z <= -54; z++) {
    for (let y = 72; y <= 74; y++) {
      const b = lib.blockAt(x, y, z);
      if (b && !['cobblestone', 'oak_planks', 'air'].includes(b.name)) {
        interior.push(`${b.name} at (${x}, ${y}, ${z})`);
      }
    }
  }
}
console.log('Special blocks in/around base:\n' + interior.join('\n'));

bot.chat('alpha: Inside shelter with beta! Furnace placed. Do we have coal/wool?');

const time = lib.time();
console.log('Time phase:', time.phase, 'timeOfDay:', time.timeOfDay, 'canSleep:', time.canSleep);
console.log('Nearby hostiles (16):', JSON.stringify(lib.hostiles(16)));

return {
  interior,
  time,
  hostiles: lib.hostiles(16)
};
