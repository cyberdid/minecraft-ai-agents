// programs/189-return-to-base-and-coordinate-recovery.js
console.log('--- Returning to Base & Coordinating Beta Recovery ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Run back towards base at (294, 72, -53)
console.log('Returning to base...');
try {
  await lib.goToXZ(294, -53);
  console.log('Near base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goToXZ note:', e.message);
  try {
    await lib.goTo(294, 72, -53, 2);
  } catch (e2) {}
}

// 2. Step inside base
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 8) {
  try {
    const d = bot.blockAt(new Vec3(294, 72, -54));
    if (d && !d.getProperties().open) await bot.activateBlock(d);
    await lib.walkTo(293.5, -56.0, 3000);
    const dAfter = bot.blockAt(new Vec3(294, 72, -54));
    if (dAfter && dAfter.getProperties().open) await bot.activateBlock(dAfter);
    console.log('Inside base!');
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

// 3. Check Beta's position
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

bot.chat('beta: I am at base. What are the exact coordinates of your death? We have 4 minutes to recover the diamond_pickaxe!');

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight, 's');
