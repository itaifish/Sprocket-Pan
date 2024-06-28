import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { open } from '@tauri-apps/api/dialog';
import { IconButton } from '@mui/joy';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { SprocketTooltip } from '../SprocketTooltip';
import { InjectLoadedData } from '../../../state/active/thunks/applicationData';
import { useAppDispatch } from '../../../state/store';

export function NewServiceButton() {
	const dispatch = useAppDispatch();
	return (
		<SprocketTooltip text="Import From File">
			<IconButton
				id="toggle-mode"
				size="sm"
				variant="soft"
				color="neutral"
				onClick={async () => {
					const selectedUrl = await open({
						filters: [
							{ name: 'Swagger/OpenAPI File', extensions: ['yaml', 'json', 'yml'] },
							{ name: 'All Files', extensions: ['*'] },
						],
					});
					if (selectedUrl && typeof selectedUrl === 'string') {
						const loadedData = await applicationDataManager.loadSwaggerFile(selectedUrl);
						dispatch(InjectLoadedData(loadedData));
					}
				}}
			>
				<CreateNewFolderIcon />
			</IconButton>
		</SprocketTooltip>
	);
}
