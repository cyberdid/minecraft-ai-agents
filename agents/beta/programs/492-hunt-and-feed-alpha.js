// programs/492-hunt-and-feed-alpha.js
console.log('=== Step: Hunt Animals & Cook Food for Team ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));

// 1. Equip stone_sword
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

// 2. Scan for nearby food animals
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && 
  bot.entity.position.distanceTo(e.position) < 35
);
console.log(`Found ${animals.length} animals nearby`);

let hunted = 0;
for (const a of animals) {
  if (isCancelled() || (bot.time.nightIn && bot.time.nightIn < 120)) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2.5);
    await lib.kill(a);
    hunted++;
    console.log(`Hunted ${a.name}! (${hunted})`);
    await sleep(300);
    if (hunted >= 4) break;
  } catch (e) {
    console.log(`Hunt error on ${a.name}:`, e.message);
  }
}

// 3. Collect all drops
await lib.pickup(8);
console.log('Inv after hunting:', JSON.stringify(lib.inv()));

// 4. Return to base interior (294, 72, -55)
try {
  await lib.goTo(294.5, 72.0, -55.5, 0.8);
  console.log('Inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Path to base error, trying walkTo:', e.message);
  await lib.walkTo(294.5, -55.5);
}

// 5. Cook meat in Furnace 1 (295, 72, -55)
const f1Pos = new Vec3(295, 72, -55);
const fb = bot.blockAt(f1Pos);
const rawMeats = bot.inventory.items().filter(i => 
  ['beef', 'mutton', 'porkchop', 'chicken'].includes(i.name)
);

if (fb && rawMeats.length > 0) {
  try {
    await bot.lookAt(f1Pos.offset(0.5, 0.5, 0.5));
    const f = await bot.openFurnace(fb);
    console.log('Furnace opened for cooking...');
    
    // Put raw meat
    const rm = rawMeats[0];
    await f.putInput(rm.type, null, rm.count);
    
    // Put birch plank as fuel
    const fuel = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'stick');
    if (fuel) await f.putFuel(fuel.type, null, Math.min(fuel.count, 2));
    
    // Wait for at least 2 cooked items
    console.log('Cooking meat...');
    for (let s = 0; s < 22; s++) {
      await sleep(1000);
      if (f.outputItem() && f.outputItem().count >= 2) {
        console.log(`Cooked ${f.outputItem().name} x${f.outputItem().count}!`);
        await f.takeOutput();
        break;
      }
    }
    f.close();
  } catch (e) {
    console.log('Cooking error:', e.message);
  }
}

// 6. Toss cooked food on base floor for Alpha
const cookedFood = bot.inventory.items().find(i => i.name.startsWith('cooked_'));
if (cookedFood && cookedFood.count >= 2) {
  try {
    await bot.toss(cookedFood.type, null, Math.floor(cookedFood.count / 2));
    console.log(`Tossed ${Math.floor(cookedFood.count / 2)} ${cookedFood.name} for Alpha!`);
    bot.chat(`alpha: Cooked food dropped on base floor at (294, 72, -55) for you! Eat up!`);
  } catch (e) {}
}

console.log('Final inv:', JSON.stringify(lib.inv()), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`beta: Feast prepared! Beta Food: ${bot.food}/20, Alpha fed. Ready for Nether portal!`);
