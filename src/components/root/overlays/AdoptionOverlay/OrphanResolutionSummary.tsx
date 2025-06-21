import { Typography } from '@mui/joy';
import { OrphanResolution } from './OrphanResolutionDropdown';

interface OrphanResolutionSummaryProps {
	strategy: Record<string, string | OrphanResolution>;
}

export function OrphanResolutionSummary({ strategy }: OrphanResolutionSummaryProps) {
	const values = Object.values(strategy);
	// bet I could do some fancy reduce thing here
	const deletedNum = values.filter((val) => val === OrphanResolution.delete).length;
	const createdNum = values.filter((val) => val === OrphanResolution.create).length;
	const revivedNum = values.filter((val) => val === OrphanResolution.revive).length;
	const assignedNum = values.length - deletedNum - createdNum - revivedNum;
	return (
		<Typography level="body-md">
			A total of {deletedNum} item(s) will be irreversibly discarded,{' '}
			{createdNum > 0 && <>{createdNum} item(s) will be assigned to a single new Service and/or Endpoint, </>}
			{revivedNum} item(s) will have their parent Services and/or Endpoints revived, and {assignedNum} item(s) will be
			assigned to other Services and/or Endpoints.
		</Typography>
	);
}
