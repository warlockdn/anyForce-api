/* eslint-disable @typescript-eslint/no-namespace */
declare namespace NodeJS {
	interface Global {
		validator: {
			[key: string]: any
		};
		/** Global Mongoose Model */
		models: {
			[key: string]: any
		};
	}
}
