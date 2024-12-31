import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { activeSlice } from './active/slice';
import { tabsSlice } from './tabs/slice';
import { uiSlice } from './ui/slice';
import { globalSlice } from './global/slice';
import { isModifiedListener } from './active/listeners/isModifiedListener';
import { stateAccessListener } from './active/listeners/stateAccessListener';

const rootReducer = combineReducers({
	[globalSlice.name]: globalSlice.reducer,
	[activeSlice.name]: activeSlice.reducer,
	[tabsSlice.name]: tabsSlice.reducer,
	[uiSlice.name]: uiSlice.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(isModifiedListener.middleware, stateAccessListener.middleware),
	});
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
