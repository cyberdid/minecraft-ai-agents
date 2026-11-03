console.log('=== DELTA: LIGHT PORTAL AT (46, 66, 2) ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

// Look at blocks at z = 2
for (let x = 45; x <= 48; x++) {
  for (let y = 65; y <= 69; y++) {
    const b = bot.blockAt(new Vec3(x, y, 2));
    if (b && b.name !== 'air') {
      console.log(`Block at (${x}, ${y}, 2): ${b.name}`);
    }
  }
}

// Sill blocks should be at (46, 65, 2) and (47, 65, 2)
const sill1 = bot.blockAt(new Vec3(46, 65, 2));
const sill2 = bot.blockAt(new Vec3(47, 65, 2));
console.log(`Sill 1: ${sill1 ? sill1.name : 'null'}`);
console.log(`Sill 2: ${sill2 ? sill2.name : 'null'}`);

const flint = bot.inventory.items().find(i => i.name === 'flint_and_steel');
if (flint) {
  await bot.equip(flint.type, 'hand');
  const targetSill = (sill1 && sill1.name === 'obsidian') ? sill1 : sill2;
  if (targetSill) {
    console.log(`Lighting portal on top of ${lib.fmt(targetSill.position)}...`);
    await bot.lookAt(targetSill.position.offset(0.5, 1.0, 0.5), true);
    await bot.activateBlock(targetSill, new Vec3(0, 1, 0));
    await sleep(1500);

    const portals = bot.findBlocks({
      matching: b => b && b.name === 'nether_portal',
      maxDistance: 6,
      count: 10
    });
    console.log(`Nether portal blocks created: ${portals.length}`);
    for (const p of portals) {
      console.log(`  Portal: ${lib.fmt(p)}`);
    }
    if (portals.length > 0) {
      bot.chat('delta: Nether portal at (46..47, 66, 2) successfully RELIT and active!');
    }
  }
}

return {
  pos: bot.entity.position
};
