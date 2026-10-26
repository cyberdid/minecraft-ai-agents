// programs/427-hallway-secure-and-resupply.js
console.log('=== Program 427: Fortress Hallway Security & Resupply ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check teammates in visual range
for (const name of ['delta', 'gamma', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}, dist=${dist.toFixed(1)}m, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Teammate ${name}: not in visual range`);
  }
}

// 2. Chat with team inside hallway
bot.chat('team: Alpha safely inside Fortress advance hallway (44, 65, -132)! HP=3.5/20, food=14/20. Delta/Gamma/Beta, please toss 2 food so Alpha can heal!');

// 3. Scan for chests in Fortress bunker / hallway (radius 10)
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 10, count: 5 });
console.log(`Chests found near hallway: ${chests.length}`);
for (const cp of chests) {
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Chest at ${lib.fmt(cp)}:`, JSON.stringify(contents));
    const toTake = {};
    for (const item of ['bread', 'cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'apple', 'iron_sword', 'shield', 'cobblestone', 'iron_ingot']) {
      if (contents[item] > 0) toTake[item] = contents[item];
    }
    if (Object.keys(toTake).length > 0) {
      await lib.withdraw(toTake, cp.x, cp.y, cp.z);
    }
  } catch (e) {
    console.log(`Chest ${lib.fmt(cp)} note:`, e.message);
  }
}

// 4. Scan for dropped items within 6m
console.log('Scanning for dropped items...');
const drops = Object.values(bot.entities).filter(e => 
  e && (e.name === 'item' || e.type === 'object') && e.position &&
  bot.entity.position.distanceTo(e.position) < 6
);
console.log(`Dropped items on floor: ${drops.length}`);
if (drops.length > 0) {
  await lib.pickup(6);
  console.log('Inventory after pickup:', JSON.stringify(lib.inv()));
}

// 5. If any food in inventory, eat it immediately to heal!
const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato'];
for (const f of foods) {
  while (lib.count(f) > 0 && bot.food < 20) {
    console.log(`Eating ${f}...`);
    await globalThis.safeEat(f);
    await sleep(250);
  }
}

// 6. Equip best weapon and armor
await lib.equipArmor();
await lib.equipWeapon();

// 7. Verify advance hallway boundaries and bridge extension towards Blaze Spawner (32, 68, -190)
console.log('Inspecting advance hallway blocks:');
for (let z = -132; z >= -142; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  const airway = bot.blockAt(new Vec3(44, 65, z));
  console.log(`z=${z}: floor=${floor?.name || 'void'}, air=${airway?.name || 'solid'}`);
}

console.log('Alpha final status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
