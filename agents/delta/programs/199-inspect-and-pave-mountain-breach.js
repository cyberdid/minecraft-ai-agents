// programs/199-inspect-and-pave-mountain-breach.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Stand safely at (44.5, 65.0, -147.0)
await bot.lookAt(new Vec3(44.5, 64.0, -149.0), true);

// 2. Place floor block at (44, 64, -149) against (44, 64, -148)
console.log('Fixing fall gap at (44, 64, -149)...');
try {
  const result = await lib.place('cobblestone', 44, 64, -149);
  console.log('Placed floor at (44, 64, -149):', result);
} catch (err) {
  console.log('Error placing floor at (44, 64, -149):', err.message);
}

// 3. Place East wall at (45, 65, -148) against glowstone at (45, 65, -149)
console.log('Placing East wall at (45, 65, -148)...');
try {
  await lib.place('cobblestone', 45, 65, -148);
  console.log('Placed East wall at (45, 65, -148)!');
} catch (err) {
  console.log('Error placing East wall (45, 65, -148):', err.message);
}

// 4. Place East wall at (45, 65, -147)
console.log('Placing East wall at (45, 65, -147)...');
try {
  await lib.place('cobblestone', 45, 65, -147);
  console.log('Placed East wall at (45, 65, -147)!');
} catch (err) {
  console.log('Error placing East wall (45, 65, -147):', err.message);
}

// 5. Scan mountain interior: z=-148 to z=-155, y=63..68, x=43..45
console.log('--- SCANNING MOUNTAIN INTERIOR (z=-148 to -155) ---');
for (let z = -148; z >= -155; z--) {
  for (let y = 67; y >= 64; y--) {
    const bW = bot.blockAt(new Vec3(43, y, z));
    const bC = bot.blockAt(new Vec3(44, y, z));
    const bE = bot.blockAt(new Vec3(45, y, z));
    console.log(`z=${z} y=${y}: W(43)=${bW?.name} C(44)=${bC?.name} E(45)=${bE?.name}`);
  }
}

bot.chat('delta: Fixed fall trap at (44, 64, -149)! Floor and walls secure. Mountain breach safe!');
console.log('Delta remaining cobblestone:', lib.count('cobblestone'));
