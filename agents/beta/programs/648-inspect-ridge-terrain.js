for (let x = 50; x <= 63; x += 2) {
  for (let z = -10; z <= -5; z += 2) {
    const p = new Vec3(x, 65, z);
    const b = bot.blockAt(p);
    const bBelow = bot.blockAt(p.offset(0, -1, 0));
    const bAbove = bot.blockAt(p.offset(0, 1, 0));
    console.log(`x=${x}, z=${z}: below=${bBelow?.name}, at=${b?.name}, above=${bAbove?.name}`);
  }
}
