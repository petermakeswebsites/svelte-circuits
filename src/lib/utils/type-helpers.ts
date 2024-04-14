export type TupleType<T extends number, R> = T extends T ? R[] & { length: T } : never
export type NumericRange<T extends number, R extends number[] = []> = R['length'] extends T
	? never
	: R['length'] | NumericRange<T, [R['length'], ...R]>

export function lengthMap<T extends number, R, U>(arr : TupleType<T,R>, callback: (element : R, index : NumericRange<T>, length: T) => U) : TupleType<T, U> {
    // @ts-expect-error
    return arr.map(callback) as TupleType<T, U>
}
