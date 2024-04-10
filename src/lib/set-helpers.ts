import { Set as StateSet } from 'svelte/reactivity'

export function intersect<T>(setA: Set<T> | StateSet<T>, setB: Set<T> | StateSet<T>): Set<T> {
	let _intersection = new Set<T>()
	for (let elem of setB) {
		if (setA.has(elem)) {
			_intersection.add(elem)
		}
	}
	return _intersection
}

export function union<T>(setA: Set<T> | StateSet<T>, setB: Set<T> | StateSet<T>): Set<T> {
	let _union = new Set<T>(setA)
	for (let elem of setB) {
		_union.add(elem)
	}
	return _union
}

export function difference<T>(setA: Set<T> | StateSet<T>, setB: Set<T> | StateSet<T>): Set<T> {
	let _difference = new Set<T>(setA)
	for (let elem of setB) {
		_difference.delete(elem)
	}
	return _difference
}

export function symmetricDifference<T>(setA: Set<T> | StateSet<T>, setB: Set<T> | StateSet<T>): Set<T> {
	let _difference = new Set<T>(setA)
	for (let elem of setB) {
		if (_difference.has(elem)) {
			_difference.delete(elem)
		} else {
			_difference.add(elem)
		}
	}
	return _difference
}

export function add<T>(setA: Set<T> | StateSet<T>, ...sets: (Set<T> | StateSet<T>)[]): Set<T> {
    let _add = new Set<T>(setA)
    sets.forEach((set) => {
        // @ts-ignore
        set.forEach((elem) => {
            _add.add(elem);
        });
    });
    return _add;
}

export function subtract<T>(setA: Set<T> | StateSet<T>, setB: Set<T> | StateSet<T>): Set<T> {
    let _subtract = new Set<T>();
    for (let elem of setA) {
        if (!setB.has(elem)) {
            _subtract.add(elem);
        }
    }
    return _subtract;
}