// programs/534-enter-base-door.js
console.log('=== DELTA: WALK AROUND TO DOOR & ENTER BASE ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Food: ${bot.food}, HP: ${bot.health}`);

// Clear pathfinder
bot.clearControlStates();
bot.pathfinder.stop();

// Waypoints around the base wall to the front door at (294, 72, -53)
const waypoints = [
  new Vec3(297, 72, -58),
  new Vec3(297, 72, -53),
  new Vec3(294, 72, -53)
];

for (const wp of waypoints) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 0.8));
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

// Enter door
console.log('Passing through base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door pass error:', e.message);
  // Manual door open
  const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
  if (doorBlock) {
    await bot.activateBlock(doorBlock);
    await sleep(300);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

console.log(`Pos inside: ${lib.fmt(bot.entity.position)}`);

// Take smelted iron from furnace (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const furnace = await bot.openFurnace(fb);
    const out = furnace.outputItem();
    if (out) {
      console.log(`Got furnace output: ${out.name} x${out.count}`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace access notice:', e.message);
  }
}

// Craft shield
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    console.log('Shield crafted!');
  } catch (e) {
    console.log('Craft shield notice:', e.message);
  }
}

// Equip shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// Check teammates in base
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} is at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)})`);
  }
}

bot.chat('delta: Inside base! Food is 0, hunger critical! Please toss steaks/mutton or cooked food!');

return {
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  inv: lib.inv()
};
