console.log('=== Program 995: Reach Portal & Enter The End ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Holding:', lib.count('ender_eye'), 'Eyes of Ender!');

// Equip weapon and armor
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const portalCenter = new Vec3(2210.0, 0.0, 1470.0);
console.log(`Navigating from ${lib.fmt(bot.entity.position)} to Portal Room ${lib.fmt(portalCenter)}...`);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalCenter.x, portalCenter.y, portalCenter.z, 2.5));
} catch (err) {
  console.log('Pathfinder to portal room info:', err.message);
  try {
    await lib.goTo(portalCenter.x, portalCenter.y, portalCenter.z, 2.5, { timeoutMs: 15000, dig: true });
  } catch (e2) {}
}

console.log('Arrived near portal room! Pos:', lib.fmt(bot.entity.position));

// Scan for End Portal Frame blocks
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 16,
  count: 12
});

console.log(`Found ${frames.length} End Portal Frame blocks nearby.`);

// If frames exist, check for empty ones
const emptyFrames = [];
for (const p of frames) {
  const b = bot.blockAt(p);
  const hasEye = b?._properties?.eye === true || b?._properties?.eye === 'true';
  if (!hasEye) emptyFrames.push(b);
}
console.log(`Empty frames needing eyes: ${emptyFrames.length}/${frames.length}`);

if (emptyFrames.length > 0 && lib.count('ender_eye') > 0) {
  const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
  if (eye) {
    await bot.equip(eye, 'hand');
    console.log(`Equipped ender_eye (held: ${eye.count}). Inserting into ${emptyFrames.length} empty frames...`);
    for (const fb of emptyFrames) {
      try {
        console.log(`Inserting eye at ${lib.fmt(fb.position)}...`);
        await bot.lookAt(fb.position.offset(0.5, 0.5, 0.5), true);
        await bot.activateBlock(fb);
        await sleep(350);
      } catch (e) {
        console.log('Frame insert error:', e.message);
      }
    }
  }
}

// Check for active end_portal blocks
let portals = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 16,
  count: 9
});

console.log(`Found ${portals.length} active end_portal blocks!`);

if (portals.length > 0) {
  const targetPortal = portals[0];
  console.log(`STEPPING INTO ACTIVE END PORTAL AT ${lib.fmt(targetPortal)}!`);
  bot.chat('Beta: Entering End Portal! Warping to The End for Milestone 12 Ender Dragon battle!');

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(targetPortal.x, targetPortal.y, targetPortal.z));
  } catch (e) {
    await bot.lookAt(targetPortal.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
    bot.clearControlStates();
  }

  // Wait for dimension change
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_end' && Date.now() - warpStart < 15000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after portal entry:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  eyesRemaining: lib.count('ender_eye')
};
