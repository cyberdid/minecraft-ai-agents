// programs/437-tunnel-towards-spawner.js
console.log('=== Program 437: Tunnel into Netherrack Mountain to Blaze Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check teammates in tunnel
for (const name of ['gamma', 'delta', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}, dist=${dist.toFixed(1)}m, held=${p.entity.heldItem?.name || 'none'}`);
  }
}

bot.chat('team: Alpha united with Gamma at (44, 65, -141)! Bridge gap permanently paved. Commencing mountain tunnel North towards Blaze Spawner (32, 68, -190)!');

// 2. Scan for dropped items in tunnel (food or tools)
const drops = Object.values(bot.entities).filter(e => 
  e && (e.name === 'item' || e.type === 'object') && e.position &&
  bot.entity.position.distanceTo(e.position) < 5
);
if (drops.length > 0) {
  console.log(`Found ${drops.length} drop(s) nearby. Picking up...`);
  await lib.pickup(5);
  console.log('Inventory now:', JSON.stringify(lib.inv()));
  // Eat any food
  for (const f of ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple']) {
    while (lib.count(f) > 0 && bot.food < 20) {
      await globalThis.safeEat(f);
      await sleep(200);
    }
  }
}

// 3. Inspect tunnel front from z=-141 to z=-148
console.log('--- Inspecting tunnel front (x=44, y=64..67) ---');
for (let z = -141; z >= -148; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  const lower = bot.blockAt(new Vec3(44, 65, z));
  const upper = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  console.log(`z=${z}: floor=${floor?.name || 'void'}, body=${lower?.name || 'air'}, head=${upper?.name || 'air'}, roof=${roof?.name || 'air'}`);
}

// 4. Dig 1x2 tunnel forward through netherrack from z=-142 to z=-146
console.log('Digging 1x2 tunnel forward through netherrack mountain...');
for (let z = -142; z >= -146; z--) {
  if (isCancelled()) break;
  // Make sure floor exists
  const floorPos = new Vec3(44, 64, z);
  if (!bot.blockAt(floorPos) || bot.blockAt(floorPos).name === 'air') {
    const support = bot.blockAt(new Vec3(44, 64, z + 1));
    if (support && support.name !== 'air') {
      try {
        const nr = bot.inventory.items().find(i => i.name === 'netherrack');
        if (nr) {
          await bot.equip(nr, 'hand');
          await bot.placeBlock(support, new Vec3(0, 0, -1));
          await sleep(200);
        }
      } catch (e) {}
    }
  }

  // Dig lower body block (y=65)
  const lowerPos = new Vec3(44, 65, z);
  const lowerB = bot.blockAt(lowerPos);
  if (lowerB && lowerB.name !== 'air') {
    console.log(`Digging body at ${lib.fmt(lowerPos)}: ${lowerB.name}...`);
    try { await lib.dig(lowerPos.x, lowerPos.y, lowerPos.z); } catch (e) {}
  }

  // Dig upper head block (y=66)
  const upperPos = new Vec3(44, 66, z);
  const upperB = bot.blockAt(upperPos);
  if (upperB && upperB.name !== 'air') {
    console.log(`Digging head at ${lib.fmt(upperPos)}: ${upperB.name}...`);
    try { await lib.dig(upperPos.x, upperPos.y, upperPos.z); } catch (e) {}
  }

  // Step forward into dug tunnel
  if (bot.blockAt(lowerPos)?.name === 'air' && bot.blockAt(upperPos)?.name === 'air') {
    await bot.lookAt(new Vec3(44, 65.5, z), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
    console.log(`Advanced to z=${z}. Pos:`, lib.fmt(bot.entity.position));
  }
}

await lib.pickup(6);
console.log('Alpha final position:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha advanced mountain tunnel to ${lib.fmt(bot.entity.position)}! Distance to Blaze Spawner: ${bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1)}m.`);
