const res = []
for (let dx = -1; dx <= 2; dx++) {
  for (let dz = -2; dz <= 3; dz++) {
    const p = new Vec3(350 + dx, -55, -28 + dz)
    const b = bot.blockAt(p)
    const bBelow = bot.blockAt(p.offset(0, -1, 0))
    res.push({
      pos: `${p.x},${p.y},${p.z}`,
      block: b ? b.name : 'null',
      meta: b ? b.metadata : 'null',
      below: bBelow ? bBelow.name : 'null'
    })
  }
}
console.log(JSON.stringify(res, null, 2))
return res
