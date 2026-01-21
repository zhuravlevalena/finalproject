import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/entities/user/model/user.slice';
import marketplaceReducer from '@/entities/marketplace/model/marketplace.slice';
import templateReducer from '@/entities/template/model/template.slice';
import imageReducer from '@/entities/image/model/image.slice';
import productCardReducer from '@/entities/productcard/model/productcard.slice';
import productProfileReducer from '@/entities/productprofile/model/productprofile.slice';
import aiReducer from '@/entities/ai/model/ai.slice';
import navbarReducer from '@/widgets/navbar/model/navbar.slice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    marketplace: marketplaceReducer,
    template: templateReducer,
    image: imageReducer,
    productCard: productCardReducer,
    productProfile: productProfileReducer,
    ai: aiReducer,
    navbar: navbarReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
