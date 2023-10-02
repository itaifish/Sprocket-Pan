import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Input } from '@mui/joy';

export function SearchInputField({
	searchText,
	setSearchText,
}: {
	searchText: string;
	setSearchText: React.Dispatch<React.SetStateAction<string>>;
}) {
	<Input
		size="sm"
		variant="outlined"
		placeholder="Search for something"
		startDecorator={<SearchRoundedIcon color="primary" />}
		sx={{
			boxShadow: 'sm',
		}}
		value={searchText}
		onChange={(e) => setSearchText(e.target.value)}
	/>;
}
