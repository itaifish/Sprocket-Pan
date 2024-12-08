type ClickEvent = Pick<MouseEvent, 'ctrlKey' | 'metaKey'>;

export enum COMMAND {
	meta,
}

const clickTranslations = [{ command: COMMAND.meta, matches: (event: ClickEvent) => event.ctrlKey || event.metaKey }];

export class ShortcutManager {
	public static translateClick(event: ClickEvent) {
		return clickTranslations.find(({ matches }) => matches(event))?.command;
	}
}
