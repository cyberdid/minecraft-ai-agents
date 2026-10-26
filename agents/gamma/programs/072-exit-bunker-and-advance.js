// programs/072-exit-bunker-and-advance.js
console.log('--- ADVANCING TOWARDS TEAM & FORTRESS ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Check surrounding blocks to find bunker exit
const pos = bot.entity.position.floored();
console.log('Looking for bunker exit around pos...');
let exitSpot = null;

// Search for an open block at y=65 within radius 4 that is outside the portal
for (const [dx, dz] of [[0, 2], [0, -2], [2, 0], [-2, 0], [1, 2], [2, 1], [-2, -1], [2, -2]]) {
  const check = pos.offset(dx, 0, dz);
  const b = bot.blockAt(check);
  const below = bot.blockAt(check.offset(0, -1, 0));
  if (b && (b.name === 'air' || b.name === 'cave_air') && below && below.boundingBox === 'block') {
    exitSpot = check;
    console.log(`Found open path at ${lib.fmt(check)}`);
    break;
  }
}

bot.chat('gamma moving out from bunker towards team waypoint (54, 64, -67)...');

// 2. Waypoint 1: Move towards (48, 65, -35)
console.log('Navigating to Waypoint 1: (48, 65, -35)...');
try {
  await lib.goTo(48, 65, -35, 3, { timeoutMs: 30000 });
  console.log('Reached Waypoint 1 at:', lib.fmt(bot.entity.position));
  
  // Place a torch or marker
  if (lib.count('torch') > 0) {
    try {
      await lib.placeTorch();
      console.log('Placed waypoint torch 1');
    } catch (e) {
      console.log('Torch place note:', e.message);
    }
  }
} catch (e) {
  console.log('Waypoint 1 note:', e.message);
}

// 3. Waypoint 2: Move towards Beta and Alpha at (54, 64, -67)
console.log('Navigating to Waypoint 2: (54, 64, -67)...');
try {
  await lib.goTo(54, 64, -67, 3, { timeoutMs: 40000 });
  console.log('Reached Waypoint 2 near team at:', lib.fmt(bot.entity.position));
  
  if (lib.count('torch') > 0) {
    try {
      await lib.placeTorch();
      console.log('Placed waypoint torch 2');
    } catch (e) {}
  }
} catch (e) {
  console.log('Waypoint 2 note:', e.message);
}

// 4. Report team positions
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

console.log('Gamma status:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
bot.chat(`gamma at ${lib.fmt(bot.entity.position)} on fortress trail. Health=${bot.health}, Food=${bot.food}`);
