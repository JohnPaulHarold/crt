/**
 * @see {@link https://github.com/alexnault/classix/blob/main/src/index.ts}
 */
export function cx(...args: (string | boolean | undefined)[]): string {
	let str = '',
		i = 0,
		arg;

	for (; i < args.length; ) {
		if ((arg = args[i++]) && typeof arg === 'string') {
			if (str) {
				str += ' ';
			}
			str += arg;
		}
	}

	return str;
}
