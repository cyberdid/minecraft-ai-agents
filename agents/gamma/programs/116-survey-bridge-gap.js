// programs/116-survey-bridge-gap.js
console.log('--- SURVEYING BRIDGE GAP TO NETHERRACK MOUNTAIN ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Scan x=42..46, y=64..68, z=-133..-145
console.log('Scanning blocks ahead from z=-133 to z=-145:');
for (let z = -133; z >= -145; z--) {
  let row = `z=${z}: `;
  for (let x = 42; x <= 46; x++) {
    const floor = bot.blockAt(new Vec3(x, 64, z))?.name || 'air';
    const atFeet = bot.blockAt(new Vec3(x, 65, z))?.name || 'air';
    const atHead = bot.blockAt(new Vec3(x, 66, z))?.name || 'air';
    row += `[x=${x}: fl=${floor.slice(0, 4)}, ft=${atFeet.slice(0, 4)}] `;
  }
  console.log(row);
}

// 2. Check teammates visible
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

// 3. Spawner distance check
const spawner = new Vec3(32, 68, -190);
console.log(`Blaze Spawner at ${lib.fmt(spawner)} is ${spawner.distanceTo(bot.entity.position).toFixed(1)}m away`);

bot.chat(`gamma surveyed bridge gap from z=-133 to -145. Delta is with me at (44, 65, -129). Alpha & Beta, meet us at (44, 65, -133)!`);
