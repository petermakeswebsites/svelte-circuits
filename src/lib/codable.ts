import type { AndMeta } from "./and.svelte"
import type { Dot } from "./dot.svelte"

type Metas = AndMeta
interface Codeable {
    encode() : {
        meta: Metas,
        connections: Set<Dot>
    }
}

export function JSONEncode(set : Set<Codeable>) {
    const arr = [...set].map(codable => codable.encode())
    const connections = [...new Set(arr.flatMap(({connections}) => ([...connections])))]
    // Assign IDs to dots
    const mapped = new Map(connections.map((dot, i) => (['d' + i, dot])))
    const mappedInverse = new Map(connections.map((dot, i) => ([dot, 'd' + i])))

    const connectionList = new Map<string, string[]>()

    arr.map(({meta, connections}, i) => {
        const id = ""+i
        
    })
}