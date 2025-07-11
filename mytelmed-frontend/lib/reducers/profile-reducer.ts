import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
    profileImageUrl: string | null;
    name: string | null;
    email: string | null;
}

const initialState: ProfileState = {
    profileImageUrl: null,
    name: null,
    email: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        updateProfileImage(state, action: PayloadAction<string>) {
            state.profileImageUrl = action.payload;
        },
        updateProfileInfo(state, action: PayloadAction<{ name?: string; email?: string; profileImageUrl?: string }>) {
            if (action.payload.name !== undefined) {
                state.name = action.payload.name;
            }
            if (action.payload.email !== undefined) {
                state.email = action.payload.email;
            }
            if (action.payload.profileImageUrl !== undefined) {
                state.profileImageUrl = action.payload.profileImageUrl;
            }
        },
        clearProfile(state) {
            state.profileImageUrl = null;
            state.name = null;
            state.email = null;
        },
    },
});

export const { updateProfileImage, updateProfileInfo, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
