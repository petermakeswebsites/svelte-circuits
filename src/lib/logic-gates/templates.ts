
import { StubDirection } from '$lib/connections/dot.svelte'
import { FormulaOperation, type Evaluation } from './gate-formula'
import { createGateTemplateMaker } from './gate.svelte'


function generateTwoInOneOut(template: string, paths: string[], emittingFn: Evaluation<2>, shiftOutput = 0) {
	return createGateTemplateMaker({
        template,
		box: {
			width: 80,
			height: 50
		},
		inputs: [
			{
				name: 'input1',
				stub: StubDirection.RIGHT,
				x: -30,
				y: 10
			},
			{
				name: 'input2',
				stub: StubDirection.RIGHT,
				x: -30,
				y: -10
			}
		] as const,
		outputs: [
			{
				name: 'output',
				stub: StubDirection.LEFT,
				x: 30 + shiftOutput,
				y: 0,
				emittingFn
			}
		] as const,
		paths: paths
	})
}

const AndPath = 'M -20 -15 l 25 0 c 20 0 20 30 0 30 l -25 0 l 0 -30'
const OrPath = 'M -23 -15 l 14 0 c 21 0 28 15 28 15 c 0 0 -7 15 -28 15 l -14 0 c 7 -8 7 -22 0 -30'
const OrCurve =  'M -27 15 c 7 -8 7 -22 0 -30'
const not = (x : number = 20,y : number = 0) => `M ${x} ${y} a 1 1 0 0 0 10 0 a 1 1 0 0 0 -10 0`
const buffer = 'M -20 0 l 0 15 l 30 -15 l -30 -15 l 0 15'

export const Templates = {
    and: generateTwoInOneOut("and", [AndPath], {
        op: FormulaOperation.AND,
        a: 0,
        b: 1
    }),
    or: generateTwoInOneOut("or", [OrPath], {
        op: FormulaOperation.OR,
        a: 0,
        b: 1
    }),
    xor: generateTwoInOneOut("xor", [OrPath,OrCurve], {
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
    nor: generateTwoInOneOut("nor", [OrPath, not()], {
        op: FormulaOperation.NOT,
        a: {
            op: FormulaOperation.OR,
            a: 0,
            b: 1
        }
    }, 10),
    nand: generateTwoInOneOut("nand", [AndPath, not()], {
        op: FormulaOperation.NOT,
        a: {
            op: FormulaOperation.AND,
            a: 0,
            b: 1
        }
    }, 10),
    xnor: generateTwoInOneOut("xnor", [OrPath, OrCurve, not()], {
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
    }, 10),
    buffer: createGateTemplateMaker({
        template: "buffer",
        box: {
            width: 80,
            height: 50
        },
        inputs: [
            {
                name: 'input',
                stub: StubDirection.RIGHT,
                x: -30,
                y: 0
            }
        ] as const,
        outputs: [
            {
                name: 'output',
                stub: StubDirection.LEFT,
                x: 20,
                y: 0,
                emittingFn: 0
            }
        ] as const,
        paths: [buffer]
    }),
    not: createGateTemplateMaker({
        template: "not",
        box: {
            width: 80,
            height: 50
        },
        inputs: [
            {
                name: 'input',
                stub: StubDirection.RIGHT,
                x: -30,
                y: 0
            }
        ] as const,
        outputs: [
            {
                name: 'output',
                stub: StubDirection.LEFT,
                x: 30,
                y: 0,
                emittingFn: {
                    op: FormulaOperation.NOT,
                    a: 0
                }
            }
        ] as const,
        paths: [buffer, not(10,0)]
    }),
    junction: createGateTemplateMaker({
        template: "junction",
        box: {
            height: 40,
            width: 40
        },
        outputs: [] as const,
        inputs: [
            {
                name: "joint",
                stub: StubDirection.NONE,
                x: 0,
                y: 0,
            }
        ] as const,
        paths: []
    }),
    source: createGateTemplateMaker({
        template: "junction",
        box: {
            height: 40,
            width: 40
        },
        outputs: [{
            name: "source",
            x: 0,
            y: 0,
            stub: StubDirection.NONE,
            emittingFn: true
        }] as const,
        inputs: [] as const,
        paths: []
    })
}