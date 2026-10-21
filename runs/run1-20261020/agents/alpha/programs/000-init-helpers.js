const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data')(bot.version);

// Store helpers on globalThis
globalThis.mcData = mcData;

globalThis.initPathfinder = function() {
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allow1by1towers = true;
  moves.scaffoldingBlocks = [mcData.blocksByName.dirt?.id, mcData.blocksByName.cobblestone?.id, mcData.blocksByName.oak_planks?.id].filter(Boolean);
  bot.pathfinder.setMovements(moves);
  return moves;
};

globalThis.goTo = async function(target, range = 1.5) {
  globalThis.initPathfinder();
  let x, y, z;
  if (target.x !== undefined) {
    x = target.x; y = target.y; z = target.z;
  } else if (Array.isArray(target)) {
    [x, y, z] = target;
  }
  const goal = new goals.GoalNear(x, y, z, range);
  await bot.pathfinder.goto(goal);
};

globalThis.getNearbyHostiles = function(radius = 16) {
  const hostiles = ['zombie', 'skeleton', 'creeper', 'spider', 'witch', 'drowned', 'enderman'];
  return Object.values(bot.entities).filter(e => {
    if (!e || !e.position) return false;
    const isHostile = hostiles.includes(e.name?.toLowerCase());
    const dist = e.position.distanceTo(bot.entity.position);
    return isHostile && dist <= radius;
  });
};

globalThis.collectDrops = async function(radius = 10) {
  const drops = Object.values(bot.entities).filter(e => {
    if (!e || e.name !== 'item' || !e.position) return false;
    return e.position.distanceTo(bot.entity.position) <= radius;
  });
  console.log(`Collecting ${drops.length} nearby drop(s)...`);
  for (const item of drops) {
    if (isCancelled()) break;
    try {
      await globalThis.goTo(item.position, 0.8);
      await bot.waitForTicks(5);
    } catch (err) {
      console.log(`Failed to reach drop at ${item.position}:`, err.message);
    }
  }
};

globalThis.findLogs = function(count = 10, maxDist = 32) {
  return bot.findBlocks({
    matching: (block) => block && block.name && block.name.endsWith('_log'),
    maxDistance: maxDist,
    count: count
  });
};

globalThis.chopTreeBlock = async function(pos) {
  const block = bot.blockAt(pos);
  if (!block || block.name === 'air') return false;
  console.log(`Targeting log block at ${pos} (${block.name})`);
  await globalThis.goTo(pos, 2.5);
  // Equip axe if available
  const axe = bot.inventory.items().find(i => i.name.endsWith('_axe'));
  if (axe) {
    await bot.equip(axe, 'hand');
  }
  await bot.lookAt(block.position.offset(0.5, 0.5, 0.5));
  await bot.dig(block);
  return true;
};

console.log("Global helpers initialized successfully.");
const hostiles = globalThis.getNearbyHostiles(20);
console.log(`Hostile mobs within 20 blocks: ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`- ${h.name} at ${h.position.floored()} (dist: ${h.position.distanceTo(bot.entity.position).toFixed(1)})`);
}
