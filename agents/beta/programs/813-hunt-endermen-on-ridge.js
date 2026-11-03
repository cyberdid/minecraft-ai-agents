// programs/813-hunt-endermen-on-ridge.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 813: Safe Soul Sand Valley Enderman Pearl Hunt ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
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

// Step 1: If in Overworld, warp to Nether via enterNetherPortal helper
if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Warping into Nether to hunt Soul Sand Valley Endermen for Milestone 9 Ender Pearls!');
  const warpResult = await globalThis.enterNetherPortal();
  console.log('enterNetherPortal result:', JSON.stringify(warpResult));
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether yet. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('In the_nether at:', lib.fmt(bot.entity.position));

// Step 2: Navigate to East Ridge Soul Sand Valley hunting post at (63, 65, -20)
const huntingPost = new Vec3(63.0, 65.0, -20.0);
console.log(`Navigating to Soul Sand Valley covered post at ${lib.fmt(huntingPost)}...`);

globalThis.configureFireAvoidance();
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

const approachWps = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20)
];

for (const wp of approachWps) {
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;
  await globalThis.clearFireAhead();
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('At hunting post:', lib.fmt(bot.entity.position));

// Step 3: Scan for Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e => 
  e.name === 'enderman' && 
  bot.entity.position.distanceTo(e.position) <= 36
);
console.log(`Endermen detected in valley (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

// Step 4: Safe 2-high Enderman hunting loop
let pearlsBefore = lib.count('ender_pearl');

if (endermen.length > 0) {
  for (const em of endermen) {
    if (isCancelled() || bot.health <= 8) break;
    const dist = bot.entity.position.distanceTo(em.position);
    console.log(`Engaging Enderman at ${lib.fmt(em.position)} (dist: ${dist.toFixed(1)}m)...`);

    // Stare at Enderman head (y + 2.7) to provoke attack while standing under 2-high roof
    await bot.lookAt(em.position.offset(0, 2.7, 0), true);
    await sleep(1500);

    const weapon = bot.inventory.items().find(i => i.name === 'iron_sword');
    if (weapon) await bot.equip(weapon, 'hand');

    const huntStart = Date.now();
    let hits = 0;
    while (Date.now() - huntStart < 14000 && !isCancelled()) {
      const live = bot.entities[em.id];
      if (!live || !live.isValid || live.health <= 0) {
        console.log('Enderman defeated!');
        break;
      }
      const d = bot.entity.position.distanceTo(live.position);
      if (d <= 4.0) {
        bot.deactivateItem();
        bot.attack(live);
        hits++;
        await sleep(650);
        bot.activateItem(true);
      }
      await sleep(100);
    }

    await lib.pickup(4.0);
    const pearlsNow = lib.count('ender_pearl');
    if (pearlsNow > pearlsBefore) {
      bot.chat(`Beta: HARVESTED ENDER PEARL! Pearls: ${pearlsNow}/12! Milestone 9 progressing!`);
      pearlsBefore = pearlsNow;
    }
  }
} else {
  console.log('No Endermen currently in immediate sight; vacuuming drops and holding post.');
  await lib.pickup(5.0);
}

// Step 5: Check for neutral Piglins in the vicinity
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 20);
console.log(`Piglins near hunting post (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

// Verify golden boots still worn
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}

console.log('=== Program 813 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls in inv:', lib.count('ender_pearl'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  endermen_seen: endermen.length,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots'
};
