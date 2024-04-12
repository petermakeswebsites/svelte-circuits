import { And } from "./and.svelte";
import { Or } from "./or.svelte";
import { Source } from "./source.svelte";
import { Switcher } from "./switcher.svelte";
export const blockList = new Set([Source, And, Or, Switcher])
