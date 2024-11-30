import { ListDivider } from '@mui/joy';
import { EnvironmentFileSystem } from './EnvironmentFileSystem';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectEnvironments } from '../../../../state/active/selectors';
import { SearchField } from '../../../shared/SearchField';
import { FileSystemTrunk } from '../tree/FileSystemTrunk';
import { searchEnvironments } from '../../../../utils/search';
import { ELEMENT_ID } from '../../../../constants/uiElementIds';

export function EnvironmentsFileSystem() {
	const environments = useSelector(selectEnvironments);
	const [searchText, setSearchText] = useState('');

	const filteredEnvironmentIds = useMemo(
		() => searchEnvironments(environments, searchText),
		[environments, searchText],
	);

	return (
		<FileSystemTrunk
			id={ELEMENT_ID.sidebar.environments}
			header="Environments"
			actions={<SearchField onChange={setSearchText} />}
		>
			{filteredEnvironmentIds.map((environmentId, index) => (
				<div key={environmentId}>
					{index !== 0 && <ListDivider />}
					<EnvironmentFileSystem environmentId={environmentId} />
				</div>
			))}
		</FileSystemTrunk>
	);
}
