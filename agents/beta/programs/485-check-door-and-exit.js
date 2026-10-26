// programs/485-check-door-and-exit.js
console.log('=== Step: Inspect Base Interior & Door ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// Check Gamma pos
const gamma = bot.players['gamma']?.entity;
if (gamma) console.log('Gamma at', lib.fmt(gamma.position));

// Check door state
const door = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block:', door?.name);

// Open door if closed
if (door && door.name === 'oak_door') {
  try {
    await lib.door(294, 72, -54, true);
    console.log('Opened door!');
  } catch (e) {
    console.log('Open door error:', e.message);
  }
}

// Step through door using walkTo or controlState
console.log('Stepping through door towards (294.5, -52.5)...');
await bot.lookAt(new Vec3(294.5, 72.5, -52.5), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.clearControlStates();

console.log('Position after stepping out:', lib.fmt(bot.entity.position));
