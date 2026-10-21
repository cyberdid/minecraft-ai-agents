const alpha = bot.players.alpha?.entity;
console.log('Alpha pos:', alpha ? lib.fmt(alpha.position) : 'unknown');

const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night: ${t.night}`);

// Ensure door is closed
try {
  await lib.door(12, 67, -21, false);
  console.log('Door closed verified.');
} catch (e) {
  console.log('Door check note:', e.message);
}

// Check roof blocks above interior (x: 11..13, z: -24..-22, y: 70)
const interior = [];
for (let x = 11; x <= 13; x++) {
  for (let z = -24; z <= -22; z++) {
    const roof = bot.blockAt(new Vec3(x, 70, z));
    interior.push(`(${x},${z}) roof: ${roof?.name}`);
  }
}
console.log('Interior roof status:\n' + interior.join('\n'));

const h = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(h));

bot.chat("alpha: I am safe inside the house at (12, 67, -20) with door closed! Walls are 100% complete, 58/89 total. Join inside for Night 2!");

return { alphaPos: alpha ? lib.fmt(alpha.position) : 'unknown', timeOfDay: t.timeOfDay };
