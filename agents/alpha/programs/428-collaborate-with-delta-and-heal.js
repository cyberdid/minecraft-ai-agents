// programs/428-collaborate-with-delta-and-heal.js
console.log('=== Program 428: Collaborate with Delta, Heal & Plan Bridge ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Look at Delta
const delta = bot.players.delta?.entity;
if (delta) {
  console.log(`Delta at ${lib.fmt(delta.position)}, held: ${delta.heldItem?.name || 'none'}`);
  await bot.lookAt(delta.position.offset(0, 1.6, 0), true);
}

// 2. Chat with Delta
bot.chat('delta: please toss 2 food or cooked meat to alpha! Alpha has 3.5 HP and 34 netherrack to bridge to Blaze Spawner (32, 68, -190)!');

// 3. Wait for toss and pickup
console.log('Watching for dropped items...');
for (let i = 0; i < 10; i++) {
  await sleep(1000);
  const drops = Object.values(bot.entities).filter(e => 
    e && (e.name === 'item' || e.type === 'object') && e.position &&
    bot.entity.position.distanceTo(e.position) < 4
  );
  if (drops.length > 0) {
    console.log(`Found ${drops.length} drop(s) near feet. Picking up...`);
    await lib.pickup(4);
    console.log('Inventory now:', JSON.stringify(lib.inv()));
    break;
  }
}

// 4. Eat any food
const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato'];
for (const f of foods) {
  while (lib.count(f) > 0 && bot.food < 20) {
    console.log(`Eating ${f}...`);
    await globalThis.safeEat(f);
    await sleep(250);
  }
}

// 5. Inspect the bridge slit at z=-139..-140
const slitPos = new Vec3(44, 64, -140);
console.log('Next bridge floor spot (44, 64, -140):', bot.blockAt(slitPos)?.name);

// If floor is air, place netherrack to extend bridge floor to z=-140!
if (bot.blockAt(slitPos)?.name === 'air' && lib.count('netherrack') > 0) {
  console.log('Extending bridge floor to (44, 64, -140)...');
  try {
    const support = bot.blockAt(new Vec3(44, 64, -139));
    if (support && support.name !== 'air') {
      const nr = bot.inventory.items().find(i => i.name === 'netherrack');
      if (nr) {
        await bot.equip(nr, 'hand');
        await bot.placeBlock(support, new Vec3(0, 0, -1));
        console.log('Bridge floor block placed at z=-140!');
      }
    }
  } catch (err) {
    console.log('Bridge place note:', err.message);
  }
}

console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha status: HP=${bot.health}, Food=${bot.food}, Netherrack=${lib.count('netherrack')}. Partnered with Delta at ${lib.fmt(bot.entity.position)}!`);
