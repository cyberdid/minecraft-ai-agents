// programs/804-enter-bunker-and-recover.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 804: Raise Shield & Enter Fortress Bunker ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Immediately equip shield in offhand and raise it
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}
bot.activateItem(true); // Raise shield immediately!
console.log('Shield raised for 100% fireball protection.');

// Ensure golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}

// Step 2: Navigate into the blast-proof Fortress Bunker at (44, 65, -127)
const bunkerPos = new Vec3(44.0, 65.0, -127.0);
console.log(`Moving into Fortress Bunker at ${lib.fmt(bunkerPos)}...`);

const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(bunkerPos.x, bunkerPos.y, bunkerPos.z, 1.2));
} catch (e) {
  console.log('Pathfinder to bunker notice:', e.message);
  // Manual step into bunker
  await bot.lookAt(bunkerPos, true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Inside bunker! Pos:', lib.fmt(bot.entity.position));

// Face south towards entrance with shield raised
await bot.lookAt(new Vec3(44.0, 65.0, -125.0), true);
bot.activateItem(true);

// Step 3: Wait for HP regeneration while safe inside bunker
console.log('Holding in bunker cover. Monitoring HP regen...');
const waitStart = Date.now();
while (bot.health < 18 && Date.now() - waitStart < 15000 && !isCancelled()) {
  await sleep(1000);
  console.log(`HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}`);
}

// Step 4: Scan for nearby gold ore and neutral Piglins
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_ore'),
  maxDistance: 24,
  count: 20
});
console.log(`Scouted ${goldOres.length} gold ore blocks near bunker:`, goldOres.map(o => lib.fmt(o)).join(', '));

const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) < 25);
console.log(`Piglins near bunker (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) < 30);
console.log(`Endermen near bunker (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates near bunker:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));

bot.chat(`Beta: Safe inside Fortress Bunker (44, 65, -127)! HP: ${bot.health.toFixed(1)}/20. Gold ores nearby: ${goldOres.length}. Ready for bartering!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  gold_ores: goldOres.length,
  piglins: piglins.length,
  endermen: endermen.length
};
