// programs/289-inspect-main-shaft.js
console.log('=== INSPECT MAIN MINE SHAFT ===');
const shaftPos = new Vec3(302, 71, -44);
console.log('Shaft entrance block:', bot.blockAt(shaftPos)?.name);
console.log('Around entrance:');
for (let dy = 0; dy >= -5; dy--) {
  const p = shaftPos.offset(0, dy, 0);
  console.log(`  y=${p.y}: ${bot.blockAt(p)?.name}`);
}

// Also check if delta is at base or doing something
console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}`);
  }
}

// Check time
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${t.secondsUntilNight}s`);
