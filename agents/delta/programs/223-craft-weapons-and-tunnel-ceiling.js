// programs/223-craft-weapons-and-tunnel-ceiling.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));

bot.pathfinder.stop();
await sleep(300);

// 1. Craft stone_pickaxe and stone_sword
try {
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  }
} catch (e) {
  console.log('Craft error:', e.message);
}

await lib.equipWeapon();
bot.chat('delta: Advancing along covered East Ridge tunnel to mountain breach (44, 65, -149)...');

// 2. Advance along covered East Ridge tunnel to mountain breach
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -146),
  new Vec3(44, 65, -149)
];

for (const wp of ridgeWaypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {}

  const hostiles = lib.hostiles(8);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      try {
        await lib.fight(4, 4);
      } catch (e) {}
    }
  }
}

console.log('Mountain breach reached pos:', lib.fmt(bot.entity.position));

// 3. Staircase UP inside solid mountain rock from (44, 65, -149) to y=72
if (bot.entity.position.z <= -140) {
  bot.chat('delta: Inside mountain breach! Staircasing UP into overhead ceiling rock (y=72) towards Blaze Spawner...');

  const stairs = [
    { x: 44, y: 66, z: -150 },
    { x: 44, y: 67, z: -151 },
    { x: 44, y: 68, z: -152 },
    { x: 44, y: 69, z: -153 },
    { x: 44, y: 70, z: -154 },
    { x: 44, y: 71, z: -155 },
    { x: 44, y: 72, z: -156 }
  ];

  for (const s of stairs) {
    if (isCancelled()) break;
    console.log(`Ascending step to (${s.x}, ${s.y}, ${s.z})...`);

    // Ensure floor at s.y - 1
    const floor = bot.blockAt(new Vec3(s.x, s.y - 1, s.z));
    if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
      try {
        const mat = lib.count('netherrack') > 0 ? 'netherrack' : 'cobblestone';
        await lib.place(mat, s.x, s.y - 1, s.z);
      } catch (e) {}
    }

    // Dig clearance blocks at s.y and s.y + 1
    for (let dy = 0; dy <= 1; dy++) {
      const b = bot.blockAt(new Vec3(s.x, s.y + dy, s.z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        try {
          await lib.dig(s.x, s.y + dy, s.z);
        } catch (e) {}
      }
    }

    // Step into stair position
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(s.x, s.y, s.z));
      console.log(`Reached step (${s.x}, ${s.y}, ${s.z})!`);
    } catch (e) {
      await bot.lookAt(new Vec3(s.x + 0.5, s.y, s.z + 0.5), true);
      bot.setControlState('forward', true);
      bot.setControlState('jump', true);
      await sleep(400);
      bot.setControlState('forward', false);
      bot.setControlState('jump', false);
    }
  }

  // 4. Tunnel through solid ceiling rock at y=72 towards z=-165
  if (bot.entity.position.y >= 70) {
    bot.chat('delta: At high ceiling (y=72)! Tunneling through solid ceiling rock North towards Blaze Spawner (32, 68, -190)...');
    for (let z = -157; z >= -165; z--) {
      if (isCancelled()) break;
      const x = 44 - Math.floor((-156 - z) / 2); // angle West towards x=32
      const y = 72;

      for (let dy = 0; dy <= 1; dy++) {
        const b = bot.blockAt(new Vec3(x, y + dy, z));
        if (b && b.name !== 'air' && b.name !== 'cave_air') {
          try {
            await lib.dig(x, y + dy, z);
          } catch (e) {}
        }
      }

      try {
        await bot.pathfinder.goto(new goals.GoalBlock(x, y, z));
      } catch (e) {}
    }
  }
}

const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
console.log(`Final pos in Nether: ${lib.fmt(bot.entity.position)}, Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
bot.chat(`delta: High-ceiling mountain tunnel reached at ${lib.fmt(bot.entity.position)}! Only ${dist.toFixed(1)}m from Blaze Spawner from above!`);
console.log('Final inventory:', JSON.stringify(lib.inv()));
