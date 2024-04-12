import type { NumericRange, TupleType } from './type-helpers'

type BooleanTuple<T extends number> = TupleType<T, boolean>

export type Formula<T extends number> = And<T> | Or<T> | Not<T>
export type Evaluation<T extends number> = Formula<T> | NumericRange<T> | boolean

export enum FormulaOperation {
	NOT = "!",
	AND = "&",
	OR = "|",
}

type And<T extends number> = {
	op: FormulaOperation.AND
	a: Evaluation<T>
	b: Evaluation<T>
}

type Or<T extends number> = {
	op: FormulaOperation.OR
	a: Evaluation<T>
	b: Evaluation<T>
}

type Not<T extends number> = {
	op: FormulaOperation.NOT
	a: Evaluation<T>
}

function isFormula<T extends number>(evaluation: Evaluation<T>): evaluation is Formula<T> {
	return !(typeof evaluation === 'number' || typeof evaluation === 'boolean')
}

function isIndex<T extends number>(evaluation : NumericRange<T> | boolean) : evaluation is NumericRange<T> {
    return typeof evaluation === 'number'
}

export function createEvaluation<T extends number>(evaluation: Evaluation<T>): (...args: BooleanTuple<T>) => boolean {
	if (isFormula(evaluation)) {
		switch (evaluation.op) {
			case FormulaOperation.AND:
				return (...args) => createEvaluation(evaluation.a)(...args) && createEvaluation(evaluation.b)(...args)
				break
			case FormulaOperation.OR:
				return (...args) => createEvaluation(evaluation.a)(...args) || createEvaluation(evaluation.b)(...args)
				break
			case FormulaOperation.NOT:
				return (...args) => !createEvaluation(evaluation.a)(...args)
			default:
				throw new Error(`Formula operation not found!`)
		}
	} else {
		if (isIndex(evaluation)) {
			// @ts-expect-error stack trace, it's fine
			return (...args: BooleanTuple<T>) => args[evaluation]
		} else {
			return (...args) => evaluation
		}
	}
}
