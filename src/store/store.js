<<<<<<< HEAD
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice';

const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});

=======
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice';

const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});

>>>>>>> a9ba5b25307e1e51fb4bcd3920e822172e771c75
export default store;