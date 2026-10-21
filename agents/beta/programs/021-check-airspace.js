// Check air space above y=-48 along x=356..350, z=-30
const b = bot
for (let x = 356; x >= 350; x--) {
  const bl47 = b.blockAt(new Vec3(x, -47, -30))?.name
  const bl46 = b.blockAt(new Vec3(x, -46, -30))?.name
  const bl45 = b.blockAt(new Vec3(x, -45, -30))?.name
  console.log(`x=${x}, z=-30: y=-47:${bl47}, y=-46:${bl46}, y=-45:${bl45}`)
}
