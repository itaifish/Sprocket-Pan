import { List, ListItem, ListSubheader } from '@mui/joy';
import { useContext, useMemo, useState } from 'react';
import { ApplicationDataContext, ServicesSearchContext } from '../../App';
import { ServiceFileSystem } from './ServiceFileSystem';
import { CollapseExpandButton } from '../atoms/buttons/CollapseExpandButton';
import { SearchInputField } from '../atoms/SearchInputField';
import { filterApplicationDataServicesBySearchTerm } from '../../utils/search';
import { log } from '../../utils/logging';
import ListDivider from '@mui/joy/ListDivider';

export function NavigableServicesFileSystem() {
	const [collapsed, setCollapsed] = useState(false);
	const applicationData = useContext(ApplicationDataContext);
	const { searchText, setSearchText } = useContext(ServicesSearchContext);
	const filteredServices = useMemo(() => {
		return filterApplicationDataServicesBySearchTerm(searchText, applicationData.services);
	}, [applicationData.services, searchText]);

	return (
		<>
			<List size="sm" sx={{ '--ListItem-radius': '8px', '--List-gap': '4px', '--List-nestedInsetStart': '1rem' }}>
				<ListItem>
					<SearchInputField searchText={searchText} setSearchText={setSearchText} />
				</ListItem>
				<ListItem nested>
					<ListSubheader>
						Services
						<CollapseExpandButton collapsed={collapsed} setCollapsed={setCollapsed} />
					</ListSubheader>
					<List
						aria-labelledby="nav-list-browse"
						sx={{
							'& .JoyListItemButton-root': { p: '8px' },
						}}
					>
						{!collapsed &&
							Object.values(filteredServices)
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((service, index) => (
									<>
										<ServiceFileSystem service={service} key={index} />
										<ListDivider />{' '}
									</>
								))}
					</List>
				</ListItem>
			</List>
		</>
	);
}
