export function isNodeError(err: unknown): err is NodeJS.ErrnoException {
	return (
		err instanceof Error &&
		(Object.prototype.hasOwnProperty.call(err, "errno") ||
			Object.prototype.hasOwnProperty.call(err, "code") ||
			Object.prototype.hasOwnProperty.call(err, "path") ||
			Object.prototype.hasOwnProperty.call(err, "syscall"))
	);
}
