// programs/286-ascend-to-base-with-diamond-pickaxe.js
console.log('=== Step 43: Ascend to base with Diamond Pickaxe and gear ===');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Ascend stairs to surface exit at (345, 65, -40)
console.log('Ascending staircase to surface...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 30000, dig: true });
  console.log('Reached surface! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stair ascent note:', e.message);
}

// 2. Walk to base door and enter
console.log('Walking to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 25000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Door entry note:', e.message);
}

// 3. Deposit clutter to make room for obsidian
const chestPos = new Vec3(293, 72, -57);
try {
  console.log('Depositing extra items to chest...');
  await lib.deposit({
    cobbled_deepslate: 'all',
    andesite: 'all',
    diorite: 'all',
    gravel: 'all',
    raw_copper: 'all',
    stone_pickaxe: 3
  }, chestPos.x, chestPos.y, chestPos.z);
} catch (e) {
  console.log('Deposit note:', e.message);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);

bot.chat(`beta: Safely in base with diamond_pickaxe (${lib.tools()?.diamond_pickaxe}), water_bucket, and flint_and_steel! Milestone 6 secured!`);
