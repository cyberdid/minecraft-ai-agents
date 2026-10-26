// programs/376-return-to-bunker-and-gear-up.js
console.log('=== Program 376: Return to Bunker, Craft Tools & Meet Beta ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Ascend back to Nether bunker at (40, 65, -7)
console.log('Ascending back to Nether bunker (40, 65, -7)...');
try {
  await lib.goTo(40.5, 65.0, -7.0, 1, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo bunker note:', e.message);
  // If in depression, jump and tower up using netherrack
  try {
    await lib.goToXZ(40.5, -7.0, { timeoutMs: 20000 });
  } catch (e2) {}
}

console.log('Alpha at bunker level:', lib.fmt(bot.entity.position));

// 2. Craft gold ingots from gold nuggets (2x2 grid)
if (lib.count('gold_nugget') >= 9) {
  const possibleIngots = Math.floor(lib.count('gold_nugget') / 9);
  console.log(`Crafting ${possibleIngots} gold ingots from ${lib.count('gold_nugget')} nuggets...`);
  try {
    await lib.craft('gold_ingot', possibleIngots);
    console.log('Gold ingots in inv:', lib.count('gold_ingot'));
  } catch (e) {
    console.log('Craft gold_ingot note:', e.message);
  }
}

// 3. Craft spare stone pickaxes
if (lib.count('stone_pickaxe') < 2 && lib.count('cobblestone') >= 6) {
  console.log('Crafting spare stone pickaxes...');
  try {
    if (lib.count('stick') < 4 && lib.count('*_planks') > 0) {
      await lib.craft('stick', 4);
    }
    await lib.craft('stone_pickaxe', 2);
    console.log('Stone pickaxes now:', lib.count('stone_pickaxe'));
  } catch (e) {
    console.log('Craft pickaxe note:', e.message);
  }
}

// 4. Check bunker door spot and install oak_door if gap found
const doorPos = new Vec3(42, 65, -7);
const doorBlock = bot.blockAt(doorPos);
console.log('Door spot block:', doorBlock?.name);
if (lib.count('oak_door') > 0 && doorBlock && doorBlock.name === 'air') {
  console.log('Installing oak_door at bunker entrance...');
  try {
    await lib.place('oak_door', doorPos.x, doorPos.y, doorPos.z);
    console.log('Oak door installed successfully!');
  } catch (e) {
    console.log('Place door note:', e.message);
  }
}

// 5. Check Beta position
const beta = bot.players['beta'];
if (beta && beta.entity) {
  const dist = bot.entity.position.distanceTo(beta.entity.position);
  console.log(`Beta located at ${lib.fmt(beta.entity.position)}, distance=${dist.toFixed(1)}m`);
}

bot.chat(`team: Alpha back in Nether bunker (40, 65, -7). Gold ingots: ${lib.count('gold_ingot')}, Cobble: ${lib.count('cobblestone')}. Ready to advance with Beta!`);

console.log('Alpha status:', JSON.stringify(lib.status()));
