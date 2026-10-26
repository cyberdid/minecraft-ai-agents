// programs/029-escort-beta.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Take cooked chicken from base chest
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ cooked_chicken: 1 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew cooked_chicken for Beta!');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 2. Step outside base
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -52);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
}

// 3. Walk to shaft entrance at (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 2);
console.log('At shaft top:', lib.fmt(bot.entity.position));

bot.chat('delta: Heading down shaft at (302, 71, -44) with cooked chicken to meet Beta!');

// 4. Check Beta's position
const beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta is at ${lib.fmt(beta.position)} (dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// 5. Descend down main shaft stairs in stages
const stages = [
  { x: 304, y: 54, z: -34 },
  { x: 299, y: 27, z: -30 },
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
  console.log(`Descending to stage (${s.x}, ${s.y}, ${s.z})...`);
  try {
    await lib.goTo(s.x, s.y, s.z, 2, { timeoutMs: 25000 });
    console.log(`Reached stage at ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Descend to stage (${s.x}, ${s.y}, ${s.z}) note:`, err.message);
    break;
  }
}

// Check Beta again
const bNow = bot.players.beta?.entity;
if (bNow) {
  console.log(`Beta position now: ${lib.fmt(bNow.position)} (dist: ${bNow.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
  if (bNow.position.distanceTo(bot.entity.position) < 6 && lib.count('cooked_chicken')) {
    console.log('Tossing cooked chicken to Beta...');
    await bot.lookAt(bNow.position.offset(0, 1.5, 0));
    await bot.toss(mcData.itemsByName.cooked_chicken.id, null, 1);
    bot.chat('delta: Tossed cooked chicken to Beta! Follow me up to the portal!');
  }
}

console.log('Delta pos now:', lib.fmt(bot.entity.position));
