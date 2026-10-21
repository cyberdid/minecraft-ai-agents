// programs/027-mine-hill-vein-and-return.js
// Mine iron vein at (335, 59, -41), return to base, smelt ingots, craft iron tools

console.log('Current alpha pos:', lib.fmt(bot.entity.position));
console.log('Raw iron before:', lib.count('raw_iron'));

// 1. Mine the vein at (335, 59, -41)
const veinTargets = [
  { x: 335, y: 59, z: -41 },
  { x: 336, y: 59, z: -41 },
  { x: 335, y: 59, z: -42 },
  { x: 336, y: 59, z: -42 },
  { x: 314, y: 59, z: -37 }
];

for (const p of veinTargets) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  try {
    console.log(`Approaching vein block at ${lib.fmt(p)}...`);
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    const b = lib.blockAt(p.x, p.y, p.z);
    if (b && b.name.includes('iron_ore')) {
      await lib.dig(p.x, p.y, p.z);
      await lib.pickup(4);
    }
  } catch (e) {
    console.log(`Vein dig note at ${lib.fmt(p)}:`, e.message);
  }
}

// Also pick up any additional iron in 10 blocks
const nearbyIron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 8, count: 5 });
for (const ore of nearbyIron) {
  if (isCancelled() || lib.time().secondsUntilNight < 100) break;
  try {
    console.log(`Mining adjacent iron at ${lib.fmt(ore.position)}...`);
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Adjacent dig note:', e.message);
  }
}

console.log('Raw iron collected total:', lib.count('raw_iron'));

// 2. Return to base
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Enter base through door
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Walking inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Smelt raw iron
const rawIronCount = lib.count('raw_iron');
console.log(`Smelting ${rawIronCount} raw iron...`);
if (rawIronCount > 0) {
  if (lib.count('*_planks') < 4 && lib.count('*_log') > 0) {
    await lib.craft('oak_planks', 4);
  }
  const fuel = lib.count('*_planks') > 0 ? 'oak_planks' : 'oak_log';
  try {
    const smeltRes = await lib.smelt('raw_iron', fuel, rawIronCount);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 4. Craft iron tools
const ingots = lib.count('iron_ingot');
console.log('Iron ingots available:', ingots);

if (lib.count('stick') < 4 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 4);
}

// iron pickaxe (3 ingots)
if (lib.count('iron_pickaxe') === 0 && lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_pickaxe', 1);
  console.log('Crafted iron_pickaxe!');
}
// iron sword (2 ingots)
if (lib.count('iron_sword') === 0 && lib.count('iron_ingot') >= 2) {
  await lib.craft('iron_sword', 1);
  console.log('Crafted iron_sword!');
}
// iron axe (3 ingots)
if (lib.count('iron_axe') === 0 && lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_axe', 1);
  console.log('Crafted iron_axe!');
}
// shield (1 ingot + 6 planks)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('Crafted shield!');
}

await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`alpha: Smelted iron! Ingots: ${lib.count('iron_ingot')}, Tools: pickaxe=${lib.count('iron_pickaxe')}, sword=${lib.count('iron_sword')}, axe=${lib.count('iron_axe')}, shield=${lib.count('shield')}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  rawIron: lib.count('raw_iron'),
  ironIngot: lib.count('iron_ingot'),
  ironPickaxe: lib.count('iron_pickaxe'),
  ironSword: lib.count('iron_sword'),
  ironAxe: lib.count('iron_axe'),
  shield: lib.count('shield'),
  time: time.secondsUntilNight
};
