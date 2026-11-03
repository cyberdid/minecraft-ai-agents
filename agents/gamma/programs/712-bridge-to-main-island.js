// programs/712-bridge-to-main-island.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 712: ADVANCE FROM OBSIDIAN PLATFORM TO MAIN ISLAND ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Equip shield in offhand and sword in main hand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

// Check 5x5 blocks around obsidian platform (x=98..103, z=-2..3, y=48..53)
console.log('Surveying platform surroundings:');
for (let dx = -3; dx <= 3; dx++) {
  for (let dz = -3; dz <= 3; dz++) {
    const p = new Vec3(100 + dx, 48, dz);
    const b48 = bot.blockAt(p)?.name;
    const b49 = bot.blockAt(p.offset(0, 1, 0))?.name;
    const b50 = bot.blockAt(p.offset(0, 2, 0))?.name;
    const b51 = bot.blockAt(p.offset(0, 3, 0))?.name;
    const b52 = bot.blockAt(p.offset(0, 4, 0))?.name;
    if (b48 !== 'air' || b49 !== 'air' || b50 !== 'air' || b51 !== 'air' || b52 !== 'air') {
      console.log(`(${p.x}, ${p.z}): y48=${b48}, y49=${b49}, y50=${b50}, y51=${b51}, y52=${b52}`);
    }
  }
}

// Find nearest end_stone block
const endStoneBlocks = bot.findBlocks({
  matching: b => b && b.name === 'end_stone',
  maxDistance: 32,
  count: 16
}).sort((a, b) => bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));

console.log(`Found ${endStoneBlocks.length} End Stone blocks nearby:`);
for (const esp of endStoneBlocks.slice(0, 5)) {
  console.log(`End Stone at ${lib.fmt(esp)}, dist=${bot.entity.position.distanceTo(esp).toFixed(1)}m`);
}

// Check where teammates are in The End
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Check Dragon
const dragon = Object.values(bot.entities).find(e => e && e.name === 'ender_dragon');
if (dragon) {
  console.log(`Dragon at ${lib.fmt(dragon.position)}, HP=${dragon.health}`);
}

return {
  pos: bot.entity.position,
  endStoneCount: endStoneBlocks.length,
  nearestEndStone: endStoneBlocks[0] ? lib.fmt(endStoneBlocks[0]) : null
};
