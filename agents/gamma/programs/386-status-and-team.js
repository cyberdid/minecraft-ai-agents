// programs/386-status-and-team.js
console.log('=== GAMMA STATUS & TEAM CHECK ===');
console.log('gamma pos:', lib.fmt(bot.entity.position));
console.log('gamma inv:', JSON.stringify(lib.inv()));
console.log('time:', JSON.stringify(lib.time()));

for (const name of ['alpha', 'beta', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}`);
  } else if (p) {
    console.log(`Teammate ${name}: online but not in visual range`);
  } else {
    console.log(`Teammate ${name}: offline`);
  }
}

// Check if base bed is reachable or if base is nearby
const distToBase = bot.entity.position.distanceTo(new Vec3(294, 72, -54));
console.log(`Distance to base door (294, 72, -54): ${distToBase.toFixed(1)} blocks`);

return { pos: bot.entity.position, time: lib.time(), inv: lib.inv() };
