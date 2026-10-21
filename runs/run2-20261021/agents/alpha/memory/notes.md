# alpha notes

## Now
- Successfully executed Golden Rule 1: Night hit (tick 13192). Alpha is completely safe and sealed in an underground shelter hole at (16.5, 63, -22.7) directly adjacent to the house at (10, 67, -25).
- Overhead sealed with sand at y=65. Zero hostiles within 16 blocks.
- Health: 8.2/20, Food: 16/20, Inventory: 8 sand, 1 bone.
- Next step at dawn (timeOfDay tick 23000 / 0):
  1. Dig upward out of the shelter hole to the surface.
  2. Inspect the house door entrance at (12, 67, -21) and install the door properly on solid floor blocks so it's fully functional with `lib.goThroughDoor`.
  3. Locate surface trees / wood logs to craft torches, chest, and tools.
  4. Furnish the interior with a chest and furnace.

## Dangers & Lessons
- Golden Rule 1: Night kills! When dusk arrives, do not attempt long pathfinding across uneven desert terrain. Digging down 2-3 blocks and sealing the roof overhead is 100% reliable and fast.
- Sand pathfinding can take too long if terrain has elevation drops; always maintain 10-15 sand/dirt in inventory for quick bridging and emergency shelters.
