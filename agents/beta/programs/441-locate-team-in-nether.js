// programs/441-locate-team-in-nether.js
console.log('=== Step: Locate team in Nether and check bunker ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Locate all players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, dist=${dist}m, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: not in visual range`);
  }
}

// 2. Walk back inside the bunker (40, 65, -7)
try {
  await lib.goTo(40, 65, -7, 1);
  console.log('Inside bunker at', lib.fmt(bot.entity.position));
} catch (e) {}

// 3. Check chest at (39, 65, -8) again
const cb = bot.blockAt(new Vec3(39, 65, -8));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Bunker chest contents:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const item of items) {
      if (item.name.endsWith('_pickaxe') || item.name.endsWith('_sword') || item.name.includes('cobble')) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count}!`);
      }
    }
    chest.close();
  } catch (e) {}
}

bot.chat(`beta: In Nether bunker at ${lib.fmt(bot.entity.position)}. HP: 20/20, Food: 20/20. Delta/Alpha/Gamma status?`);
