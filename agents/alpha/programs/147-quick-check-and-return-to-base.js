// programs/147-quick-check-and-return-to-base.js
console.log('--- Quick Sheep Check & Return to Base ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Check if sheep is right next to us
let nearbySheep = null;
for (const e of Object.values(bot.entities)) {
  if (e && e.name === 'sheep' && e.position) {
    const d = bot.entity.position.distanceTo(e.position);
    if (d < 20) {
      nearbySheep = e;
      break;
    }
  }
}

if (nearbySheep) {
  console.log(`Found nearby sheep at ${lib.fmt(nearbySheep.position)}, hunting quickly...`);
  try {
    await lib.hunt('sheep', 1);
    console.log('Hunt done! Wool now: brown=', lib.count('brown_wool'), 'white=', lib.count('white_wool'));
  } catch (e) {
    console.log('Quick hunt error:', e.message);
  }
} else {
  console.log('No sheep within 20 blocks.');
}

// 2. Return to base at (294, -53)
console.log('Returning to base at (294, -53)... Distance:', bot.entity.position.distanceTo(new Vec3(294, 72, -53)).toFixed(1));

try {
  await lib.goToXZ(294, -53);
  console.log('Arrived near base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goToXZ error:', e.message, '- continuing approach');
  try {
    await lib.goTo(294, 72, -53, 2);
  } catch (e2) {
    console.log('goTo error:', e2.message);
  }
}

// 3. Step inside base
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 8) {
  console.log('Entering base through door...');
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await lib.walkTo(293.5, -56.0, 3000);
    await lib.door(294, 72, -54, false);
    console.log('Inside base and door closed!');
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight, 's');
bot.chat('alpha: Back at base! Ready to coordinate with Beta.');
