export function staticImplements<T>() {
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	return <U extends T>(constructor: U) => { constructor };
}
