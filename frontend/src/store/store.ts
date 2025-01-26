import { configureStore } from "@reduxjs/toolkit";
import userReduer from './userSlice'

const store = configureStore({
    reducer: {
        user: userReduer
    }
})

export type RootState = ReturnType<typeof store.getState>
export default store