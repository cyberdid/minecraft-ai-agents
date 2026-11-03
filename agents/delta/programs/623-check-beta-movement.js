const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
if (beta) {
  console.log(`Beta pos: ${lib.fmt(beta.position)}, held: ${beta.heldItem ? beta.heldItem.name : 'empty'}`);
} else {
  console.log('Beta not found');
}
