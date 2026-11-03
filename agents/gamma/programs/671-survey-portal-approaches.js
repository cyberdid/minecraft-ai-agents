// programs/671-survey-portal-approaches.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 671: SURVEY APPROACHES & WARP ===');
bot.clearControlStates();

// Inspect z=-8 approach to Portal 2 (41, 65, -7)
console.log('Approach 1: z=-8 around portal frame:');
for (let x = 44; x >= 40; x--) {
  const f = bot.blockAt(new Vec3(x, 64, -8));
  const b1 = bot.blockAt(new Vec3(x, 65, -8));
  const b2 = bot.blockAt(new Vec3(x, 66, -8));
  console.log(`  x=${x} z=-8: floor=${f?.name}, y65=${b1?.name}, y66=${b2?.name}`);
}

// Inspect approach to Portal 1 at (47, 66, 2)
console.log('Approach 2: direct South from (50, 65, -7) to (47, 66, 2):');
for (let z = -6; z <= 2; z++) {
  const f = bot.blockAt(new Vec3(47, 65, z));
  const b1 = bot.blockAt(new Vec3(47, 66, z));
  console.log(`  x=47 z=${z}: y65=${f?.name}, y66=${b1?.name}`);
}

return { pos: bot.entity.position };
