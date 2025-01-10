import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { activeSlice } from './active/slice';
import { uiSlice } from './ui/slice';
import { globalSlice } from './global/slice';
import { isModifiedListener } from './active/listeners/isModifiedListener';
import { stateAccessListener } from './active/listeners/stateAccessListener';
import { closeTabsListener, openTabsListener } from './ui/listeners';
import { workspaceSelectionListener } from './global/listeners';

const rootReducer = combineReducers({
	[globalSlice.name]: globalSlice.reducer,
	[activeSlice.name]: activeSlice.reducer,
	[uiSlice.name]: uiSlice.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(
				isModifiedListener.middleware,
				stateAccessListener.middleware,
				closeTabsListener.middleware,
				openTabsListener.middleware,
				workspaceSelectionListener.middleware,
			),
	});
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
