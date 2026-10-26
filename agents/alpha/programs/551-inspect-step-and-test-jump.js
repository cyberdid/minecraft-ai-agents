// programs/551-inspect-step-and-test-jump.js
console.log('=== Program 551: Step & Jump Test ===');
console.log('Alpha exact position:', bot.entity.position);

for (let z = -6; z >= -10; z--) {
  for (let y = 63; y <= 68; y++) {
    const b = bot.blockAt(new Vec3(63, y, z));
    if (b && b.name !== 'air') {
      console.log(`(${63}, ${y}, ${z}): ${b.name} (bounds: ${JSON.stringify(b.shapes)})`);
    }
  }
}

// Now test jump + forward!
console.log('Testing jump + forward towards z=-9...');
await bot.lookAt(new Vec3(63.5, 65.0, -9.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('forward', false);
bot.setControlState('jump', false);
console.log('Position after jump+forward:', bot.entity.position);
