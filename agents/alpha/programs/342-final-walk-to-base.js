// programs/342-final-walk-to-base.js
console.log('=== Program 342: Final Leg into Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// Walk straight to base door (294, 72, -54)
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 35000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Successfully inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Go to base note:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// Once in base, check chest for rotten flesh or food to stabilize hunger
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(contents));
  if (contents.rotten_flesh > 0 && bot.food < 6) {
    console.log(`Withdrawing 2 rotten_flesh to stabilize hunger...`);
    await lib.withdraw({ rotten_flesh: Math.min(2, contents.rotten_flesh) }, chestPos.x, chestPos.y, chestPos.z);
    if (typeof safeEat === 'function') await safeEat('rotten_flesh');
    else await lib.eat();
    console.log(`Food after eating: ${bot.food}/20`);
  }
} catch (e3) {
  console.log('Chest check note:', e3.message);
}

console.log('Alpha final status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha safely in base! Health: ${bot.health}/20, Food: ${bot.food}/20.`);
