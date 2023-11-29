import { combineReducers } from "redux";
import { reducer as reduxForm } from "redux-form";
import authReducer from "./authReducer.ts";
import blogsReducer from "./blogsReducer.ts";

export const reducers = combineReducers({
  auth: authReducer,
  form: reduxForm,
  blogs: blogsReducer,
});
