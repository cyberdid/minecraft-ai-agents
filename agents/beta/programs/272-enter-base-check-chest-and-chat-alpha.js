// programs/272-enter-base-check-chest-and-chat-alpha.js
console.log('=== Step 30: Enter base, check chest supplies, coordinate obsidian ===');

// 1. Enter base
console.log('Entering base...');
await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000, dig: true });
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  console.log('Door note:', e.message);
  await lib.goTo(294, 72, -55, 1);
}

// 2. Check chest contents
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

// Check wool for Bed 2
const woolColors = ['gray', 'light_gray', 'white', 'black', 'brown'];
for (const c of woolColors) {
  const wn = `${c}_wool`;
  const total = (chest[wn] || 0) + lib.count(wn);
  if (total >= 3) {
    if (chest[wn]) await lib.withdraw({ [wn]: chest[wn] }, chestPos.x, chestPos.y, chestPos.z);
    const bn = `${c}_bed`;
    console.log(`Crafting ${bn}...`);
    try {
      await lib.craft(bn, 1);
      await lib.place(bn, 293, 72, -56);
      console.log(`Placed Bed 2! Block at (293, 72, -56): ${lib.blockAt(293, 72, -56)?.name}`);
      bot.chat(`alpha: Bed 2 placed at (293, 72, -56)! Milestone 4 complete!`);
    } catch (e) {
      console.log('Bed error:', e.message);
    }
    break;
  }
}

// Check obsidian in chest or inventory
const totalObsidian = (chest.obsidian || 0) + lib.count('obsidian');
console.log(`Total obsidian available: ${totalObsidian}`);

// Check Alpha entity
const alpha = bot.players['alpha'];
if (alpha && alpha.entity) {
  console.log('Alpha at:', lib.fmt(alpha.entity.position));
} else {
  console.log('Alpha entity not in loaded area.');
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);

bot.chat(`beta: At base. Flint_and_steel: ${lib.count('flint_and_steel')}, water_bucket: ${lib.count('water_bucket')}, obsidian: ${totalObsidian}. Portal frame ready at (298, 72, -54).`);
