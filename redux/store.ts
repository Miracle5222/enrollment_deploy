import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

// ✅ Types for Next.js + TS
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
