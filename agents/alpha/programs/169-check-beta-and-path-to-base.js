// programs/169-check-beta-and-path-to-base.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Check where Beta is
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    if (p.entity) {
      console.log(`Beta is at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
    } else {
      console.log(`Beta is online (no entity rendered)`);
    }
  }
}

// Check terrain toward base: along line from (306, 64, -44) to (294, 72, -54)
// Let's test if pathfinder with dig:true can reach (294, 72, -53)
console.log('Trying lib.goTo to base with dig: true...');
try {
  await lib.goTo(294, 72, -53, 2, { dig: true });
  console.log('Successfully reached base!');
} catch (e) {
  console.log('goTo error:', e.message);
}

console.log('Pos now:', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight, 's');
