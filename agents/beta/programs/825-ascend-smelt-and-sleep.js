// programs/825-ascend-smelt-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 825: Ascend Shaft, Smelt Iron & Sleep at Dusk ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

// Step 1: Ascend staircase from y=53 up to base room at (293, 72, -55)
bot.chat('Beta: Ascending to base with 10 raw iron! Smelting in furnace and ready to sleep at dusk!');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const ascendPoints = [
  new Vec3(289, 58, -55),
  new Vec3(291, 63, -55),
  new Vec3(293, 68, -55),
  new Vec3(293, 72, -55)
];

for (let i = 0; i < ascendPoints.length && !isCancelled(); i++) {
  const pt = ascendPoints[i];
  if (bot.entity.position.distanceTo(pt) < 2.5) continue;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(pt.x, pt.y, pt.z, 1.5));
  } catch (e) {
    try { await lib.goTo(pt.x, pt.y, pt.z, 2.0, { dig: true, timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Step 2: Smelt 10 raw_iron in furnace at (295, 72, -55)
const rawIron = lib.count('raw_iron');
if (rawIron > 0) {
  console.log(`Putting ${rawIron} raw_iron into furnace to smelt...`);
  try {
    await lib.smelt('raw_iron', '*_planks', rawIron);
    console.log(`Smelting finished! Iron ingots now: ${lib.count('iron_ingot')}`);
  } catch (e) {
    console.log('Smelt notice:', e.message);
  }
}

// Step 3: Sleep if night
console.log('Current time:', bot.time.timeOfDay, 'canSleep:', lib.time().canSleep);
const waitStart = Date.now();
while (!lib.time().canSleep && Date.now() - waitStart < 25000 && !isCancelled()) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  bot.chat('Beta: Sleeping in base bed now! Team, sleep to skip night!');
  try {
    await lib.sleepInBed();
    await sleep(4000);
  } catch (e) {
    console.log('Sleep notice:', e.message);
  }
}

try { await bot.wake(); } catch (e) {}

// Step 4: Check Nether Portal status at (299, 73, -54)
const portalBlocks = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log(`Active nether_portal blocks: ${portalBlocks.length}`);

console.log('=== Program 825 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Iron ingots:', lib.count('iron_ingot'));
console.log('Active portal blocks:', portalBlocks.length);
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  iron_ingots: lib.count('iron_ingot'),
  active_portal_blocks: portalBlocks.length
};
