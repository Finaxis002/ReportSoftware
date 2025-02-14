const { createSlice } = require("@reduxjs/toolkit");

const initialUserData = JSON.parse(localStorage.getItem('userData')) || {};


const initialState={
    userData: initialUserData
}
const dataSlice = createSlice({
    name: "uerData",
    initialState,
    reducers: {
        getUserData : (state,action) =>{
             state.userData = action.payload
            //state.data = "Hi"
        },
    }
})

export default dataSlice.reducer;
export const {getUserData} = dataSlice.actions;