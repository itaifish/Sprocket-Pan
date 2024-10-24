import { Constants } from '../../../utils/constants';
import { SprocketEditor } from '../../shared/input/SprocketEditor';
import { useDebounce } from '../../../hooks/useDebounce';

interface RequestScriptProps {
	scriptText: string | undefined;
	scriptKey: 'preRequestScript' | 'postRequestScript';
	updateScript: (scriptText: string) => void;
}

export function RequestScript(props: RequestScriptProps) {
	const { localDataState, setLocalDataState } = useDebounce({
		state: props.scriptText ?? '',
		setState: (newText: string) => props.updateScript(newText),
		debounceOverride: Constants.longEditTimeMS,
	});

	return (
		<SprocketEditor
			height={'55vh'}
			value={localDataState}
			onChange={(value) => {
				if (value != null) {
					setLocalDataState(value);
				}
			}}
			language={'typescript'}
		/>
	);
}
