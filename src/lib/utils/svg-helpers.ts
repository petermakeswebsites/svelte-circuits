import type { Vec } from "$lib/position/vec";

export function linePath(vec1 : Vec, vec2 : Vec) {
    return `M ${vec1.x} ${vec1.y} L ${vec2.x} ${vec2.y}`
}