import { gridspace } from '../constants/grid'
import { Vec } from './vec'

/** Responsible for working with the visual position of something on the svg */
export class Position {
	vec: Vec = $state()! // assigned in constructor
	/**
	 * Parent position, for example if this refers to a position of an object
	 * inside a gate, it gets the gate position and adds to the local position.
	 */
	parent: Position | null = $state(null)
	/** The absolute position of this position (relative + parent position) */
	global: Vec = $derived(this.parent ? this.parent.vec.add(this.vec) : this.vec)

	constructor(vec: Vec, parent: Position | null = null) {
		// Vector of local position
		this.vec = vec
		this.parent = parent
	}

	/** Set the vector position */
	set(v: Vec) {
		this.vec = v
	}

	/** Move the current position by the passed vector */
	move(delta: Vec) {
		this.vec = this.vec.add(delta)
		return this
	}

	/**
	 * Create a new vector that takes the global position, adding the local
	 * position with the parent position
	 */
	popToGlobal() {
		return new Position(this.global)
	}

	/** Uses faster method for determining whether a */
	isWithinDistanceOf(p: Position, distance: number) {
		return this.global.squaredDistTo(p.global) <= distance * distance
	}

	/** Calculate the distance between two positions */
	distanceTo(p: Position) {
		return this.global.distTo(p.global)
	}

	/**
	 * @returns An object that contains the current position along with the
	 *   difference between the current position and the theoretical snapped
	 *   position
	 */
	snapTo() {
		const oldPos = this.vec
		this.vec = this.vec.snap(gridspace)
		return { position: this, diff: this.vec.subtract(oldPos) }
	}

	/** Returns a duplicate of this position */
	get copy() {
		return new Position(this.vec, this.parent)
	}

	/** Returns the {@link Position.global} global position as a tuple */
	toArr(): readonly [x: number, y: number] {
		return this.global.toArr()
	}

	/** Creates a position based on an `[x,y]` tuple */
	static fromArr(pos: [x: number, y: number]) {
		return new Position(new Vec(...pos))
	}
}
