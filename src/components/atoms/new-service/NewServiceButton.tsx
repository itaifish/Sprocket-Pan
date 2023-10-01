import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useColorScheme, IconButton } from '@mui/joy';
import React from 'react';
import { log } from '../../../utils/logging';

export function NewServiceButton() {
	return (
		<IconButton
			id="toggle-mode"
			size="sm"
			variant="soft"
			color="neutral"
			onClick={() => {
				log.info('clicked');
			}}
		>
			<CreateNewFolderIcon />
		</IconButton>
	);
}
