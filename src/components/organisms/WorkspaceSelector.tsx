import { useEffect, useState } from 'react';
import { fileSystemManager } from '../../managers/FileSystemManager';
import { ApplicationDataManager } from '../../managers/ApplicationDataManager';
import { Card, Grid, Typography } from '@mui/joy';

export function WorkspaceSelector() {
	const [directories, setDirectories] = useState<string[]>([]);

	useEffect(() => {
		async function saveDirectories() {
			const newDirectories = await fileSystemManager.getDirectories(ApplicationDataManager.DATA_FOLDER_NAME);
			setDirectories(newDirectories);
		}
		saveDirectories();
	}, []);

	return (
		<>
			<Grid container spacing={6}>
				<Grid xs={4}>
					<Card>
						<Typography level="title-lg">Default Workspace</Typography>
					</Card>
				</Grid>
			</Grid>
		</>
	);
}
