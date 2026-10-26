// programs/244-recover-gear-at-327.js
console.log('=== Program 244: Recover Gear at (327.6, 19.0, -32.5) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: Recovering diamond_pickaxe and water_bucket at (327, 19, -32), deadline 17:21!');

// 1. Grab weapon from base chest if possible
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest items:', JSON.stringify(contents));
  if (contents.cobblestone >= 3) {
    await lib.withdraw({ cobblestone: 6 }, chestPos.x, chestPos.y, chestPos.z);
    if (lib.count('stick') < 2 && lib.count('*_planks') > 0) await lib.craft('stick', 4);
    if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) await lib.craft('stone_sword', 1);
  }
} catch (e) {}

// 2. Navigate to death spot (327.6, 19.0, -32.5)
const route = [
  { x: 302, y: 71, z: -44 },
  { x: 328, y: 45, z: -70 },
  { x: 328, y: 20, z: -70 },
  { x: 327, y: 19, z: -32 }
];

for (let i = 0; i < route.length; i++) {
  if (isCancelled()) break;
  const target = route[i];
  console.log(`Heading to route step ${i+1}/${route.length}: (${target.x}, ${target.y}, ${target.z})...`);
  try {
    await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 20000 });
    console.log(`Reached step ${i+1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (err) {
    console.log(`Step ${i+1} note:`, err.message);
  }
}

// 3. At death spot: fight any mobs and pickup items
console.log('At death spot! Fighting hostiles and picking up items...');
const hostiles = lib.hostiles(10);
if (hostiles.length > 0) {
  console.log(`Fighting ${hostiles[0].name}...`);
  try {
    const sword = mcData.itemsByName.stone_sword?.id || mcData.itemsByName.stone_pickaxe?.id;
    if (sword) await bot.equip(sword, 'hand');
    await lib.fight(10, 8);
  } catch (e) {}
}

const gained = await lib.pickup(12);
console.log(`Picked up ${gained} items!`);
await sleep(1000);
await lib.pickup(12);

console.log('Inventory after recovery:', JSON.stringify(lib.inv()));
bot.chat(`beta: Recovery status: diamond_pickaxe=${lib.count('diamond_pickaxe')}, water_bucket=${lib.count('water_bucket')}. Pos: ${lib.fmt(bot.entity.position)}.`);
