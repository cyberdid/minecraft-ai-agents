// programs/346-quarry-stone-craft-tools.js
console.log('--- Step 1: Step outside base ---');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('Door exit error:', e2.message);
  }
}

console.log('--- Step 2: Go to quarry area ---');
await lib.goTo(302, 71, -50, 2);

console.log('--- Step 3: Mine stone for stone tools ---');
// Collect at least 6 cobblestone
const got1 = await lib.collect('stone', 6);
console.log('Mined first batch:', JSON.stringify(got1), 'Cobble count:', lib.count('cobblestone'));

// Craft stone pickaxe and stone sword
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe! Count:', lib.count('stone_pickaxe'));
}

if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword! Count:', lib.count('stone_sword'));
}

console.log('--- Step 4: Mine more cobblestone with stone pickaxe ---');
// Now with stone pickaxe, mine 28 more cobblestone
const targetCobble = 32;
const needed = targetCobble - lib.count('cobblestone');
if (needed > 0) {
  const got2 = await lib.collect('stone', needed);
  console.log('Mined second batch:', JSON.stringify(got2), 'Total cobble:', lib.count('cobblestone'));
}

console.log('--- Step 5: Scan for nearby ores and animals ---');
const ores = lib.find(['iron_ore', 'deepslate_iron_ore', 'coal_ore'], { maxDistance: 48, count: 10 });
console.log('Nearby ores:', ores.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', ') || 'none');

const animals = ['cow', 'pig', 'sheep', 'chicken']
  .flatMap(type => Object.values(bot.entities).filter(e => e && e.name === type && e.position.distanceTo(bot.entity.position) < 48));
console.log('Nearby animals:', animals.map(a => `${a.name} at ${lib.fmt(a.position)} dist ${a.position.distanceTo(bot.entity.position).toFixed(1)}`).join(', ') || 'none');

console.log('Time remaining until night:', lib.time().secondsUntilNight, 's');
console.log('Inventory:', JSON.stringify(lib.inv()));
