// programs/158-pickup-rest-and-equip.js
console.log('--- Picking Up Remaining Gear ---');
console.log('Pos:', lib.fmt(bot.entity.position));

const spots = [
  new Vec3(296, 50, -52),
  new Vec3(296, 51, -56),
  new Vec3(296, 51, -61)
];

for (const s of spots) {
  console.log(`Stepping to ${lib.fmt(s)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(s.x, s.y, s.z, 0.5));
    await sleep(400);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Step to ${lib.fmt(s)} note:`, e.message);
  }
}

// Equip armor & weapons
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Armor equipped!');
} catch (e) {
  console.log('Equip error:', e.message);
}

console.log('Armor slots:', bot.inventory.slots.slice(5, 9).map(s => s?.name));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Inventory:', JSON.stringify(lib.inv()));

// Navigate up to base entrance (294, 72, -53)
console.log('Ascending to base entrance (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('At base entrance!');
} catch (e) {
  console.log('Ascent note:', e.message);
}

// Enter through door
const doorBlk = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlk && bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 4) {
  try {
    if (!doorBlk.getProperties().open) {
      await bot.activateBlock(doorBlk);
      await sleep(200);
    }
    await lib.walkTo(293.5, -56.0, 3000);
    const doorAfter = bot.blockAt(new Vec3(294, 72, -54));
    if (doorAfter && doorAfter.getProperties().open) {
      await bot.activateBlock(doorAfter);
    }
    console.log('Entered base and closed door.');
  } catch (e) {
    console.log('Door interaction error:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Recovered gear! Full iron armor: ${bot.inventory.slots[6]?.name ? 'yes' : 'no'}, water_bucket: ${lib.count('water_bucket')}`);
