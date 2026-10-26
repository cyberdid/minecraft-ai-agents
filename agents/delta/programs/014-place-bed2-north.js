// programs/014-place-bed2-north.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Stand at (293.5, 72, -54.2)
await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -54));
console.log('Now at:', lib.fmt(bot.entity.position));

// Face North towards -z (yaw = Math.PI, pitch = down)
const ground = bot.blockAt(new Vec3(293, 71, -55));
console.log('Ground block:', ground ? ground.name : 'null');

await bot.equip(mcData.itemsByName.white_bed.id, 'hand');
// Look at top of ground block facing north
await bot.lookAt(new Vec3(293.5, 71.9, -55.5), true);
await sleep(200);

try {
  await bot.placeBlock(ground, new Vec3(0, 1, 0));
  await sleep(300);
} catch (e) {
  console.log('placeBlock exception:', e.message);
}

// Check blocks at (293, 72, -55) and (293, 72, -56)
const foot = bot.blockAt(new Vec3(293, 72, -55));
const head = bot.blockAt(new Vec3(293, 72, -56));
console.log('Block at (293, 72, -55):', foot ? foot.name : 'null');
console.log('Block at (293, 72, -56):', head ? head.name : 'null');

if (foot && foot.name.includes('bed')) {
  console.log('SUCCESS! Bed 2 is placed!');
  // Protect bed blocks
  lib.protect(new Vec3(293, 72, -55));
  lib.protect(new Vec3(293, 72, -56));
  bot.chat('delta: Bed 2 placed at (293, 72, -55..-56)! Milestone 4 achieved!');
} else {
  console.log('Bed placement failed, bed in inv:', lib.count('white_bed'));
}
