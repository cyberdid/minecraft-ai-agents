const res = []
for (let x = 349; x <= 352; x++) {
  for (let z = -29; z <= -26; z++) {
    for (let y = -55; y <= -54; y++) {
      const p = new Vec3(x, y, z)
      const b = bot.blockAt(p)
      res.push({ pos: `${x},${y},${z}`, name: b ? b.name : 'null', meta: b ? b.metadata : 'null' })
    }
  }
}
console.log(JSON.stringify(res, null, 2))
