import { store } from '../../store/store';

// Store-related type aliases that must remain as types due to TypeScript constraints
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
