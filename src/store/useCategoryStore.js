import { create } from 'zustand';

const useCategoryStore = create((set) => ({
  selectedCategory: null, //사용자가 선택한 카테고리

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  clearSelectedCategory: () => { //촬영이 취소되거나 세션이 끝났을 때 
    set({ selectedCategory: null });
  },
}));

export default useCategoryStore;