// programs/860-activate-end-portal.js
console.log('=== Program 860: Activate End Portal ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 16,
  count: 12
});

console.log(`Found ${frames.length}/12 End Portal Frame blocks nearby.`);

if (frames.length > 0) {
  // Equip ender_eye
  const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
  if (eye) {
    await bot.equip(eye, 'hand');
    console.log(`Equipped ender_eye (count: ${lib.count('ender_eye')}).`);

    for (const p of frames) {
      const b = bot.blockAt(p);
      const hasEye = b?._properties?.eye === true || b?._properties?.eye === 'true';
      if (!hasEye) {
        console.log(`Frame at ${lib.fmt(p)} is empty! Inserting Eye of Ender...`);
        try {
          await bot.lookAt(p.offset(0.5, 0.5, 0.5), true);
          await bot.activateBlock(b);
          await sleep(300);
        } catch (e) {
          console.log(`Error activating frame at ${lib.fmt(p)}:`, e.message);
        }
      } else {
        console.log(`Frame at ${lib.fmt(p)} already has an eye.`);
      }
    }

    // Check if end_portal formed!
    const portal = bot.findBlock({
      matching: b => b && b.name === 'end_portal',
      maxDistance: 10
    });

    if (portal) {
      console.log('END PORTAL IS ACTIVATED! [The End?]');
      bot.chat('alpha: END PORTAL ACTIVATED! Milestone 11 COMPLETE! Ready to enter The End!');
    } else {
      console.log('End portal not yet active; check remaining empty frames.');
    }
  } else {
    console.log('No ender_eye in inventory!');
  }
} else {
  console.log('No end_portal_frame blocks within 16m. Keep exploring Stronghold corridors.');
}
