// programs/570-check-chest-iron-and-mold.js
console.log('=== CHECK CHEST & STAND BY AT PORTAL MOLD ===');

// Check chest
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock) {
  try {
    const chest = await bot.openChest(cBlock);
    const iron = chest.containerItems().find(i => i.name === 'iron_ingot' || i.name === 'raw_iron');
    if (iron) {
      console.log(`Found ${iron.name} x${iron.count} in chest! Withdrawing...`);
      await chest.withdraw(iron.type, null, 1);
    }
    const fas = chest.containerItems().find(i => i.name === 'flint_and_steel');
    if (fas) {
      console.log('Found flint_and_steel in chest! Withdrawing...');
      await chest.withdraw(fas.type, null, 1);
    }
    chest.close();
  } catch (e) {}
}

// Craft flint_and_steel if we have iron ingot
if (lib.count('flint') >= 1 && lib.count('iron_ingot') >= 1 && lib.count('flint_and_steel') === 0) {
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('FLINT AND STEEL CRAFTED BY DELTA!');
    bot.chat('delta: Crafted flint_and_steel! Standing by at portal frame to ignite!');
  } catch (e) {}
}

// Step to portal casting basin at (299, 73, -52)
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 1.0));
} catch (e) {}

// Check basin block at (299, 72, -54)
const basin = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal basin block at (299, 72, -54): ${basin ? basin.name : 'null'}`);

// Check if nether_portal block appears
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
console.log(`Portal status: ${portal ? 'ACTIVE' : 'WAITING FOR LAVA/IGNITE'}`);

bot.chat(`delta: Standing by at portal frame (299, 73, -52). Flint held: ${lib.count('flint')}, Flint&Steel: ${lib.count('flint_and_steel')}. Ready to ignite!`);

return {
  flint: lib.count('flint'),
  flint_and_steel: lib.count('flint_and_steel'),
  basinBlock: basin?.name,
  portalActive: !!portal
};
