import { create } from "zustand";

const useStore = create((set) => ({
  computedDataToProfit: null, // ✅ Initial state is null
  setComputedData: (update) => {
    set((prev) => {
      const updatedData =
        typeof update === "function" ? update(prev.computedDataToProfit) : update;

      console.log("🟢 Zustand Store Updated with Data:", updatedData);
      return { computedDataToProfit: updatedData }; // ✅ Update the state correctly
    });
  },
}));

export default useStore;
