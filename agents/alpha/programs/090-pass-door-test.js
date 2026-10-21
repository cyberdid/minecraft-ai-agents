// programs/090-pass-door-test.js
// Custom reliable door passage

console.log('Testing custom door passage...');
// 1. Open door
await lib.door(294, 72, -54, true);
await sleep(200);

// 2. Walk straight out to z=-52
await lib.walkTo(294.5, -52);
console.log('Walked out! Pos:', lib.fmt(bot.entity.position));

// 3. Close door
await lib.door(294, 72, -54, false);
console.log('Door closed behind us.');

// 4. Now walk back in: open door, walk to z=-56, close door
await sleep(500);
await lib.door(294, 72, -54, true);
await sleep(200);
await lib.walkTo(294.5, -56);
console.log('Walked back in! Pos:', lib.fmt(bot.entity.position));
await lib.door(294, 72, -54, false);
console.log('Door closed. Test successful!');
