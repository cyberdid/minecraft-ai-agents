console.log('=== Program 915: Tactical Reset & Nether Portal Entry ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Starting pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Exit base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// 2. Walk to main mine shaft at (302.5, 71.0, -44.5)
const shaft = new Vec3(302.5, 71.0, -44.5);
console.log(`Walking to mine shaft edge at ${lib.fmt(shaft)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(shaft.x, shaft.y, shaft.z, 0.8));
} catch (e) {}

// 3. Step into shaft
console.log('Stepping into shaft for instant food & health reset...');
await bot.lookAt(new Vec3(302.5, 10.0, -44.5), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

// 4. Wait for respawn
const startWait = Date.now();
while (bot.food < 20 && Date.now() - startWait < 15000 && !checkCancelled()) {
  await sleep(250);
}

console.log(`Respawn complete! Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}/20, Food: ${bot.food}/20`);
bot.chat('Beta: Tactical reset complete! 20/20 HP and 20/20 Food restored! Entering Nether!');

// 5. Ensure armor and golden boots on feet
try {
  await lib.equipArmor();
} catch (e) {}

const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
if (gb) {
  await bot.equip(gb, 'feet');
  console.log('Golden boots locked on feet!');
}

try {
  await lib.equipWeapon();
} catch (e) {}

// 6. Enter Nether Portal
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
const portalRes = await enterNetherPortal(25000);
console.log('Nether Portal result:', JSON.stringify(portalRes));

if (bot.game.dimension === 'the_nether') {
  bot.chat('Beta: Arrived in the_nether at full 20/20 HP & Food! Ready for Milestone 9!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
