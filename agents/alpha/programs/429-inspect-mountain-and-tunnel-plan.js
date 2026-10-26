// programs/429-inspect-mountain-and-tunnel-plan.js
console.log('=== Program 429: Inspect Mountain & Tunnel to Blaze Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check all teammates nearby
for (const name of ['delta', 'gamma', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}, dist=${dist.toFixed(1)}m, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Teammate ${name}: not in visual range`);
  }
}

// 2. Scan for crafting table and any chests nearby
const tables = bot.findBlocks({ matching: mcData.blocksByName.crafting_table?.id, maxDistance: 10, count: 2 });
console.log(`Crafting tables near workshop: ${tables.length}`);
for (const tp of tables) console.log(`- Crafting table at ${lib.fmt(tp)}`);

// 3. Craft wooden sword from planks & stick if Alpha has no weapon
if (lib.count('*_sword') === 0 && lib.count('*_planks') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting wooden sword for defense...');
  try {
    await lib.craft('wooden_sword', 1);
    console.log('Wooden sword crafted!');
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}
await lib.equipWeapon();

// 4. Inspect the mountain boundary from z=-138 to z=-145 at x=44
console.log('--- Inspecting path towards netherrack mountain (x=44, y=64..67) ---');
for (let z = -138; z >= -145; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  const lower = bot.blockAt(new Vec3(44, 65, z));
  const upper = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  console.log(`z=${z}: floor(y64)=${floor?.name || 'void'}, body(y65)=${lower?.name || 'air'}, head(y66)=${upper?.name || 'air'}, roof(y67)=${roof?.name || 'air'}`);
}

// 5. Inspect Delta's current position and tunnel front
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
bot.chat('team: Alpha inspected advance bridge. Delta & Alpha holding at (44, 65, -132..-133). Ready to tunnel through mountain to Blaze Spawner (32, 68, -190)!');
