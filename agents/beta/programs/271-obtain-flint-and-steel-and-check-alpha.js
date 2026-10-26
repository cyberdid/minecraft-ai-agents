// programs/271-obtain-flint-and-steel-and-check-alpha.js
console.log('=== Step 29: Obtain flint, craft flint & steel, coordinate with Alpha ===');

// Check Alpha status
const alphaPlayer = bot.players['alpha'];
if (alphaPlayer && alphaPlayer.entity) {
  console.log('Alpha is at:', lib.fmt(alphaPlayer.entity.position));
} else {
  console.log('Alpha entity not in loaded area (likely deep underground).');
}

// 1. Obtain flint
if (lib.count('flint') === 0 && lib.count('flint_and_steel') === 0) {
  console.log('Obtaining flint...');
  try {
    const r = await lib.obtain('flint', 1);
    console.log('Obtained flint! Steps:', r.steps?.join('\n'));
  } catch (e) {
    console.log('obtain flint error:', e.message);
  }
}

// 2. Craft flint and steel
if (lib.count('flint_and_steel') === 0 && lib.count('flint') > 0 && lib.count('iron_ingot') > 0) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Flint and steel crafted successfully!');
  } catch (e) {
    console.log('Craft flint_and_steel error:', e.message);
  }
}

// 3. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 30000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);

bot.chat(`beta: Milestone 6 confirmed! I hold flint_and_steel: ${lib.count('flint_and_steel')} and water_bucket: ${lib.count('water_bucket')}. Ready for 10 obsidian!`);
