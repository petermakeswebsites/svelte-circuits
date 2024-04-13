export function every<T>(arr: T[], fn: (t: T) => boolean) {
	let q = true
	for (const e of arr) {
		if (q) q = fn(e)
	}
	return q
}

export function some<T>(arr: T[], fn: (t: T) => boolean) {
	let q = false
	for (const e of arr) {
		if (!q) q = fn(e)
	}
	return q
}