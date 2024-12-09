type ClickEvent = Pick<MouseEvent, 'ctrlKey' | 'metaKey'>;

export enum COMMAND {
	meta,
	click,
}

const clickTranslations = [{ command: COMMAND.meta, matches: (event: ClickEvent) => event.ctrlKey || event.metaKey }];

const commandMapping = {
	[COMMAND.meta]: 'command',
	[COMMAND.click]: 'click',
};

export class ShortcutManager {
	public static translateClick(event: ClickEvent) {
		return clickTranslations.find(({ matches }) => matches(event))?.command;
	}
	public static getKey(command: COMMAND) {
		return commandMapping[command];
	}
	public static getKeys(commands: COMMAND[]) {
		return commands.map((command) => this.getKey(command)).join('+');
	}
}
