// programs/501-dig-flat-path-to-bunker.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.deactivateItem(); // Deactivate shield so we can move at full speed!

// 1. Dig the block in front of waist to make path level
const p = bot.entity.position.floored();
const blockAhead = bot.blockAt(new Vec3(p.x, p.y, p.z + 1));
console.log('Block ahead at waist (p.z + 1):', blockAhead?.name);

if (blockAhead && blockAhead.name !== 'air') {
  console.log(`Digging obstacle ${blockAhead.name} at ${lib.fmt(blockAhead.position)}...`);
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  try {
    await bot.dig(blockAhead);
    console.log('Cleared obstacle!');
  } catch (e) {
    console.log('Dig note:', e.message);
  }
}

// 2. Configure pathfinder with canDig=true and allowParkour=true
const moves = new Movements(bot, mcData);
moves.canDig = true; // Can clear any single block obstacle
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// 3. Step forward along the ridge south towards bunker
const WAYPOINTS = [
  { x: 37, y: 76, z: -25 },
  { x: 38, y: 76, z: -18 },
  { x: 40, y: 73, z: -13 },
  { x: 41, y: 68, z: -8 },
  { x: 41, y: 65, z: -6 } // Nether bunker!
];

for (let i = 0; i < WAYPOINTS.length; i++) {
  const wp = WAYPOINTS[i];
  console.log(`Moving to WP ${i + 1}/${WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    console.log(`Reached WP ${i + 1}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note:`, e.message);
    try {
      await bot.lookAt(new Vec3(wp.x, wp.y, wp.z), true);
      bot.setControlState('forward', true);
      if (wp.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(800);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

console.log('Delta arrived at:', lib.fmt(bot.entity.position));

// 4. Locate Crafting Table in bunker and craft gold ingot
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
console.log('Crafting table found:', ct ? lib.fmt(ct.position) : 'none');

if (ct && lib.count('gold_nugget') >= 9) {
  try {
    console.log('Crafting gold_ingot at Crafting Table...');
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Crafted gold_ingot! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`delta: Crafted gold ingot at Nether Bunker! Total ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {
    console.log('Craft ingot error:', e.message);
  }
}

// 5. Equip offhand shield and weapon
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat(`delta: Safely united at Nether Base Camp bunker (41, 65, -6)! Holding ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
