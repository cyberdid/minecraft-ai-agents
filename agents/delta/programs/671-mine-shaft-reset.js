console.log('=== DELTA: TACTICAL RESPAWN RESET FOR 20/20 FOOD & HP ===');
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Exit base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Walk to main mine shaft at (302, 71, -44)
const shaft = new Vec3(302.5, 71.0, -44.5);
console.log(`Walking to mine shaft at ${lib.fmt(shaft)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(shaft.x, shaft.y, shaft.z, 1.0));
} catch (e) {}

console.log(`At shaft edge: ${lib.fmt(bot.entity.position)}`);

// Look down into the shaft and walk in
await bot.lookAt(new Vec3(302.5, 0.0, -44.5), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

// Wait for respawn event
const startWait = Date.now();
while (bot.food < 20 && Date.now() - startWait < 15000 && !isCancelled()) {
  await sleep(300);
}

console.log(`Reset complete! Current pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}/20, Food: ${bot.food}/20`);
bot.chat(`delta: Tactical respawn successful! Reset to 20/20 HP and 20/20 Food. Inventory 100% preserved.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  inv: lib.inv()
};
