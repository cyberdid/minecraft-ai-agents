// programs/870-scoop-water-from-sill.js
console.log('=== Program 870: Scoop Water from Portal Sill ===');

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Current sill block at (299, 72, -54): ${sill ? sill.name : 'null'}`);

if (sill && (sill.name === 'water' || sill.name === 'flowing_water')) {
  console.log('Scooping water from sill...');
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(new Vec3(299.5, 72.5, -54.0), true);
    bot.activateItem();
    await sleep(800);
  }
}

const sillAfter = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill after scoop: ${sillAfter ? sillAfter.name : 'null'}`);
console.log(`Inventory: water_bucket=${lib.count('water_bucket')}, bucket=${lib.count('bucket')}`);
