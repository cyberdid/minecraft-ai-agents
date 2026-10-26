// programs/533-climb-out-of-pit.js
console.log('=== Step: Climb out of Pit to Open Ground ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

// Scan around feet
const p = bot.entity.position.floored();
console.log(`Current block at feet: ${bot.blockAt(p)?.name}, below: ${bot.blockAt(p.offset(0, -1, 0))?.name}`);

// Dig dirt block at head level if blocked
const head = bot.blockAt(p.offset(0, 1, 0));
if (head && head.boundingBox === 'block') {
  console.log(`Digging block at head: ${head.name}...`);
  try { await lib.dig(head.position.x, head.position.y, head.position.z); } catch (e) {}
}

// Dig the dirt block at (305, 68, -64) and (305, 67, -64) towards +Z (base direction)
const southFeet = bot.blockAt(p.offset(0, 0, 1));
const southHead = bot.blockAt(p.offset(0, 1, 1));
console.log(`South (+Z towards base): feet=${southFeet?.name}, head=${southHead?.name}`);

if (southHead && (southHead.name === 'dirt' || southHead.name === 'grass_block')) {
  console.log(`Digging dirt block at ${lib.fmt(southHead.position)}...`);
  try { await lib.dig(southHead.position.x, southHead.position.y, southHead.position.z); } catch (e) {}
}

// Also check East (+X) which had air at head level
const eastFeet = bot.blockAt(p.offset(1, 0, 0));
if (eastFeet && (eastFeet.name === 'dirt' || eastFeet.name === 'grass_block')) {
  console.log(`Digging East dirt step at ${lib.fmt(eastFeet.position)}...`);
  try { await lib.dig(eastFeet.position.x, eastFeet.position.y, eastFeet.position.z); } catch (e) {}
}

// Jump and move towards +X / +Z onto higher ground
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await bot.lookAt(new Vec3(p.x + 1.5, p.y + 1, p.z + 0.5), true);
await sleep(800);
bot.clearControlStates();

console.log('Pos after jump/climb:', lib.fmt(bot.entity.position));

// Now try pathfinding towards base door (294, 72, -54)
try {
  await lib.goTo(294, 72, -54, 2, { dig: true });
  console.log('SUCCESS: Reached base vicinity at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('lib.goTo base note:', e.message);
}

return {
  pos: bot.entity.position,
  hp: bot.health
};
