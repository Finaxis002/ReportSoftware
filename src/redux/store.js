// import { configureStore } from "@reduxjs/toolkit/dist/configureStore"
import {configureStore} from '@reduxjs/toolkit'
import dataReducer from './user/user-slice';

// import dataReducer from "./user/data-slice"
const store = configureStore({
    reducer : {
        data : dataReducer, 
    }
})

export default store;