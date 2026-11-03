const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
if (beta) {
  console.log(`Beta pos: ${lib.fmt(beta.position)}, held: ${beta.heldItem ? beta.heldItem.name : 'empty'}`);
} else {
  console.log('Beta not found nearby');
}

bot.chat('beta: Beta! When scooping lava at (286, 18, 8), stand at (288, 19, 7) on the solid stone ledge and scoop lava from 3 blocks away! Do not walk past x=286!');
