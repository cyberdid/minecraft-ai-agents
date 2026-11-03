// programs/814-hunt-valley-enderman.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 814: Hunt Soul Sand Valley Endermen for Pearls ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots and shield
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}
const weapon = bot.inventory.items().find(i => i.name === 'iron_sword');
if (weapon) await bot.equip(weapon, 'hand');

// Step 1: Advance along East Ridge to (62, 67, -40)
const targetPost = new Vec3(62.0, 67.0, -40.0);
console.log(`Advancing along East Ridge to ${lib.fmt(targetPost)}...`);

globalThis.configureFireAvoidance();
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

const intermediateWps = [
  new Vec3(63.0, 66.0, -30.0),
  new Vec3(62.0, 67.0, -40.0)
];

for (const wp of intermediateWps) {
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;
  await globalThis.clearFireAhead();
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('At ridge observation post:', lib.fmt(bot.entity.position));

// Step 2: Ensure 2-high protective roof directly above head
const curHead = bot.entity.position.floored().offset(0, 2, 0);
const roofBlock = bot.blockAt(curHead);
if (!roofBlock || roofBlock.boundingBox !== 'block') {
  console.log(`Placing protective roof block above head at ${lib.fmt(curHead)}...`);
  const cob = bot.inventory.items().find(it => it.name === 'cobblestone' || it.name === 'netherrack');
  if (cob) {
    try {
      await bot.equip(cob, 'hand');
      const side = bot.blockAt(curHead.offset(1, 0, 0)) || bot.blockAt(curHead.offset(0, 0, 1));
      if (side) await bot.placeBlock(side, new Vec3(-1, 0, 0));
    } catch (e) {}
  }
}

// Step 3: Scan for Endermen in valley
const endermen = Object.values(bot.entities).filter(e => 
  e.name === 'enderman' && 
  bot.entity.position.distanceTo(e.position) <= 40
);
console.log(`Found ${endermen.length} Endermen in Soul Sand Valley:`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

let pearlsBefore = lib.count('ender_pearl');

if (endermen.length > 0) {
  // Sort by closest
  endermen.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const target = endermen[0];
  console.log(`Targeting closest Enderman at ${lib.fmt(target.position)}...`);

  // Stare at head (y + 2.7) to draw aggro
  await bot.lookAt(target.position.offset(0, 2.7, 0), true);
  await sleep(1500);

  if (weapon) await bot.equip(weapon, 'hand');

  // Combat loop: keep shield raised, strike when in reach
  const startCombat = Date.now();
  let hits = 0;
  while (Date.now() - startCombat < 15000 && !isCancelled()) {
    const live = bot.entities[target.id];
    if (!live || !live.isValid || live.health <= 0) {
      console.log('Enderman defeated!');
      break;
    }
    const dist = bot.entity.position.distanceTo(live.position);
    if (dist <= 4.0) {
      bot.deactivateItem();
      bot.attack(live);
      hits++;
      await sleep(650);
      bot.activateItem(true);
    } else {
      bot.activateItem(true);
      await bot.lookAt(live.position.offset(0, 1.8, 0), true);
    }
    await sleep(100);
  }

  await lib.pickup(5.0);
  const pearlsNow = lib.count('ender_pearl');
  if (pearlsNow > pearlsBefore) {
    bot.chat(`Beta: Slew Enderman! Harvested Ender Pearl! Total: ${pearlsNow}/12!`);
    console.log(`HARVESTED ENDER PEARL! Total now: ${pearlsNow}/12`);
  }
} else {
  console.log('No Enderman in direct view. Vacuuming drops nearby...');
  await lib.pickup(4.0);
}

// Step 4: Check for nearby Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 20);
console.log(`Piglins nearby (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

// Verify golden boots
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}

console.log('=== Program 814 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender pearls in inv:', lib.count('ender_pearl'));
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  endermen_seen: endermen.length,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots'
};
