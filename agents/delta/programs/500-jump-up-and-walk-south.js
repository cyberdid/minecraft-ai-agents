// programs/500-jump-up-and-walk-south.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Equip offhand shield and raise it
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    bot.activateItem(true);
  }
} catch (e) {}

// 2. Jump up 1 block south onto y=76
console.log('Jumping up onto y=76 plateau to the south...');
await bot.lookAt(new Vec3(36.0, 76.5, -30.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.setControlState('jump', false);
await sleep(400);
bot.setControlState('forward', false);
bot.clearControlStates();

console.log('Position after jumping onto plateau:', lib.fmt(bot.entity.position));

// 3. Configure pathfinder to walk south to bunker
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

const SOUTH_WPS = [
  { x: 37, y: 76, z: -25 },
  { x: 38, y: 76, z: -18 },
  { x: 40, y: 73, z: -13 },
  { x: 41, y: 68, z: -8 },
  { x: 41, y: 65, z: -6 } // Nether bunker
];

for (let i = 0; i < SOUTH_WPS.length; i++) {
  const wp = SOUTH_WPS[i];
  console.log(`Walking to WP ${i + 1}/${SOUTH_WPS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    console.log(`Reached WP ${i + 1}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note:`, e.message);
    try {
      await bot.lookAt(new Vec3(wp.x, wp.y, wp.z), true);
      bot.setControlState('forward', true);
      if (wp.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(1000);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

console.log('Delta arrived at:', lib.fmt(bot.entity.position));

// 4. Craft gold ingot at Crafting Table in bunker
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
if (ct && lib.count('gold_nugget') >= 9) {
  try {
    console.log('Crafting gold_ingot at Crafting Table...');
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Crafted gold_ingot! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`delta: Crafted gold ingot at Nether Bunker! Total ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

bot.chat(`delta: Reunited at Nether Bunker (41, 65, -6)! Holding ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets. Ready to barter for Milestone 9!`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
