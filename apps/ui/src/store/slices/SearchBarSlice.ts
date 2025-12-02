import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: { searchText: string } = {
  searchText: '',
};

const SearchBarSlice = createSlice({
  name: 'searchBar',
  initialState,
  reducers: {
    search_txt: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
  },
});

export default SearchBarSlice.reducer;
export const { search_txt } = SearchBarSlice.actions;
