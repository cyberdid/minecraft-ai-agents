// programs/033-craft-axe-check-furnace-sleep.js
// Craft iron_axe, collect smelted ingots, craft beta tools, deposit in chest, sleep until dawn

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

try {
  await bot.wake();
  await sleep(300);
} catch (e) {}

// 1. Craft iron_axe for alpha (needs 3 ingots + 2 sticks)
if (lib.count('iron_axe') === 0 && lib.count('iron_ingot') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting iron_axe for alpha...');
  await lib.craft('iron_axe', 1);
  console.log('Crafted iron_axe! Total:', lib.count('iron_axe'));
}

// 2. Check furnace output for more ingots
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem()) {
      console.log(`Taking ${furnace.outputItem().count} ${furnace.outputItem().name} from furnace`);
      await furnace.takeOutput();
    }
    // Check if more fuel needed
    if (furnace.inputItem() && !furnace.fuelItem() && lib.count('cobblestone') > 0) {
      // no wood, but check sticks or planks
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

console.log('Iron ingots available now:', lib.count('iron_ingot'));

// 3. Craft tools for beta if ingots available
const chestPos = { x: 293, y: 72, z: -57 };
if (lib.count('iron_ingot') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('iron_pickaxe', 1);
  console.log('Crafted iron_pickaxe for beta');
  await lib.deposit({ iron_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
}
if (lib.count('iron_ingot') >= 2) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  await lib.craft('iron_sword', 1);
  console.log('Crafted iron_sword for beta');
  await lib.deposit({ iron_sword: 1 }, chestPos.x, chestPos.y, chestPos.z);
}

await lib.equipWeapon();

bot.chat(`alpha: Iron gear progress: pickaxe=${lib.count('iron_pickaxe')}, sword=${lib.count('iron_sword')}, axe=${lib.count('iron_axe')}.`);

// 4. Sleep in bed until tick 23460
console.log('Sleeping in bed until dawn (tick 23460)...');
try {
  await lib.sleepInBed();
} catch (e) {
  console.log('Sleep note:', e.message);
}

while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log(`Dawn arrived! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

const finalTime = lib.time();
console.log('Final time:', finalTime);
bot.chat('alpha: Dawn arrived! Ready to mine remaining iron for full tools and armor.');

return {
  time: finalTime,
  axe: lib.count('iron_axe'),
  pickaxe: lib.count('iron_pickaxe'),
  sword: lib.count('iron_sword')
};
