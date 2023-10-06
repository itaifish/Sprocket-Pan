import { useContext, useEffect, useState } from 'react';
import { ApplicationDataContext } from '../../../App';
import { CircularProgress, IconButton } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';

export function SaveButton() {
	const data = useContext(ApplicationDataContext);
	const [loading, setLoading] = useState(false);
	const [isModified, setIsModified] = useState(false);
	useEffect(() => {
		const updateListener = () => {
			setIsModified(true);
		};
		const saveListener = () => {
			setIsModified(false);
		};
		applicationDataManager.addListener('update', updateListener);
		applicationDataManager.addListener('saved', saveListener);
		return () => {
			applicationDataManager.removeListener('update', updateListener);
			applicationDataManager.removeListener('saved', saveListener);
		};
	}, []);
	return (
		<>
			{loading ? (
				<CircularProgress />
			) : (
				<IconButton
					id="toggle-mode"
					size="sm"
					variant="soft"
					color="neutral"
					onClick={async () => {
						setLoading(true);
						await applicationDataManager.saveApplicationData(data);
						setLoading(false);
					}}
					disabled={!isModified}
				>
					<SaveIcon />
				</IconButton>
			)}
		</>
	);
}
