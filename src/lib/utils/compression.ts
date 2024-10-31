async function compressData(inputText : string) {
    const encoder = new TextEncoder();
    const compressedStream = new CompressionStream('deflate');
    const writableStream = compressedStream.writable;
    const writer = writableStream.getWriter();

    writer.write(encoder.encode(inputText));
    writer.close();

    const chunks = [];
    const reader = compressedStream.readable.getReader();

    let result;
    while (!(result = await reader.read()).done) {
        chunks.push(result.value);
    }

    return new Uint8Array(chunks.reduce((acc, val) => acc.concat(Array.from(val)), []));
}

// @ts-expect-error
globalThis.compressData = compressData

async function decompressData(compressedData : Uint8Array) {
    const decompressedStream = new DecompressionStream('deflate');
    const writableStream = decompressedStream.writable;
    const writer = writableStream.getWriter();

    writer.write(compressedData);
    writer.close();

    const chunks = [];
    const reader = decompressedStream.readable.getReader();
    let result;

    while (!(result = await reader.read()).done) {
        chunks.push(result.value);
    }

    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(chunks.reduce((acc, val) => acc.concat(Array.from(val)), [])));
}

export async function compress(input: string): Promise<string> {
	const compressed = await compressData(input) 
	let base64String = btoa(String.fromCharCode(...compressed))
	return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function decompress(encoded: string): Promise<string> {
	let binaryString = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
	let binaryArray = new Uint8Array(binaryString.length)
	for (let i = 0; i < binaryString.length; i++) {
		binaryArray[i] = binaryString.charCodeAt(i)
	}
	return await decompressData(binaryArray) 
}

// @ts-expect-error
globalThis.compress = compress
// @ts-expect-error
globalThis.decompress = decompress