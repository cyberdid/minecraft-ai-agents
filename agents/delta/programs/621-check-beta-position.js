const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
if (beta) {
  console.log(`Beta pos: ${lib.fmt(beta.position)}, held: ${beta.heldItem ? beta.heldItem.name : 'empty'}`);
} else {
  console.log('Beta not found in loaded entities (deep underground)');
}

const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'alpha');
if (alpha) {
  console.log(`Alpha pos: ${lib.fmt(alpha.position)}, held: ${alpha.heldItem ? alpha.heldItem.name : 'empty'}`);
}

const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'gamma');
if (gamma) {
  console.log(`Gamma pos: ${lib.fmt(gamma.position)}, held: ${gamma.heldItem ? gamma.heldItem.name : 'empty'}`);
}
