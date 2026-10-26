// programs/310-check-furnaces-feed-alpha.js
console.log('=== Step: Inspect furnaces, feed Alpha, fill water bucket ===');

// 1. Check F2 and F3 for food or iron
const f2Block = bot.blockAt(new Vec3(295, 72, -54));
const f3Block = bot.blockAt(new Vec3(295, 72, -56));

for (const [name, fb] of [['F2', f2Block], ['F3', f3Block]]) {
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`${name}: input=${input ? `${input.name}x${input.count}` : 'none'}, fuel=${fuel ? `${fuel.name}x${fuel.count}` : 'none'}, output=${output ? `${output.name}x${output.count}` : 'none'}`);
      if (output && output.count > 0) {
        await f.takeOutput();
        console.log(`Took ${output.name}x${output.count} from ${name}`);
      }
      f.close();
    } catch (e) {
      console.log(`${name} note:`, e.message);
    }
  }
}

// 2. Locate Alpha inside base and toss food if we have any
const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username.includes('alpha'));
if (alpha) {
  console.log(`Alpha is at ${lib.fmt(alpha.position)}`);
}

// Check what food Beta has
const foods = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'beef', 'mutton', 'porkchop', 'chicken'];
let foodItem = null;
for (const f of foods) {
  if (lib.count(f) > 0) {
    foodItem = f;
    break;
  }
}

if (foodItem && alpha) {
  console.log(`Tossing ${foodItem} to Alpha...`);
  await bot.lookAt(alpha.position.offset(0, 1.5, 0));
  const countToToss = Math.min(lib.count(foodItem), 4);
  const item = bot.inventory.items().find(i => i.name === foodItem);
  if (item) {
    await bot.toss(item.type, null, countToToss);
    console.log(`Tossed ${countToToss} ${foodItem} to Alpha!`);
    bot.chat(`beta: Tossed ${countToToss} ${foodItem} for you Alpha!`);
  }
} else if (!foodItem) {
  console.log('No food in Beta inventory. Will hunt outside.');
}

// 3. Fill water bucket if bucket is empty
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling water bucket via lib.fillBucket()...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.fillBucket('water');
    console.log('Water bucket filled! Count:', lib.count('water_bucket'));
    await lib.goTo(294, 72, -53, 1);
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('fillBucket note:', e.message);
  }
}

// 4. Report status
console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Status update - water_bucket: ${lib.count('water_bucket')}, flint_and_steel: ${lib.count('flint_and_steel')}`);
