// programs/820-respawn-regear-and-march.js
console.log('=== Program 820: Tactical Respawn, Regear & March to Bunker ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If low HP at y=24 in Nether, execute clean fall damage respawn on solid ground
if (bot.game.dimension === 'the_nether' && bot.health <= 4) {
  bot.chat('alpha: Resetting to 20/20 HP and Food via bed respawn, gearing up with gold & armor for Milestone 9!');

  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
  if (cobble) await bot.equip(cobble, 'hand');

  // Move onto solid nether_bricks at (45, 24, -124)
  const solidTarget = new Vec3(45.5, 24.0, -124.5);
  await bot.lookAt(solidTarget, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();

  console.log('At solid ledge:', lib.fmt(bot.entity.position));

  // Pillar up 5 blocks with cobblestone on solid block
  for (let step = 0; step < 5 && !checkCancelled() && bot.health > 0; step++) {
    const curP = bot.entity.position;
    bot.setControlState('jump', true);
    await sleep(250);
    const below = bot.blockAt(new Vec3(Math.floor(curP.x), Math.floor(curP.y), Math.floor(curP.z)));
    if (below && (below.name === 'air' || below.name === 'cave_air' || below.name === 'lava')) {
      const ref = bot.blockAt(new Vec3(Math.floor(curP.x), Math.floor(curP.y) - 1, Math.floor(curP.z)));
      if (ref) {
        try { await bot.placeBlock(ref, new Vec3(0, 1, 0)); } catch (e) {}
      }
    }
    bot.setControlState('jump', false);
    await sleep(200);
  }

  // Step off the 5-block pillar onto solid nether_bricks to take fall damage (2.0 dmg > 1.2 HP)
  console.log('Stepping off 5-block pillar at y =', bot.entity.position.y);
  await bot.lookAt(new Vec3(44.5, 24.0, -124.5), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();

  // If still alive, place block at head level to suffocate
  if (bot.health > 0 && bot.health <= 4 && bot.game.dimension === 'the_nether') {
    console.log('Triggering suffocation fallback...');
    const headBlock = bot.blockAt(bot.entity.position.offset(0, 1, 0));
    const feetBlock = bot.blockAt(bot.entity.position);
    if (feetBlock) {
      try { await bot.placeBlock(feetBlock, new Vec3(0, 1, 0)); } catch (e) {}
    }
  }

  // Wait for respawn into Overworld
  console.log('Waiting for respawn in Overworld...');
  const respawnWait = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 15000 && !checkCancelled()) {
    await sleep(250);
  }
}

// 2. Overworld Base Regear
const owWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - owWait < 5000 && !checkCancelled()) {
  await sleep(250);
}

console.log('Current state: Dim =', bot.game.dimension, 'Pos =', lib.fmt(bot.entity.position), 'HP =', bot.health, 'Food =', bot.food);

if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: 20/20 HP and Food restored! Regearing at Base Chest...');

  // Move to Base Chest at (293, 72, -57)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.5, 1.2));
  } catch (e) {}

  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      console.log('Chest items:', chest.items().map(i => `${i.count}x ${i.name}`).join(', '));

      for (const item of chest.items()) {
        const n = item.name;
        if (n.includes('helmet') || n.includes('chestplate') || n.includes('leggings') ||
            n.includes('boots') || n.includes('shield') || n.includes('gold') ||
            n.includes('cooked') || n.includes('bread') || n === 'ender_pearl') {
          console.log(`Withdrawing ${item.count}x ${n}...`);
          try { await chest.withdraw(item.type, null, item.count); } catch (e) {}
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest interaction error:', e.message);
    }
  }

  // Check furnaces
  for (const fPos of [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56)]) {
    const fb = bot.blockAt(fPos);
    if (fb && fb.name.includes('furnace')) {
      try {
        const furnace = await bot.openFurnace(fb);
        const out = furnace.outputItem();
        if (out) {
          console.log(`Taking ${out.count}x ${out.name} from furnace at ${lib.fmt(fPos)}`);
          await furnace.takeOutput();
        }
        furnace.close();
      } catch (e) {}
    }
  }

  // Craft gold ingots from nuggets if any
  if (lib.count('gold_nugget') >= 9) {
    try { await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9)); } catch (e) {}
  }

  // Craft golden_boots if we don't have them and have >= 4 gold ingots
  const hasGoldenBoots = bot.inventory.items().some(i => i.name === 'golden_boots') ||
    bot.inventory.slots[8]?.name === 'golden_boots';

  if (!hasGoldenBoots && lib.count('gold_ingot') >= 4) {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      bot.chat('alpha: Crafted golden_boots for 100% Piglin neutrality!');
    } catch (e) {
      console.log('Craft golden boots failed:', e.message);
    }
  }

  // Equip golden boots
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }

  // Equip full armor and weapon
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  console.log('Regear complete. Equips:', bot.inventory.slots.slice(5, 9).map(i => i ? i.name : 'empty'));
  console.log('Alpha carrying:', JSON.stringify(lib.inv()));

  // 3. Enter Nether Portal
  bot.chat('alpha: Fully geared! Warping through Nether portal to join Delta, Beta & Gamma at Bunker!');
  console.log('Entering Nether Portal (299.5, 73.0, -54.0)...');
  await enterNetherPortal(25000);
}

// 4. In Nether: March to Bunker (44, 65, -127)
if (bot.game.dimension === 'the_nether' && bot.health > 10) {
  bot.chat('alpha: In the Nether with full gear & golden boots! Marching safe East Ridge to Bunker (44, 65, -127)!');

  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Safe Ridge Waypoints to Bunker
  const BUNKER_WPS = [
    { x: 46.0, y: 65.0, z: -7.0 },
    { x: 54.0, y: 65.0, z: -7.0 },
    { x: 63.0, y: 64.0, z: -7.0 },
    { x: 63.0, y: 65.0, z: -20.0 },
    { x: 63.0, y: 66.0, z: -35.0 },
    { x: 62.0, y: 67.0, z: -50.0 },
    { x: 61.5, y: 67.0, z: -55.0 },
    { x: 61.5, y: 67.0, z: -60.0 },
    { x: 61.5, y: 67.0, z: -65.0 },
    { x: 61.5, y: 67.0, z: -70.0 },
    { x: 61.5, y: 67.0, z: -75.0 },
    { x: 62.0, y: 67.0, z: -80.0 },
    { x: 61.0, y: 66.0, z: -100.0 },
    { x: 50.0, y: 65.0, z: -115.0 },
    { x: 44.0, y: 65.0, z: -127.0 }
  ];

  let startIdx = 0;
  for (let i = 0; i < BUNKER_WPS.length; i++) {
    const wp = BUNKER_WPS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching from WP index ${startIdx}/${BUNKER_WPS.length}...`);

  for (let i = startIdx; i < BUNKER_WPS.length && !checkCancelled(); i++) {
    await globalThis.clearFireAhead();

    const wp = BUNKER_WPS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 1.8) continue;

    // Gaze low at feet level to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), taking cover at WP ${i}.`);
      break;
    }
  }

  console.log('Arrival check. Position:', lib.fmt(bot.entity.position));
  if (bot.entity.position.distanceTo(new Vec3(44, 65, -127)) < 5.0) {
    bot.chat('alpha: UNITED WITH TEAM IN FORTRESS WORKSHOP BUNKER (44, 65, -127)! Ready for Piglin bartering!');
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  armor: bot.inventory.slots.slice(5, 9).map(i => i ? i.name : 'empty'),
  gold_ingots: lib.count('gold_ingot'),
  ender_pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
