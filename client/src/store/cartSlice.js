import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/cart');
    return response.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (itemData, { rejectWithValue }) => {
  try {
    const response = await api.post('/cart', itemData);
    return response.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update item');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const initialState = {
  items: [],
  subtotal: 0,
  restaurant: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.restaurant = action.payload?.restaurant || null;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If user isn't logged in, just show empty cart
        state.items = [];
        state.subtotal = 0;
        state.restaurant = null;
      })
      // Add
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.restaurant = action.payload?.restaurant || null;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.restaurant = action.payload?.restaurant || null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.restaurant = action.payload?.restaurant || null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Clear
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.subtotal = 0;
        state.restaurant = null;
      })
      .addCase(clearCart.rejected, (state) => {
        // Even if API fails, clear locally
        state.items = [];
        state.subtotal = 0;
        state.restaurant = null;
      });
  },
});

export default cartSlice.reducer;
