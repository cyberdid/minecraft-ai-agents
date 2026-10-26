// programs/553-widen-tunnel-entrance-and-advance.js
console.log('=== Program 553: Widen Tunnel Entrance & Advance ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Dig out the west wall at x=62, z=-7..-8 to create a 2-wide bypass passing siding
const blocksToClear = [
  new Vec3(62, 66, -7),
  new Vec3(62, 65, -7),
  new Vec3(62, 66, -8),
  new Vec3(62, 65, -8)
];

for (const p of blocksToClear) {
  const b = bot.blockAt(p);
  if (b && b.name !== 'air') {
    console.log(`Digging out bypass block at ${lib.fmt(p)} (${b.name})...`);
    await bot.lookAt(p.offset(0.5, 0.5, 0.5), true);
    await bot.dig(b);
    await sleep(100);
  }
}

console.log('Bypass cleared! Checking players:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    console.log(`${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// 2. Step into the bypass at x=62, z=-8
console.log('Stepping into bypass at (62.5, 65.0, -8.0)...');
await bot.lookAt(new Vec3(62.5, 65.0, -8.0), true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('forward', false);
console.log('Alpha pos in bypass:', lib.fmt(bot.entity.position));

// 3. Step forward past Delta to (63.5, 65.0, -10.0)
console.log('Stepping back into main tunnel at z=-10...');
await bot.lookAt(new Vec3(63.5, 65.0, -10.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1200);
bot.setControlState('forward', false);
bot.setControlState('jump', false);
console.log('Alpha pos after bypass:', lib.fmt(bot.entity.position));
