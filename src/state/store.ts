import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { workspacesSlice } from './workspaces/slice';
import { activeSlice } from './active/slice';
import { isModifiedListener, settingsChangedListener } from './active/listener';
import { tabsSlice } from './tabs/slice';

const rootReducer = combineReducers({
	[workspacesSlice.name]: workspacesSlice.reducer,
	[activeSlice.name]: activeSlice.reducer,
	[tabsSlice.name]: tabsSlice.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(isModifiedListener.middleware).concat(settingsChangedListener.middleware),
	});
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
