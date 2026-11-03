// programs/735-defend-room-and-fill-portal.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 735: DEFEND PORTAL ROOM & FILL END PORTAL FRAMES ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Equip weapon & shield
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Slay nearby silverfish
const silverfish = Object.values(bot.entities).filter(e => e.name === 'silverfish' && e.isValid);
console.log(`Nearby silverfish: ${silverfish.length}`);
for (const s of silverfish) {
  if (bot.entity.position.distanceTo(s.position) <= 4.0) {
    console.log(`Striking silverfish at ${lib.fmt(s.position)}...`);
    await bot.lookAt(s.position.offset(0, 0.2, 0), true);
    bot.attack(s);
    await sleep(400);
  }
}

// Check players in render
console.log('--- Players in Render ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
}

// Pickup any dropped items (e.g. eyes tossed by beta)
try { await lib.pickup(6.0); } catch (e) {}

// Locate all 12 frames
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 16,
  count: 12
});

const emptyFrames = [];
for (const fp of frames) {
  const b = bot.blockAt(fp);
  const hasEye = b?._properties?.eye === true || b?._properties?.eye === 'true';
  if (!hasEye) emptyFrames.push(b);
}

console.log(`Frames status: ${12 - emptyFrames.length}/12 filled, ${emptyFrames.length} empty.`);

// If delta has ender_eye, insert into empty frames
if (lib.count('ender_eye') > 0 && emptyFrames.length > 0) {
  const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
  if (eye) {
    await bot.equip(eye, 'hand');
    console.log(`Delta equipping ender_eye (count: ${eye.count})...`);
    for (const fb of emptyFrames) {
      if (lib.count('ender_eye') === 0) break;
      try {
        console.log(`Delta inserting eye into frame at ${lib.fmt(fb.position)}...`);
        await bot.lookAt(fb.position.offset(0.5, 0.8, 0.5), true);
        await bot.activateBlock(fb);
        await sleep(350);
      } catch (err) {
        console.log('Frame insert error:', err.message);
      }
    }
  }
} else if (emptyFrames.length > 0) {
  bot.chat(`beta: Delta & Alpha are in End Portal Room at (2210, 0, 1470)! Bring your 18 Eyes of Ender to activate the portal!`);
}

// Check for active end_portal blocks
const portals = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 10,
  count: 9
});

console.log(`Active End Portal blocks: ${portals.length}`);

if (portals.length > 0) {
  console.log('=== END PORTAL ACTIVE! STEPPING IN! ===');
  bot.chat('delta: END PORTAL ACTIVATED! Milestone 11 COMPLETE! Entering The End!');
  const p0 = portals[0];
  await bot.lookAt(p0.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  const startWarp = Date.now();
  while (bot.game.dimension !== 'the_end' && Date.now() - startWarp < 12000 && !isCancelled()) {
    await sleep(250);
  }
  bot.clearControlStates();
  console.log(`Delta Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  emptyFrames: emptyFrames.length,
  portalsActive: portals.length,
  hp: bot.health,
  food: bot.food
};
