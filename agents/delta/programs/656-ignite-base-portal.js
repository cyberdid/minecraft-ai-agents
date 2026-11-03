console.log('=== DELTA: IGNITE NETHER BASE CAMP PORTAL ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

// Sill blocks: (40, 64, -7) and (41, 64, -7)
const sill1 = new Vec3(40, 64, -7);
const sill2 = new Vec3(41, 64, -7);

// Stand in front of portal
try {
  await bot.pathfinder.goto(new goals.GoalNear(40.5, 65.0, -5.5, 1.0));
} catch (e) {
  console.log('Goto error:', e.message);
}

const flint = bot.inventory.items().find(i => i.name === 'flint_and_steel');
if (!flint) {
  throw new Error('No flint_and_steel in inventory!');
}

await bot.equip(flint.type, 'hand');

// Check block at sill
const b1 = bot.blockAt(sill1);
const b2 = bot.blockAt(sill2);
console.log(`Sill 1 (${lib.fmt(sill1)}): ${b1 ? b1.name : 'null'}`);
console.log(`Sill 2 (${lib.fmt(sill2)}): ${b2 ? b2.name : 'null'}`);

const targetSill = (b1 && b1.name === 'obsidian') ? b1 : b2;
if (!targetSill || targetSill.name !== 'obsidian') {
  throw new Error(`Sill block is not obsidian: ${targetSill ? targetSill.name : 'null'}`);
}

console.log(`Lighting portal on top of ${lib.fmt(targetSill.position)}...`);
await bot.lookAt(targetSill.position.offset(0.5, 1.0, 0.5), true);
await bot.activateBlock(targetSill, new Vec3(0, 1, 0));
await sleep(1500);

// Check if nether_portal blocks were created
const createdPortals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 6
});

console.log(`Active portal blocks created: ${createdPortals.length}`);
for (const cp of createdPortals) {
  console.log(`  Portal block: ${lib.fmt(cp)}`);
}

if (createdPortals.length > 0) {
  bot.chat('delta: Nether Base Camp portal at (40..41, 65, -7) RELIT and active!');
} else {
  // Try lighting the other sill or the ground
  console.log('Trying alternative sill block...');
  if (b2 && b2.name === 'obsidian') {
    await bot.lookAt(b2.position.offset(0.5, 1.0, 0.5), true);
    await bot.activateBlock(b2, new Vec3(0, 1, 0));
    await sleep(1500);
  }
}

return {
  pos: bot.entity.position,
  portals: createdPortals.length
};
