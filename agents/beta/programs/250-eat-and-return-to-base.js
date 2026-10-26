// programs/250-eat-and-return-to-base.js
console.log('=== Step 8: Eat, check for 1 sheep, return to base, smelt food ===');

// 1. Check for immediate sheep nearby
const nearSheep = Object.values(bot.entities).find(e => 
  e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 16
);
if (nearSheep) {
  console.log('Found immediate sheep at:', lib.fmt(nearSheep.position));
  try {
    bot.pvp.attack(nearSheep);
    const deadline = Date.now() + 10000;
    while (bot.entities[nearSheep.id] && Date.now() < deadline) await sleep(250);
    bot.pvp.stop();
    await lib.pickup(6);
  } catch (e) {
    console.log('Sheep attack note:', e.message);
  }
}

// 2. Eat to restore hunger
console.log('Eating food to restore sprint and health...');
while (bot.food < 16 && (lib.count('beef') > 0 || lib.count('porkchop') > 0 || lib.count('mutton') > 0)) {
  await lib.eat();
  await sleep(400);
}
console.log(`Food now: ${bot.food}/20, Health: ${bot.health}/20`);

// 3. Return to base
console.log('Walking back to base at (294, 72, -54)...');
await lib.goToXZ(294, -54, { timeoutMs: 50000 });
await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });

try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  console.log('Door entry note:', e.message);
}

try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 4. Distribute smelting
// We have oak_log and birch_log for fuel (1 log = 4 planks = 6 smelts, or 1 log smelts 1.5 items)
// Convert some logs to planks for fuel
if (lib.count('*_log') > 0) {
  const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  await lib.craft(logType.replace('_log', '_planks'), 16);
}

console.log('Beta inventory at base:', JSON.stringify(lib.inv()));
console.log('Seconds until night:', lib.time().secondsUntilNight);

bot.chat(`beta: Returned to base! Carrying ${lib.count('beef') + lib.count('mutton') + lib.count('porkchop')} meat, wool: ${lib.count('*_wool')}. Smelting food now.`);
