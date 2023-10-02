export type StateContext<TData, TDataName extends string> = Record<TDataName, TData> &
	Record<`set${Capitalize<TDataName>}`, React.Dispatch<React.SetStateAction<TData>>>;

const TabTypes = ['service', 'endpoint', 'environment', 'request'] as const;

type TabType = (typeof TabTypes)[number];

export type Tab<TTabType extends TabType> = {
	tabType: TTabType;
} & (TTabType extends 'environment'
	? { environmentName: string }
	: { serviceName: string } & (TTabType extends 'endpoint' | 'request'
			? { endpointName: string } & TTabType extends 'request'
				? { endpointName: string; requestName: string }
				: Record<string, unknown>
			: Record<string, unknown>));

const serviceTab: Tab<'service'> = { tabType: 'service', serviceName: 'asdf' };
const environmentTab: Tab<'environment'> = { tabType: 'environment', environmentName: 'asdf' };
const endpointTab: Tab<'endpoint'> = { tabType: 'endpoint', serviceName: 'asdf', endpointName: 'asdf' };
const requestTab: Tab<'request'> = {
	tabType: 'request',
	serviceName: 'asdf',
	endpointName: 'asdf',
	requestName: 'asdf',
};
