// programs/129-check-alpha-chat.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check if any player is in dimension
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
    } else {
      console.log(`Player ${name}: not in loaded chunks/dimension.`);
    }
  }
}

bot.chat('delta: BLAZE SPAWNER CONFIRMED AT (32, 68, -190) ON NETHER BRICK PILLAR! Bunker at (44, 65, -129) is ready with supplies.');
