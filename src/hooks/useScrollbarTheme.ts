import { selectSettings } from '@/state/active/selectors';
import { ScrollbarVisibility } from '@/types/data/settings';
import { useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';

export function useScrollbarTheme() {
	const theme = useTheme();
	const visibility = useSelector(selectSettings).theme.scrollbarVisibility;
	const styles = {
		minimal: {
			scrollbarWidth: 'none',
			scrollbarColor: `${theme.palette.primary.plainActiveBg} ${theme.palette.background.surface}`,
		},
		average: {
			scrollbarWidth: 'thin',
			scrollbarColor: `${theme.palette.primary.plainActiveBg} ${theme.palette.background.surface}`,
		},
		guttered: {
			scrollbarWidth: 'thin',
			scrollbarColor: `${theme.palette.primary.plainActiveBg} ${theme.palette.background.backdrop}`,
		},
	};
	if (visibility === ScrollbarVisibility.hidden) {
		styles.average.scrollbarWidth = 'none';
		styles.guttered.scrollbarWidth = 'thin';
	} else if (visibility === ScrollbarVisibility.visible) {
		styles.average.scrollbarWidth = 'auto';
		styles.minimal.scrollbarWidth = 'auto';
		styles.guttered.scrollbarWidth = 'auto';
	}
	return styles;
}
