// programs/030-rescue-beta.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Open door and walk well outside
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}

console.log('Walking out into open area...');
await lib.walkTo(294.5, -48);
console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Walk to shaft entrance at (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 2, { timeoutMs: 20000 });
console.log('At shaft top:', lib.fmt(bot.entity.position));

bot.chat('delta: At shaft (302, 71, -44). Entering stairs with cooked chicken for Beta!');

// 3. Descend verified staircase stages
const stages = [
  { x: 304, y: 54, z: -34 },
  { x: 298, y: 24, z: -30 },
  { x: 290, y: 19, z: 7 }
];

for (const s of stages) {
  if (isCancelled()) break;
  
  // Check if Beta is close
  const b = bot.players.beta?.entity;
  if (b && b.position.distanceTo(bot.entity.position) < 8) {
    console.log(`Met Beta at ${lib.fmt(b.position)}!`);
    break;
  }
  
  console.log(`Heading to stage (${s.x}, ${s.y}, ${s.z})...`);
  try {
    await lib.goTo(s.x, s.y, s.z, 2, { dig: true, timeoutMs: 25000 });
    console.log(`Reached stage at ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Stage (${s.x}, ${s.y}, ${s.z}) note:`, err.message);
  }
}

// 4. Meet Beta and toss food
const beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta located at ${lib.fmt(beta.position)} (dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
  if (beta.position.distanceTo(bot.entity.position) > 3) {
    try {
      await lib.goTo(beta.position.x, beta.position.y, beta.position.z, 2, { timeoutMs: 15000 });
    } catch (e) {
      console.log('Approach Beta note:', e.message);
    }
  }
  
  if (lib.count('cooked_chicken')) {
    console.log('Tossing cooked chicken to Beta...');
    await bot.lookAt(beta.position.offset(0, 1.2, 0));
    await bot.toss(mcData.itemsByName.cooked_chicken.id, null, 1);
    bot.chat('delta: Beta, tossed you cooked chicken! Eat up and follow me to the surface!');
  }
} else {
  console.log('Beta not in immediate view distance yet.');
  bot.chat('delta: Reached mine shaft stairs. Calling out to Beta!');
}

console.log('Delta pos now:', lib.fmt(bot.entity.position));
