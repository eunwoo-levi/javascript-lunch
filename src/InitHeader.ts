import Header from "./components/header/Header";

export default function InitHeader() {
  const $headerContainer = document.querySelector(".gnb") as HTMLElement;
  Header($headerContainer);
}
