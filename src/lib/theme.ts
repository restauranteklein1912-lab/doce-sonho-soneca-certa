export function applyStoredTheme() {
  const dark = localStorage.getItem("ds-theme") === "dark";
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}
export function setTheme(dark: boolean) {
  localStorage.setItem("ds-theme", dark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", dark);
}
