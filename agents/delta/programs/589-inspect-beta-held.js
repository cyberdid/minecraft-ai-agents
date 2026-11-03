const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
if (beta) {
  console.log('Beta entity info:');
  console.log('  pos:', lib.fmt(beta.position));
  console.log('  heldItem:', beta.heldItem ? `${beta.heldItem.name} (${beta.heldItem.count})` : 'nothing');
  console.log('  metadata:', beta.metadata);
} else {
  console.log('Beta not found');
}
