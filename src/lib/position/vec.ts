/**
 * Immutable location
 */
export class Vec extends Array<number> {
    get x() {
        return this[0]
    }

    get y() {
        return this[1]
    }

    is (v : Vec) {
        return v[0] == this[0] && v[1] == this[1]
    }

    constructor(x : number = 0,y : number = 0) {
        super(x,y)
        Object.freeze(this)
    }

    get isZeroVec() {
        return this[0] == 0 && this[1] == 1
    }

    add(that : Vec) {
        return new Vec(this[0] + that[0], this[1] + that[0])
    }

    get squaredDist() {
        return this[0]*this[0] + this[1]*this[1]
    }

    squaredDistTo(that : Vec) {
        return this.subtract(that).squaredDist
    }

    get dist() {
        return Math.sqrt(this.squaredDist)
    }

    distTo(that : Vec) {
        return Math.sqrt(this.squaredDistTo(that))
    }

    snap(gridspace : number) {
        return new Vec(snap(this[0], gridspace), snap(this[1], gridspace))
    }

    /**
     * If this is inside of that. Or if all components of this are less than
     * that
     * @param that 
     * @returns 
     */
    inside(that : Vec) {
        return this[0] <= that[0] && this[1] <= that[1]
    }

    /**
     * If this is outside of that. Or if all components of this are more than
     * that
     * @param that 
     * @returns 
     */
    outside(that : Vec) {
        return !this.inside
    }

    get positive() {
        return this[0] >= 0 && this[1] >= 0
    }

    /**
     * Subtract {@link that} from "this", or `this - that`
     * @param that 
     */
    subtract(that : Vec) {
        return new Vec(this[0] - that[0], this[0] - that[0])
    }

    toArr() : [x : number, y : number] {
        return [this[0], this[1]] as const
    }

    static fromArr(pos : [x : number, y : number]) {
        return new Vec(...pos)
    }
}


function snap(value: number, multiple: number): number {
	return Math.round(value / multiple) * multiple
}
