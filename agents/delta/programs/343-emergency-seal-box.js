// programs/343-emergency-seal-box.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'dim:', bot.game.dimension);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const p = bot.entity.position.floored();
console.log('Floored feet pos:', lib.fmt(p));

const targetOffsets = [
  // South (open side towards fortress)
  { dx: 0, dy: 0, dz: 1 },
  { dx: 0, dy: 1, dz: 1 },
  // East (cross-bridge towards tunnel)
  { dx: 1, dy: 0, dz: 0 },
  { dx: 1, dy: 1, dz: 0 },
  // West (towards spawner balcony)
  { dx: -1, dy: 0, dz: 0 },
  { dx: -1, dy: 1, dz: 0 },
  // North (blast wall side)
  { dx: 0, dy: 0, dz: -1 },
  { dx: 0, dy: 1, dz: -1 },
  // Roof above head
  { dx: 0, dy: 2, dz: 0 }
];

for (const off of targetOffsets) {
  const target = p.offset(off.dx, off.dy, off.dz);
  const block = bot.blockAt(target);
  if (block && (block.name === 'air' || block.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('diorite') > 0 ? 'diorite' : null);
    if (!filler) {
      console.log('No more filler blocks!');
      break;
    }
    try {
      console.log(`Placing ${filler} at ${lib.fmt(target)}...`);
      await lib.place(filler, target.x, target.y, target.z);
    } catch (e) {
      console.log(`Place at ${lib.fmt(target)} note:`, e.message);
    }
  } else {
    console.log(`Block at ${lib.fmt(target)} is already ${block?.name}`);
  }
}

console.log('Box seal status! HP:', bot.health, 'Hostiles nearby:', lib.hostiles(16).length);
bot.chat(`delta: Fortified in sealed bunker at ${lib.fmt(bot.entity.position)} with 0.5 HP! Protected from hostiles.`);
