import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Input } from '@mui/joy';

export function SearchInputField({
	searchText,
	setSearchText,
}: {
	searchText: string;
	setSearchText: React.Dispatch<React.SetStateAction<string>>;
}) {
	return (
		<Input
			size="sm"
			variant="outlined"
			placeholder="Search for something"
			startDecorator={<SearchRoundedIcon color="primary" />}
			sx={{
				boxShadow: 'sm',
				width: '100%',
			}}
			value={searchText}
			onChange={(e) => setSearchText(e.target.value)}
		/>
	);
}
