import { StubDirection } from '$lib/connections/stub'
import { Vec } from '$lib/position/vec'
import { Box } from '$lib/selecting/box'
import { FormulaOperation, type Evaluation } from './gate-formula'
import { createGateTemplateMaker } from './gate.svelte'

const regularBox = Box.centre(new Vec(80, 50))
const notBox = regularBox.shiftLowerRight(new Vec(10, 0))

function generateTwoInOneOut(template: string, paths: string[], emittingFn: Evaluation<2>, shiftOutput = 0, box?: Box) {
	return createGateTemplateMaker({
		template,
		box: box?.toArr() || regularBox.toArr(),
		inputs: [
			{
				name: 'input1',
				stub: StubDirection.RIGHT,
				vec: [-30, 10]
			},
			{
				name: 'input2',
				stub: StubDirection.RIGHT,
				vec: [-30, -10]
			}
		] as const,
		outputs: [
			{
				name: 'output',
				stub: StubDirection.LEFT,
				vec: [30 + shiftOutput, 0],
				emittingFn
			}
		] as const,
		paths: paths
	})
}

const AndPath = 'M -20 -15 l 25 0 c 20 0 20 30 0 30 l -25 0 l 0 -30'
const OrPath = 'M -23 -15 l 14 0 c 21 0 28 15 28 15 c 0 0 -7 15 -28 15 l -14 0 c 7 -8 7 -22 0 -30'
const OrCurve = 'M -27 15 c 7 -8 7 -22 0 -30'
const not = (x: number = 20, y: number = 0) => `M ${x} ${y} a 1 1 0 0 0 10 0 a 1 1 0 0 0 -10 0`
const buffer = 'M -20 0 l 0 15 l 30 -15 l -30 -15 l 0 15'

export const Templates = {
	and: generateTwoInOneOut('and', [AndPath], {
		op: FormulaOperation.AND,
		a: 0,
		b: 1
	}),
	or: generateTwoInOneOut('or', [OrPath], {
		op: FormulaOperation.OR,
		a: 0,
		b: 1
	}),
	xor: generateTwoInOneOut('xor', [OrPath, OrCurve], {
		op: FormulaOperation.AND,
		a: {
			op: FormulaOperation.OR,
			a: 0,
			b: 1
		},
		b: {
			op: FormulaOperation.NOT,
			a: {
				op: FormulaOperation.AND,
				a: 0,
				b: 1
			}
		}
	}),
	nor: generateTwoInOneOut(
		'nor',
		[OrPath, not()],
		{
			op: FormulaOperation.NOT,
			a: {
				op: FormulaOperation.OR,
				a: 0,
				b: 1
			}
		},
		10,
		notBox
	),
	nand: generateTwoInOneOut(
		'nand',
		[AndPath, not()],
		{
			op: FormulaOperation.NOT,
			a: {
				op: FormulaOperation.AND,
				a: 0,
				b: 1
			}
		},
		10,
		notBox
	),
	xnor: generateTwoInOneOut(
		'xnor',
		[OrPath, OrCurve, not()],
		{
			op: FormulaOperation.NOT,
			a: {
				op: FormulaOperation.AND,
				a: {
					op: FormulaOperation.OR,
					a: 0,
					b: 1
				},
				b: {
					op: FormulaOperation.NOT,
					a: {
						op: FormulaOperation.AND,
						a: 0,
						b: 1
					}
				}
			}
		},
		10,
		notBox
	),
	buffer: createGateTemplateMaker({
		template: 'buffer',
		box: Box.centre(new Vec(80, 50)).toArr(),
		inputs: [
			{
				name: 'input',
				stub: StubDirection.RIGHT,
				vec: [-30, 0]
			}
		] as const,
		outputs: [
			{
				name: 'output',
				stub: StubDirection.LEFT,
				vec: [20, 0],
				emittingFn: 0
			}
		] as const,
		paths: [buffer]
	}),
	not: createGateTemplateMaker({
		template: 'not',
		box: Box.centre(new Vec(80, 50)).toArr(),
		inputs: [
			{
				name: 'input',
				stub: StubDirection.RIGHT,
				vec: [-30, 0]
			}
		] as const,
		outputs: [
			{
				name: 'output',
				stub: StubDirection.LEFT,
				vec: [30, 0],
				emittingFn: {
					op: FormulaOperation.NOT,
					a: 0
				}
			}
		] as const,
		paths: [buffer, not(10, 0)]
	}),
	junction: createGateTemplateMaker({
		template: 'junction',
		box: Box.centre(new Vec(40, 40)).toArr(),
		outputs: [] as const,
		inputs: [
			{
				name: 'joint',
				stub: StubDirection.NONE,
				vec: [0, 0]
			}
		] as const,
		paths: []
	}),
	source: createGateTemplateMaker({
		template: 'source',
		box: Box.centre(new Vec(40, 40)).toArr(),
		outputs: [
			{
				name: 'source',
				vec: [0, 0],
				stub: StubDirection.NONE,
				emittingFn: true
			}
		] as const,
		inputs: [] as const,
		paths: []
	})
}
