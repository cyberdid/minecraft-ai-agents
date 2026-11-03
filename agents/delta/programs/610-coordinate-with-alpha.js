const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'alpha');
if (alpha) {
  console.log(`Alpha pos: ${lib.fmt(alpha.position)}, held: ${alpha.heldItem ? alpha.heldItem.name : 'empty'}`);
} else {
  console.log('Alpha not found nearby');
}

const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'gamma');
if (gamma) {
  console.log(`Gamma pos: ${lib.fmt(gamma.position)}, held: ${gamma.heldItem ? gamma.heldItem.name : 'empty'}`);
}

bot.chat('alpha: Alpha! You have the diamond pickaxe and water bucket. Please use makeObsidianSafe(1) to mine 1 obsidian and place it at (299, 72, -54)!');
