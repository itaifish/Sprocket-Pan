import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { workspacesSlice } from './workspaces/slice';

const rootReducer = combineReducers({
	[workspacesSlice.name]: workspacesSlice.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([]),
	});
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const selectRootState = (state: RootState) => state;

export const useAppDispatch: () => AppDispatch = useDispatch;