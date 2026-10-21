// programs/124-reset-and-travel.js
// Reset pathfinder cleanly, then walk to base at (294, 72, -52)

console.log('Resetting pathfinder. Alpha at:', lib.fmt(bot.entity.position));

bot.pathfinder.stop();
await sleep(500);

const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = false;
bot.pathfinder.setMovements(m);

console.log('Travelling directly to base near (294, 72, -52)...');
bot.chat('alpha: Reset pathfinder, walking straight back to base.');

try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
  console.log('Arrived near base entrance! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Goto note:', e.message);
}

// Enter base cleanly
try {
  await passDoorIn();
  console.log('Inside base! Alpha at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door in note:', e.message);
}

bot.chat('alpha: Inside base safe with you beta!');
console.log('Alpha at destination:', lib.fmt(bot.entity.position), '| food:', bot.food, '| health:', bot.health);
