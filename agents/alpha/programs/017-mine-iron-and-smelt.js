// programs/017-mine-iron-and-smelt.js
// Mine iron ore, return to base, smelt into iron ingots, craft iron tools!

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Scan for iron ore in range
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 48, count: 20 });
console.log(`Found ${ironOres.length} iron ore blocks in range`);
ironOres.slice(0, 5).forEach(o => console.log(`  ${o.name} at ${lib.fmt(o.position)} dist ${bot.entity.position.distanceTo(o.position).toFixed(1)}`));

// 2. Open door and step outside
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping outside to (294, -51)...');
await lib.walkTo(294, -51);

// Close door
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

bot.chat('alpha: Heading to mine iron ore for tools and armor.');

// 3. Collect iron ore
const rawIronBefore = lib.count('raw_iron');
console.log('Raw iron before:', rawIronBefore);
try {
  const got = await lib.collect(['iron_ore', 'deepslate_iron_ore'], 15);
  console.log('Mined iron:', JSON.stringify(got));
} catch (e) {
  console.log('Collect iron note:', e.message);
}

console.log('Raw iron now:', lib.count('raw_iron'));

// 4. Return to base
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1);

// Open door and step inside
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 5. Smelt raw_iron if we have any
const rawCount = lib.count('raw_iron');
if (rawCount > 0) {
  // Check fuel: smelt 1 log into charcoal if needed, or use planks
  if (lib.count('*_planks') < 4 && lib.count('*_log') > 0) {
    await lib.craft('oak_planks', 4);
  }
  const fuel = lib.count('charcoal') > 0 ? 'charcoal' : (lib.count('*_planks') > 0 ? 'oak_planks' : 'oak_log');
  console.log(`Smelting ${rawCount} raw iron with ${fuel}...`);
  try {
    const smeltRes = await lib.smelt('raw_iron', fuel, rawCount);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 6. Check iron_ingot count and craft tools
console.log('Iron ingots in inventory:', lib.count('iron_ingot'));
// Ensure sticks
if (lib.count('stick') < 6 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 8);
}

// Craft tools for Milestone 2:
// iron sword: 2 ingots + 1 stick
if (lib.count('iron_sword') === 0 && lib.count('iron_ingot') >= 2) {
  await lib.craft('iron_sword', 1);
  console.log('Crafted iron_sword');
}
// iron axe: 3 ingots + 2 sticks
if (lib.count('iron_axe') === 0 && lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_axe', 1);
  console.log('Crafted iron_axe');
}
// beta's iron tools (store in chest):
// beta pickaxe
if (lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_pickaxe', 1);
  console.log('Crafted second iron_pickaxe for beta');
}
// beta sword
if (lib.count('iron_ingot') >= 2) {
  await lib.craft('iron_sword', 1);
  console.log('Crafted second iron_sword for beta');
}
// beta axe
if (lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_axe', 1);
  console.log('Crafted second iron_axe for beta');
}

// Deposit beta's tools into chest at (293, 72, -57)
const chestPos = { x: 293, y: 72, z: -57 };
if (lib.count('iron_sword') > 1 || lib.count('iron_axe') > 1 || lib.count('iron_pickaxe') > 1) {
  console.log('Depositing beta tools into chest...');
  // deposit extra tools
  // keep 1 of each for alpha
}

const time = lib.time();
console.log('Time remaining until night:', time.secondsUntilNight, 's');

return {
  rawIron: lib.count('raw_iron'),
  ironIngots: lib.count('iron_ingot'),
  ironPickaxe: lib.count('iron_pickaxe'),
  ironSword: lib.count('iron_sword'),
  ironAxe: lib.count('iron_axe'),
  time: time.secondsUntilNight
};
