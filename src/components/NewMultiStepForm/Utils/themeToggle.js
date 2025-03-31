// utils/themeToggle.js
export const toggleTheme = () => {
    const currentTheme = localStorage.getItem("theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", currentTheme);
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
  };
  