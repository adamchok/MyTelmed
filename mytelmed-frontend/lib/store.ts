"use client";

import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";

export const makeStore = () => {
  return configureStore({
    reducer: { rootReducer },
  });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
