// programs/782-march-to-tunnel-piglin-and-barter.js
console.log('=== Program 782: March to Covered Tunnel (44, 65, -145) & Barter ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Ensure golden_boots and shield equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet slot:', bot.inventory.slots[8]?.name);

if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
bot.activateItem(true); // Raise shield

// Equip iron weapon
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

configureFireAvoidance();

// Safe verified waypoints directly to Covered Tunnel Piglin Zone
const tunnelWaypoints = [
  new Vec3(46, 65, -7),
  new Vec3(56, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61.5, 67, -65),
  new Vec3(61.5, 67, -75),
  new Vec3(62.0, 67, -80),
  new Vec3(61.0, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Bunker entrance
  new Vec3(44.0, 65, -145)  // Covered tunnel Piglin zone
];

for (let i = 0; i < tunnelWaypoints.length && !isCancelled(); i++) {
  const wp = tunnelWaypoints[i];
  console.log(`Advancing to WP ${i + 1}/${tunnelWaypoints.length}: ${lib.fmt(wp)}...`);
  if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

  // Sneak past z=-100 inside mountain corridor
  if (wp.z <= -100) {
    bot.setControlState('sneak', true);
  } else {
    bot.setControlState('sneak', false);
  }
  bot.activateItem(true); // Keep shield raised

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
    } catch (e2) {}
  }

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march at safe position.`);
    break;
  }
}

bot.setControlState('sneak', false);
console.log('Arrived in Covered Tunnel! Current pos:', lib.fmt(bot.entity.position));

// Step 2: Vacuum barter drops and items in the tunnel
await lib.pickup(8.0);
const curPearls = lib.count('ender_pearl');
console.log(`Ender Pearls on Beta: ${curPearls}/12`);

// Step 3: Scan for Piglins and teammates
const nearby = Object.values(bot.entities).filter(e =>
  e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);

const piglins = nearby.filter(e => e.name === 'piglin');
const teammates = nearby.filter(e => e.type === 'player' && e.username !== bot.username);

console.log(`In Covered Tunnel: Piglins: ${piglins.length}, Teammates: ${teammates.length}`);
for (const tm of teammates) {
  console.log(`Teammate ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}
for (const pig of piglins) {
  console.log(`Piglin at ${lib.fmt(pig.position)}, dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}

bot.chat(`Beta: United with team at Covered Tunnel (44, 65, -145)! Ender Pearls held: ${curPearls}/12. Assisting bartering!`);

// Step 4: If Beta has any gold ingots, barter with nearest Piglin
if (lib.count('gold_ingot') > 0 && piglins.length > 0) {
  const piglin = piglins[0];
  console.log(`Tossing gold ingot to Piglin at ${lib.fmt(piglin.position)}...`);
  try {
    await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
    await sleep(8500);
    await lib.pickup(6.0);
    console.log(`Ender Pearls after barter: ${lib.count('ender_pearl')}`);
    if (lib.count('ender_pearl') > curPearls) {
      bot.chat(`Beta: BARTER SUCCESS! Secured Ender Pearl! Total: ${lib.count('ender_pearl')}/12!`);
    }
  } catch (e) {}
}

// Step 5: Mine any reachable nether_gold_ore in tunnel walls
const ores = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 12,
  count: 5
}).filter(p => p.y >= 63);

let mined = 0;
for (const op of ores) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
    const b = bot.blockAt(op);
    if (b && b.name === 'nether_gold_ore') {
      const pPick = bot.inventory.items().find(it => it.name === 'iron_pickaxe') || bot.inventory.items().find(it => it.name.includes('pickaxe'));
      if (pPick) await bot.equip(pPick, 'hand');
      await bot.dig(b);
      mined++;
      await sleep(200);
      await lib.pickup(3.5);
    }
  } catch (e) {}
}

await lib.pickup(6.0);
bot.activateItem(true); // Keep shield raised

console.log('=== Program 782 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'Nuggets:', lib.count('gold_nugget'));
console.log('Mined ores in tunnel:', mined);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  mined_ores: mined
};
