import { OptionalScriptContext } from '@/managers/scripts/types';
import { ItemType } from '../data/item';

export type StateContext<TData, TDataName extends string> = Record<TDataName, TData> &
	Record<`set${Capitalize<TDataName>}`, React.Dispatch<React.SetStateAction<TData>>>;

export type TabType = ItemType | 'secrets';

export type SprocketError = {
	message?: string;
	context?: OptionalScriptContext[];
	stack?: string;
	// only populated if the error thrown is not instanceof Error
	err?: unknown;
};
