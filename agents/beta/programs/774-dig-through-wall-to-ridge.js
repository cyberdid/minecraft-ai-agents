// programs/774-dig-through-wall-to-ridge.js
console.log('=== Program 774: Dig Doorway Through Wall to East Ridge ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();

// Dig out 2-high passage along x=44 from z=-10 to z=-7
const blocksToClear = [
  new Vec3(44, 64, -10),
  new Vec3(44, 65, -10),
  new Vec3(44, 64, -9),
  new Vec3(44, 65, -9),
  new Vec3(44, 64, -8),
  new Vec3(44, 65, -8),
  new Vec3(44, 64, -7),
  new Vec3(44, 65, -7)
];

for (const p of blocksToClear) {
  const b = bot.blockAt(p);
  if (b && b.name !== 'air' && b.name !== 'cave_air') {
    console.log(`Digging block ${b.name} at ${lib.fmt(p)}...`);
    try {
      await bot.dig(b);
      await sleep(150);
    } catch (e) {
      console.log(`Dig note at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// Walk forward through the cleared doorway
console.log('Walking forward through cleared doorway...');
await bot.lookAt(new Vec3(44, 65, -7), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.setControlState('forward', false);

console.log('Bot pos after step-through:', lib.fmt(bot.entity.position));

// Now try pathfinder to (46, 65, -7)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1.2));
  console.log('SUCCESS: Arrived at WP (46, 65, -7)!');
  bot.chat('Beta: Cleared wall doorway! Reached East Ridge trail WP (46, 65, -7)!');
} catch (e) {
  console.log('Goto note:', e.message);
}

console.log('=== Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

return { pos: bot.entity.position, hp: bot.health, food: bot.food };
