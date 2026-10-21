// programs/118-emergency-shelter.js
// EMERGENCY SHELTER: Night is here at (374, 56, 13) with creeper nearby.
// 1. Shelter immediately
// 2. Craft furnace from cobblestone
// 3. Wait safely until dawn (tick 23460 / 0)

console.log('alpha at:', lib.fmt(bot.entity.position), '| time:', lib.time().timeOfDay);

bot.chat('alpha: Night fell! Sheltering underground at (374, 56, 13) until dawn.');

// 1. Emergency shelter
console.log('Sealing into emergency shelter...');
try {
  await lib.shelter();
  console.log('Safely sheltered! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shelter note:', e.message);
  // Manual emergency box: place cobblestone around and above
  const pos = bot.entity.position.floored();
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    await lib.place('cobblestone', pos.x + dx, pos.y, pos.z + dz).catch(() => {});
    await lib.place('cobblestone', pos.x + dx, pos.y + 1, pos.z + dz).catch(() => {});
  }
  await lib.place('cobblestone', pos.x, pos.y + 2, pos.z).catch(() => {});
}

// 2. Craft furnace while waiting
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  try {
    await lib.craft('furnace', 1);
    console.log('Crafted furnace in shelter!');
  } catch (e) {
    console.log('Craft furnace note:', e.message);
  }
}

// 3. Vigil until dawn
console.log('Waiting in shelter until dawn...');
let lastLog = Date.now();
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  if (Date.now() - lastLog > 30000) {
    console.log(`Shelter vigil: time ${t.timeOfDay}, hostiles in 16: ${lib.hostiles(16).length}`);
    lastLog = Date.now();
  }
  await sleep(4000);
}

console.log('Dawn reached! Breaking out of shelter...');
try {
  await lib.leaveShelter();
  console.log('Emerged safely from shelter! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leave shelter note:', e.message);
}

bot.chat('alpha: Emerged from night shelter! Returning to base with 6 raw iron and 2 ingots.');
