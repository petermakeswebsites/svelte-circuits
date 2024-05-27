/**
 * Special version of array every that doesn't exit the array when it knows for
 * certain what the outcome will be. This allows it to create a relationship
 * with every element's signals if there are any
 *
 * @param arr
 * @param fn
 */
export function every<T>(arr: T[], fn: (t: T) => boolean) {
	let q = true
	for (const e of arr) {
		if (q) q = fn(e)
	}
	return q
}

/**
 * Special version of array some that doesn't exit the array when it knows for
 * certain what the outcome will be. This allows it to create a relationship
 * with every element's signals if there are any
 *
 * @param arr
 * @param fn
 */
export function some<T>(arr: T[], fn: (t: T) => boolean) {
	let q = false
	for (const e of arr) {
		if (!q) q = fn(e)
	}
	return q
}
