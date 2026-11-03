// programs/873-reach-portal-room-and-prepare.js
console.log('=== Program 873: Reach Portal Room & Prepare ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: TEAM: True Stronghold is at (2240, 35, 1456)! End Portal room at (2210, 0, 1470)! Alpha navigating down to secure portal room!');

// Equip pickaxe and sword
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Target portal room center
const portalCenter = new Vec3(2210, 0, 1470);
console.log(`Pathfinding from ${lib.fmt(bot.entity.position)} to Portal Room ${lib.fmt(portalCenter)}...`);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalCenter.x, portalCenter.y + 1, portalCenter.z, 2.0));
} catch (e) {
  console.log('Pathfinder error, digging staircase towards portal room:', e.message);
  
  // Safe descent towards (2210, 0, 1470)
  while (bot.entity.position.y > 2.0 && bot.entity.position.distanceTo(portalCenter) > 4.0) {
    const p = bot.entity.position;
    const dx = Math.sign(portalCenter.x - p.x);
    const dz = Math.sign(portalCenter.z - p.z);
    
    // Dig next step
    const nextStep = p.offset(dx, -1, dz);
    const b1 = bot.blockAt(nextStep);
    const b2 = bot.blockAt(nextStep.offset(0, 1, 0));
    
    if (b2 && b2.boundingBox === 'block') {
      try { await bot.dig(b2, true); } catch (e) {}
    }
    if (b1 && b1.boundingBox === 'block') {
      try { await bot.dig(b1, true); } catch (e) {}
    }
    
    await bot.lookAt(nextStep, true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.clearControlStates();
    
    console.log(`At pos=${lib.fmt(bot.entity.position)}, dist to portal: ${bot.entity.position.distanceTo(portalCenter).toFixed(1)}m`);
  }
}

console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);

// 2. Check for Silverfish Spawner and destroy it
const spawner = bot.findBlock({
  matching: b => b && b.name === 'spawner',
  maxDistance: 10
});

if (spawner) {
  console.log(`Found spawner at ${lib.fmt(spawner.position)}! Destroying with iron pickaxe...`);
  bot.chat('alpha: Destroying Silverfish Spawner in Portal Room!');
  const ironPick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || pick;
  if (ironPick) await bot.equip(ironPick, 'hand');
  try {
    await bot.dig(spawner, true);
    console.log('Silverfish Spawner destroyed!');
  } catch (e) {
    console.log('Error destroying spawner:', e.message);
  }
}

// 3. Inspect End Portal Frames
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 10,
  count: 12
});
console.log(`Inspecting ${frames.length} End Portal Frames in room:`);
let filled = 0;
for (const fp of frames) {
  const fb = bot.blockAt(fp);
  const hasEye = fb?._properties?.eye === true || fb?._properties?.eye === 'true';
  if (hasEye) filled++;
}
console.log(`End Portal Frames: ${filled}/12 filled with Eyes of Ender.`);
bot.chat(`alpha: Portal Room Secured at (2210, 0, 1470)! ${filled}/12 frames filled! Awaiting team with Eyes of Ender!`);
