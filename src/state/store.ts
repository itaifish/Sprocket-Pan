import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { activeSlice } from './active/slice';
import { isModifiedListener } from './active/listener';
import { tabsSlice } from './tabs/slice';
import { uiSlice } from './ui/slice';
import { globalSlice } from './global/slice';

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
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(isModifiedListener.middleware),
	});
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
