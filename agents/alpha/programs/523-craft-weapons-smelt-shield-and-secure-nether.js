// programs/523-craft-weapons-smelt-shield-and-secure-nether.js
console.log('=== Program 523: Craft Weapons, Smelt Shield & Secure Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

bot.pathfinder.stop();
await sleep(100);

// 1. Craft stone tools right here
console.log('Crafting stone tools...');
if (lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone pickaxe!');
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
}
await lib.equipWeapon();

// 2. Return to Base Camp (294, 72, -54)
console.log('Walking to base door at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -52, 1);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
}

await passDoorIn();
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Furnace smelting for shield
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log(`Furnace: input=${furnace.inputItem()?.name} x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name} x${furnace.fuelItem()?.count}, output=${furnace.outputItem()?.name} x${furnace.outputItem()?.count}`);
    
    // If output is already iron_ingot, take it
    if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
      await furnace.takeOutput();
      console.log('Took existing iron ingot from furnace!');
    } else if (furnace.inputItem() && furnace.inputItem().name === 'raw_iron') {
      // Put plank in fuel
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        console.log('Fueling furnace with 1 plank...');
        await furnace.putFuel(plank.type, null, 1);
        console.log('Waiting for smelting...');
        for (let i = 0; i < 12; i++) {
          await sleep(1000);
          if (furnace.outputItem() && furnace.outputItem().count >= 1) {
            await furnace.takeOutput();
            console.log('Took smelted iron ingot!');
            break;
          }
        }
      }
    }
    await furnace.close();
  } catch (err) {
    console.log('Furnace note:', err.message);
  }
}

// 4. Craft Shield if iron ingot is in inventory
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
}
await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Tools:', JSON.stringify(lib.tools()));

// 5. Exit base and enter Nether portal at (299, 73, -54)
console.log('Exiting base to Nether Portal...');
await passDoorOut();

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {
  console.log('Portal approach note:', e.message);
}

console.log('Stepping into Nether portal frame...');
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Waiting for dimension shift to the_nether...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether. Current dim: ${bot.game.dimension}`);
}

console.log('=== Entered the_nether! ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));
bot.chat(`alpha: In Nether armed with ${lib.count('shield') ? 'SHIELD' : 'swords'} and ${lib.count('cobblestone')} cobble! Securing trail!`);

// 6. Step out of portal bunker and inspect for fire
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// Scan for any fire or soul fire blocks within 16m of bunker exit
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${fires.length} fire/soul_fire blocks near bunker exit:`);
for (const fp of fires) {
  console.log(`  Fire at ${lib.fmt(fp)} - extinguishing with solid block / dig!`);
  try {
    await lib.dig(fp.x, fp.y, fp.z);
    console.log(`Extinguished fire at ${lib.fmt(fp)}!`);
  } catch (err) {
    console.log(`Extinguish note: ${err.message}`);
  }
}

// 7. Advance along covered East Ridge tunnel to Fortress Workshop
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -159)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // Pitch down to y=64 to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, 64.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
