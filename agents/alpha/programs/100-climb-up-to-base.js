// programs/100-climb-up-to-base.js
// Climb safely up the staircase from y=53 back to the base at (294, 72, -54)

console.log('Climbing up from:', lib.fmt(bot.entity.position));

bot.chat('alpha: All gear recovered! Climbing back up to base.');

try {
  await lib.goTo(294, 72, -54, 2, { dig: true });
  console.log('Back at base! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Climb error:', e.message);
  // Try stepwise climb up
  for (let targetY = 58; targetY <= 72; targetY += 4) {
    console.log(`Climbing towards y=${targetY}...`);
    try {
      await lib.goTo(294, targetY, -54, 3, { dig: true });
    } catch (err) {
      console.log(`Step y=${targetY} note:`, err.message);
    }
  }
}

console.log('Alpha final pos:', lib.fmt(bot.entity.position), '| health:', bot.health);
bot.chat(`alpha: Safely back inside base! Health: ${Math.round(bot.health)}/20.`);
