import { div } from "../../../libs/makeElement.js";

export function HomeView() {
  return div({ className: 'view', id: 'home' }, "Hello from SSR!");
}