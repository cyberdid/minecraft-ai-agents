// programs/874-activate-end-portal-and-enter.js
console.log('=== Program 874: Activate End Portal & Enter The End ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Locate all 12 End Portal Frames
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 16,
  count: 12
});

console.log(`Found ${frames.length}/12 End Portal Frames.`);

// 2. Check how many already have an eye
let emptyFrames = [];
for (const p of frames) {
  const b = bot.blockAt(p);
  const hasEye = b?._properties?.eye === true || b?._properties?.eye === 'true';
  if (!hasEye) emptyFrames.push(b);
}
console.log(`Empty frames needing eyes: ${emptyFrames.length}/12`);

// 3. If Alpha holds ender_eye, insert into empty frames
const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
if (eye && emptyFrames.length > 0) {
  await bot.equip(eye, 'hand');
  console.log(`Alpha equipping ender_eye (count: ${eye.count})...`);
  
  for (const fb of emptyFrames) {
    try {
      console.log(`Inserting eye into frame at ${lib.fmt(fb.position)}...`);
      await bot.lookAt(fb.position.offset(0.5, 0.5, 0.5), true);
      await bot.activateBlock(fb);
      await sleep(300);
    } catch (e) {
      console.log(`Activation error:`, e.message);
    }
  }
}

// 4. Check if End Portal is active
const portalBlocks = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 12,
  count: 9
});

if (portalBlocks.length > 0) {
  console.log(`END PORTAL IS ACTIVE! Found ${portalBlocks.length} end_portal blocks! [The End?]`);
  bot.chat('alpha: END PORTAL ACTIVATED! Milestone 11 COMPLETE! Jumping into The End!');
  
  // Step into portal
  const targetPortal = portalBlocks[0];
  await bot.lookAt(targetPortal.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  
  const startWait = Date.now();
  while (bot.game.dimension !== 'the_end' && Date.now() - startWait < 15000) {
    await sleep(250);
  }
  bot.clearControlStates();
  
  console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);
} else {
  console.log(`Waiting for team to insert remaining ${emptyFrames.length} Eyes of Ender.`);
}
