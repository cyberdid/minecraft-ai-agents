// team/autoload.js - shared helpers and constants
globalThis.baseSite = { x: 292, y: 72, z: -58 };

globalThis.getBaseHouse = () => {
  return lib.shapes.house({
    x: 292,
    y: 72,
    z: -58,
    width: 5,
    depth: 5,
    height: 3,
    wall: 'cobblestone',
    roof: 'oak_planks',
    door: 'south',
    windows: false
  });
};

// Safe helper for making obsidian underground (handles cave_air properly unlike lib.makeObsidian)
globalThis.makeObsidianSafe = async function(n = 10) {
  if (!lib.count('diamond_pickaxe')) throw new Error('obsidian can only be mined with a diamond_pickaxe');
  const isAir = (b) => b && (b.name === 'air' || b.name === 'cave_air');
  const log = [];
  for (let round = 0; round < 8 && lib.count('obsidian') < n; round++) {
    if (!lib.count('water_bucket')) {
      if (!lib.count('bucket')) throw new Error('need a bucket to carry water');
      log.push(await lib.fillBucket('water'));
    }
    const pools = bot.findBlocks({ matching: (bl) => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 48, count: 64 })
      .map((p) => bot.blockAt(p)).filter(Boolean)
      .sort((x, y) => x.position.distanceTo(bot.entity.position) - y.position.distanceTo(bot.entity.position));
    let edge = null;
    for (const lava of pools) {
      const up = bot.blockAt(lava.position.offset(0, 1, 0));
      if (!isAir(up)) continue;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nb = bot.blockAt(lava.position.offset(dx, 0, dz));
        const nbUp = bot.blockAt(lava.position.offset(dx, 1, dz));
        if (nb && nb.boundingBox === 'block' && isAir(nbUp)) { edge = nb; break; }
      }
      if (edge) break;
    }
    if (!edge) throw new Error(`no lava pool with a solid edge within 48 blocks (found ${pools.length} lava blocks)`);
    const e = edge.position;
    await bot.pathfinder.goto(new goals.GoalNear(e.x, e.y + 1, e.z, 3));
    await bot.equip(mcData.itemsByName.water_bucket.id, 'hand');
    await bot.lookAt(e.offset(0.5, 1, 0.5), true);
    bot.activateItem();
    await sleep(3000);
    const water = bot.blockAt(e.offset(0, 1, 0));
    if (water && water.name === 'water') {
      await bot.equip(mcData.itemsByName.bucket.id, 'hand');
      await bot.lookAt(e.offset(0.5, 1.5, 0.5), true);
      bot.activateItem();
      await sleep(600);
    }
    const obs = bot.findBlocks({ matching: (bl) => bl && bl.name === 'obsidian', maxDistance: 16, count: 20 });
    log.push(`round ${round + 1}: water poured at ${lib.fmt(e.offset(0, 1, 0))}, ${obs.length} obsidian formed`);
    for (const p of obs) {
      if (lib.count('obsidian') >= n) break;
      if (isCancelled()) break;
      try {
        await lib.dig(p.x, p.y, p.z);
        await lib.pickup(4);
      } catch (err) {
        if (/cancelled/.test(err.message)) throw err;
      }
    }
  }
    if (lib.count('obsidian') < n) throw new Error(`made only ${lib.count('obsidian')}/${n} obsidian: ${log.join('; ')}`);
    return { obsidian: lib.count('obsidian'), log };
  };

  // Configure pathfinder movements to strictly treat fire, soul_fire, and lava as impassable obstacles
  globalThis.configureFireAvoidance = function () {
    if (!bot.pathfinder || !mcData) return;
    const moves = new Movements(bot, mcData);
    if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
    if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
    if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
    moves.canDig = false;
    bot.pathfinder.setMovements(moves);
  };
