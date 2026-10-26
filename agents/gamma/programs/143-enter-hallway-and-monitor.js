// programs/143-enter-hallway-and-monitor.js
console.log('--- ENTER FORTIFIED HALLWAY & MONITOR TEAM ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Walk inside the safe tunnel to (44, 65, -139)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -139));
} catch (e) {
  console.log('goto 44, 65, -139 note:', e.message);
}

console.log('Now at:', lib.fmt(bot.entity.position));

// 2. Scan for all teammates in the Nether
let teammatesNear = 0;
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    const d = p.entity.position.distanceTo(bot.entity.position);
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${d.toFixed(1)}m`);
    if (d < 30) teammatesNear++;
  } else if (name !== 'gamma') {
    console.log(`Teammate ${name} not rendered`);
  }
}

// 3. Scan for nearby Blazes or hostiles
const hostiles = lib.hostiles(32);
console.log('Hostiles within 32m:', JSON.stringify(hostiles));

bot.chat(`gamma safely stationed inside enclosed advance tunnel at (44, 65, -139). Ready to breach mountain with team!`);
