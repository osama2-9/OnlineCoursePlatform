import { createSlice } from "@reduxjs/toolkit";

interface User {
    userId: number,
    full_name: string,
    email: string
    role: string
}

interface UserState {
    user: User | null
}
const initialState: UserState = {
    user: JSON.parse(localStorage.getItem('user') || "null")

}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
            localStorage.setItem('user', JSON.stringify(action.payload))
        },
        clearUser: (state) => {
            state.user = null
            localStorage.removeItem("user")
        }
    }
})

export const { clearUser, setUser } = userSlice.actions

export default userSlice.reducer