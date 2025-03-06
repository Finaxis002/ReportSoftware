import { create } from "zustand";

const useStore = create((set) => ({
  computedDataToProfit: null, // ✅ Store computed data
  isDataReady: false, // ✅ Track whether computations are complete

  setComputedDataToProfit: (data) => {
    set(() => ({
      computedDataToProfit: data,
      isDataReady: true, // ✅ Mark computations as complete
    }));
    // console.log("🟢 Zustand Updated with Computed Data:", data);
  },

  resetDataReady: () => set({ isDataReady: false }), // ✅ Reset before computations
}));

export default useStore;
