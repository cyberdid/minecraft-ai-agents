const p = new Vec3(351, -55, -27)
const res = []
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -2; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      const pos = p.offset(dx, dy, dz)
      const b = bot.blockAt(pos)
      res.push({
        rel: `${dx},${dy},${dz}`,
        pos: `${pos.x},${pos.y},${pos.z}`,
        name: b ? b.name : 'null',
        meta: b ? b.metadata : 'null'
      })
    }
  }
}
console.log(JSON.stringify(res, null, 2))
