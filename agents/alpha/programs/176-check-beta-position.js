// programs/176-check-beta-position.js
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    if (p.entity) {
      console.log(`Beta at ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}, held: ${p.entity.heldItem?.name}`);
    } else {
      console.log('Beta is online (entity not in direct render range)');
    }
  }
}

// Make sure base door is closed
const d = bot.blockAt(new Vec3(294, 72, -54));
if (d && d.getProperties().open) {
  await bot.activateBlock(d);
  console.log('Door closed.');
}

bot.chat('alpha: Inside base, night in 120s. Beta, are you almost at base?');
