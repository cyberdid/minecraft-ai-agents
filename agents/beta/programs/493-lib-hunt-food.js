// programs/493-lib-hunt-food.js
console.log('=== Step: Hunt Animals via lib.hunt ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Pass through door outside
try {
  await lib.door(294, 72, -54, true);
  await lib.walkTo(294, -53);
  await lib.door(294, 72, -54, false);
} catch (e) {}

console.log('Outside base at', lib.fmt(bot.entity.position));

// 2. Hunt cows or sheep using lib.hunt
let meatGained = 0;
try {
  console.log('Hunting sheep...');
  await lib.hunt('sheep', 3);
  console.log('Hunted sheep successfully!');
} catch (e1) {
  console.log('Hunt sheep note:', e1.message);
  try {
    console.log('Hunting cows...');
    await lib.hunt('cow', 3);
    console.log('Hunted cows successfully!');
  } catch (e2) {
    console.log('Hunt cow note:', e2.message);
  }
}

await lib.pickup(8);
console.log('Inv after hunting:', JSON.stringify(lib.inv()));

// 3. Return to base interior (294, 72, -55)
try {
  await lib.door(294, 72, -54, true);
  await lib.walkTo(294.5, -55.5);
  await lib.door(294, 72, -54, false);
  console.log('Safely back inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Return door error:', e.message);
}

// 4. Cook meat in Furnace 1 (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
const rawMeat = bot.inventory.items().find(i => ['mutton', 'beef', 'porkchop', 'chicken'].includes(i.name));

if (fb && rawMeat) {
  try {
    const f = await bot.openFurnace(fb);
    await f.putInput(rawMeat.type, null, rawMeat.count);
    const fuel = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'stick');
    if (fuel) await f.putFuel(fuel.type, null, 1);
    
    // Wait for cooking
    console.log('Cooking meat in furnace...');
    for (let s = 0; s < 25; s++) {
      await sleep(1000);
      if (f.outputItem() && f.outputItem().count >= 2) {
        console.log(`Cooked ${f.outputItem().name} x${f.outputItem().count}!`);
        await f.takeOutput();
        break;
      }
    }
    f.close();
  } catch (e) {
    console.log('Cook error:', e.message);
  }
}

// 5. Toss food for Alpha
const cooked = bot.inventory.items().find(i => i.name.startsWith('cooked_'));
if (cooked && cooked.count >= 2) {
  try {
    await bot.toss(cooked.type, null, Math.floor(cooked.count / 2));
    bot.chat(`alpha: Dropped cooked food on base floor for you! Eat up!`);
  } catch (e) {}
}

console.log('Final inv:', JSON.stringify(lib.inv()), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`beta: Hunting & cooking complete! Inv: ${JSON.stringify(lib.inv())}. Team fed and ready!`);
