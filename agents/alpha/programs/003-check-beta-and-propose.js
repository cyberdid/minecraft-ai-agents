// programs/003-check-beta-and-propose.js
const beta = bot.players['beta'];
let betaPosStr = 'unknown';
if (beta && beta.entity) {
  const p = beta.entity.position;
  betaPosStr = `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`;
}
console.log('beta is at:', betaPosStr);

// Propose base location: flat area at (292, 72, -58), floor at 71, corner at (292, 72, -58)
// House 5x5: x from 292 to 296, z from -58 to -54.
// Door on south (z = -54).
const proposal = 'Base proposal: corner (292, 72, -58), 5x5, door south. I will gather cobblestone for walls and furnace, beta can gather wood/planks for roof and chest.';
bot.chat(proposal);
console.log('Chat sent:', proposal);

// Also collect 30 cobblestone now while daylight is good (night in ~280s)
console.log('Collecting stone...');
const beforeStone = lib.count('cobblestone');
try {
  const got = await lib.collect('stone', 25);
  console.log('Collected stone:', JSON.stringify(got));
} catch (e) {
  console.log('Error collecting stone:', e.message);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

return { betaPos: betaPosStr, cobblestone: lib.count('cobblestone'), time: lib.time() };
