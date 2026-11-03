console.log('=== PROGRAM 706: INSPECT PATH FROM (47, -7) TO (47, 2) ===');

for (let z = -7; z <= 3; z++) {
  const floor = bot.blockAt(new Vec3(47, 64, z));
  const feet = bot.blockAt(new Vec3(47, 65, z));
  const head = bot.blockAt(new Vec3(47, 66, z));
  console.log(`z=${z}: floor=${floor?.name}, feet=${feet?.name}, head=${head?.name}`);
}

// Check Portal 2 entrance around (41, 65, -6)
console.log('\n--- Portal 2 entrance check around (41, 65, -6) ---');
for (let x = 43; x >= 40; x--) {
  const f = bot.blockAt(new Vec3(x, 64, -6));
  const ft = bot.blockAt(new Vec3(x, 65, -6));
  console.log(`x=${x}, z=-6: floor=${f?.name}, feet=${ft?.name}`);
}
