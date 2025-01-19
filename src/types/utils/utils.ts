export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object | undefined
			? RecursivePartial<T[P]>
			: T[P] | undefined;
};

export type ValuesOf<T> = T[keyof T];

export type RecursiveValueOf<TMaybeObject, TValueTypeData> =
	TMaybeObject extends Record<string, infer ValueType>
		? RecursiveValueOf<ValueType, TValueTypeData>
		: TMaybeObject extends TValueTypeData
			? TMaybeObject
			: never;
