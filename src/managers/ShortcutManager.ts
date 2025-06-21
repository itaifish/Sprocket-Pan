import { TypeOf } from '@/types/utils/utils';

type ClickEvent = Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>;

export const Command = {
	meta: 'meta',
	click: 'click',
	shift: 'shift',
} as const;

export type Command = TypeOf<typeof Command>;

const clickTranslations = [
	{
		command: Command.meta,
		matches: (event: ClickEvent) => event.ctrlKey || event.metaKey,
	},
	{
		command: Command.shift,
		matches: (event: ClickEvent) => event.shiftKey,
	},
];

export class ShortcutManager {
	public static translateClick(event: ClickEvent) {
		return clickTranslations.find(({ matches }) => matches(event))?.command;
	}

	public static getKeys(commands: Command[]) {
		return commands.join('+');
	}
}
