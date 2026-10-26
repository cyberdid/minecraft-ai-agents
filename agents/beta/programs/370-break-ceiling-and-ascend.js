// programs/370-break-ceiling-and-ascend.js
console.log('=== Break headroom block at (307, 34, -41) and step up ===');

const ceiling = bot.blockAt(new Vec3(307, 34, -41));
if (ceiling && ceiling.name !== 'air') {
  console.log(`Digging ceiling block at (307, 34, -41) (${ceiling.name}) with bare hands (~7.5s)...`);
  await bot.dig(ceiling);
  console.log('Ceiling block broken!');
}

// Also check block at (308, 34, -41)
const c2 = bot.blockAt(new Vec3(308, 34, -41));
if (c2 && c2.name !== 'air' && c2.boundingBox === 'block') {
  console.log(`Digging second ceiling block at (308, 34, -41) (${c2.name})...`);
  await bot.dig(c2);
}

// Pickup cobblestone drop
await lib.pickup(4);

// Now jump onto (308, 32, -41)
console.log('Jumping onto x=308 with cleared headroom...');
await bot.lookAt(new Vec3(309, 33, -41.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.clearControlStates();

console.log('Pos after jump:', lib.fmt(bot.entity.position));

// If on x=308, continue up ramp
if (bot.entity.position.x >= 308.0) {
  console.log('Successfully ascended to x=308! Continuing up east ramp...');
  await bot.lookAt(new Vec3(313, 36, -41.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(2500);
  bot.clearControlStates();
}

console.log('Final pos:', lib.fmt(bot.entity.position));
