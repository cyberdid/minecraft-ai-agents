// programs/354-reach-base-and-gear-up.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Walk remaining 35 blocks to base at (294, 72, -56)
console.log('Walking to base at (294, 72, -56)...');
const waypoints = [
  new Vec3(275, 66, -50),
  new Vec3(290, 71, -54),
  new Vec3(294, 72, -56)
];

for (const wp of waypoints) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(2000);
    bot.clearControlStates();
  }
}

console.log('Arrived inside base area! Pos:', lib.fmt(bot.entity.position));

// 2. Set spawn at bed
const bed = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 1 })[0];
if (bed) {
  console.log(`Setting spawn at bed ${lib.fmt(bed)}...`);
  try {
    await lib.setSpawn();
    console.log('Spawn point locked!');
    bot.chat('delta: Spawn point locked at base bed!');
  } catch (e) {
    console.log('setSpawn error:', e.message);
  }
}

// 3. Inspect base chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest has ${items.length} item types:`);
    for (const i of items) console.log(`  ${i.name} x${i.count}`);

    for (const i of items) {
      const n = i.name;
      if (n.includes('pickaxe') || n.includes('sword') || n.includes('shield') || n.includes('iron') || n === 'cobblestone' || n.includes('cooked') || n === 'bread') {
        try { await chest.withdraw(i.type, null, i.count); console.log(`Withdrew ${n} x${i.count}`); } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {}
}

// 4. If we need wood/tools, gather wood from nearby tree
if (lib.count('*_pickaxe') === 0) {
  console.log('No pickaxe in chest! Gathering wood and crafting tools...');
  if (lib.count('*_log') < 2 && lib.count('*_planks') < 4) {
    try { await lib.collect('*_log', 2); } catch (e) { console.log('Collect log note:', e.message); }
  }
  
  // Planks & sticks
  const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (log) {
    try { await lib.craft(log.name.replace('_log', '_planks'), 4); } catch (e) {}
  }
  if (lib.count('stick') < 4) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  
  // Wooden pickaxe
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// 5. Mine 24 cobblestone for stone pickaxe, sword, and building blocks
if (lib.count('cobblestone') < 24) {
  const need = 24 - lib.count('cobblestone');
  console.log(`Mining ${need} cobblestone from quarry...`);
  try {
    await lib.collect('cobblestone', need);
  } catch (e) {
    console.log('Mine cobble note:', e.message);
  }
}

// 6. Craft stone pickaxe and stone sword
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_pickaxe', 1); console.log('Crafted stone_pickaxe!'); } catch (e) {}
}
if (lib.count('*_sword') === 0 && lib.count('cobblestone') >= 2) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_sword', 1); console.log('Crafted stone_sword!'); } catch (e) {}
}

// 7. Equip gear
try { await lib.equipArmor(); await lib.equipWeapon(); } catch (e) {}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Base re-arm complete! Cobble: ${lib.count('cobblestone')}, Sword: ${lib.count('*_sword')}, HP: ${bot.health}/20. Ready to reinforce Spawner!`);
