// standalone files (no imports, should be put first, order doesn't matter)
import kvpText from '@/types/shared/keyValues?raw';
import utilsText from '@/types/utils/utils?raw';
import auditText from '@/types/data/audit?raw';
// files with imports. files must be included in the array after the files they import from,
// NO inline variable renaming ie don't `import {one as two} from '@numbers'` in any included files
import settingsText from '@/types/data/settings?raw';
import sharedText from '@/types/data/shared?raw';
import globalText from '@/types/data/global?raw';
import workspaceText from '@/types/data/workspace?raw';
// special case - the SprocketPan Injected Scripts
import sprocketText from '@/managers/scripts/types?raw';

const standalone = [kvpText, utilsText, auditText];
const dependent = [settingsText, sharedText, globalText, workspaceText];

const regex = /(^export )|(^import [^;]*;)/gm;

function cleanText(text: string) {
	return text.replaceAll(regex, '');
}

export const internalTypesRaw = [...standalone, ...dependent, sprocketText].map(cleanText).join('');
