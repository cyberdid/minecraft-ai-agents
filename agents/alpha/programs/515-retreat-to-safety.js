// programs/515-retreat-to-safety.js
console.log('=== Program 515: Emergency Retreat to Safety ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.pathfinder.stop();
await sleep(50);

// Sprint back to z=-150 (away from Blaze line-of-sight)
console.log('Retreating south to (44, 65, -150)...');
await bot.lookAt(new Vec3(44.5, 65.0, -145.0), true);
bot.setControlState('sprint', true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);
bot.setControlState('sprint', false);

console.log('Arrived at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Place a wall across the corridor at current z to seal off the north
const currPos = bot.entity.position;
const cz = Math.floor(currPos.z) - 1;
console.log(`Sealing corridor to the north at z=${cz}...`);
try {
  await lib.place('cobblestone', 44, 65, cz);
  await lib.place('cobblestone', 44, 66, cz);
  console.log(`Sealed corridor at (44, 65..66, ${cz})!`);
} catch (e) {
  console.log('Seal note:', e.message);
}

console.log('Safety status: Pos =', lib.fmt(bot.entity.position), 'HP =', bot.health);
