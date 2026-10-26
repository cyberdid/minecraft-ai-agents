// programs/422-build-portal-steps-and-transit.js
console.log('=== Program 422: Build Portal Steps & Transit to Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Inspect ground and frame elevation
for (let y = 71; y <= 74; y++) {
  console.log(`y=${y}: (299, ${y}, -53)=${bot.blockAt(new Vec3(299, y, -53))?.name}, (299, ${y}, -54)=${bot.blockAt(new Vec3(299, y, -54))?.name}`);
}

// 2. Build a cobblestone step at (299, 71, -53) and (299, 72, -53) if air
const stepLower = bot.blockAt(new Vec3(299, 71, -53));
const stepUpper = bot.blockAt(new Vec3(299, 72, -53));

console.log('stepLower:', stepLower?.name, 'stepUpper:', stepUpper?.name);

if (stepLower && stepLower.name === 'air') {
  console.log('Placing lower step at (299, 71, -53)...');
  try {
    await lib.place('cobblestone', 299, 71, -53);
  } catch (e) {
    console.log('Lower step note:', e.message);
  }
}

if (stepUpper && stepUpper.name === 'air') {
  console.log('Placing upper step at (299, 72, -53)...');
  try {
    await lib.place('cobblestone', 299, 72, -53);
  } catch (e) {
    console.log('Upper step note:', e.message);
  }
}

// 3. Move up the step and into the nether_portal block at (299.5, 73.0, -54.0)
console.log('Walking up steps into portal (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo note:', e.message);
  // Manual step up: look at portal, jump forward
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  await sleep(500);
  bot.setControlState('forward', false);
}

bot.clearControlStates();
console.log('Standing at:', lib.fmt(bot.entity.position), 'Block at feet:', bot.blockAt(bot.entity.position)?.name);

// 4. Stand completely stationary for portal teleportation
console.log('Standing stationary in portal for dimension change...');
for (let wait = 0; wait < 35; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! DIMENSION IS THE_NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Final Dimension:', bot.game.dimension);
console.log('Alpha final pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Advancing along East Ridge trail to Fortress Workshop at (44, 65, -133)!`);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
