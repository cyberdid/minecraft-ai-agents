const Vec3 = require('vec3');
const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Dawn is approaching! Moving to cabin site (40, 79, -21) to clear ground.");

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.maxDropDown = 3; // avoid fall damage
bot.pathfinder.setMovements(moves);

console.log('Navigating to (40, 79, -21)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(40, 79, -21, 2));
  console.log('Arrived near cabin site. Current pos:', bot.entity.position);
} catch (err) {
  console.log('Pathfinder warning:', err.message);
}

// Survey the 5x5 footprint: X in [38..42], Z in [-23..-19]
console.log('--- Surveying 5x5 Footprint ---');
const obstacles = [];
for (let x = 38; x <= 42; x++) {
  for (let z = -23; z <= -19; z++) {
    for (let y = 83; y >= 79; y--) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        obstacles.push({ pos: b.position, name: b.name, y });
      }
    }
  }
}

console.log(`Found ${obstacles.length} blocks above floor (Y >= 79):`);
for (const o of obstacles) {
  console.log(`- ${o.name} at ${o.pos}`);
}

// Clear soft obstacles like tall grass, flowers, leaves, or dirt above Y=78
let cleared = 0;
for (const o of obstacles) {
  if (isCancelled()) break;
  const b = bot.blockAt(o.pos);
  if (!b || b.name === 'air') continue;
  // If it's plant or dirt/grass above ground, clear it
  if (b.name.includes('grass') || b.name.includes('flower') || b.name.includes('fern') || b.name.includes('leaves') || (b.name === 'dirt' && o.y > 78)) {
    console.log(`Clearing ${b.name} at ${b.position}...`);
    try {
      await globalThis.digBlockAt(b.position);
      cleared++;
    } catch (e) {
      console.log(`Failed to clear ${b.name} at ${b.position}:`, e.message);
    }
  }
}

console.log(`Cleared ${cleared} obstacle block(s).`);
await globalThis.collectDrops(6);

const finalPos = bot.entity.position;
console.log('Beta pos now:', finalPos, 'Time:', bot.time.timeOfDay);

return { finalPos, cleared, remainingObstacles: obstacles.length - cleared };
