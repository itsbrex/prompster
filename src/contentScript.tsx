import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import AutoComplete from "./components/AutoComplete";
import prompts from "../static/prompts.json";
import "../styles/global.css";

let autoCompleteOpen = false;

const handlePromptInsert = (
  inputField: HTMLInputElement | HTMLTextAreaElement,
  prompt: string
) => {
  const cursorPosition = inputField.selectionStart || 0;
  const currentValue = inputField.value;
  inputField.value = currentValue.slice(0, cursorPosition - 1) + prompt
  inputField.focus();
  inputField.setSelectionRange(
    cursorPosition + prompt.length,
    cursorPosition + prompt.length
  );
  const event = new Event("input", { bubbles: true });
  inputField.dispatchEvent(event);
};

const getCaretCoordinates = (
  inputField: HTMLInputElement | HTMLTextAreaElement
) => {
  // const range = document.createRange();
  // const selection = window.getSelection();

  // const textNode =
  //   inputField instanceof HTMLTextAreaElement
  //     ? inputField.childNodes[0] || inputField
  //     : inputField;

  // range.setStart(textNode, inputField.selectionStart || 0);
  // range.setEnd(textNode, inputField.selectionEnd || 0);

  // const rect = range.getBoundingClientRect();
  // const inputRect = inputField.getBoundingClientRect();

  // return {
  //   left: rect.left - inputRect.left,
  //   top: rect.top - inputRect.top,
  // };

  return {
    left: 0,
    top: 0,
  }
};

const handleEscape = (
  e: KeyboardEvent,
  div: HTMLDivElement,
  inputField: HTMLInputElement | HTMLTextAreaElement
) => {
  if (e.key === "Escape") {
    handleCloseAutoComplete(div);
    inputField.focus();
  }
};

const handleCloseAutoComplete = (
  div: HTMLDivElement,
) => {
  if (div.parentElement) {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  }
  autoCompleteOpen = false;
};

document.body.addEventListener("keydown", (e: KeyboardEvent) => {
  if (
    e.key === "/" &&
    !autoCompleteOpen &&
    (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
  ) {
    autoCompleteOpen = true;
    const inputField = e.target as HTMLInputElement | HTMLTextAreaElement;
    const rect = inputField.getBoundingClientRect();
    const caretCoordinates = getCaretCoordinates(inputField);

    const position = rect.top < window.innerHeight / 2 ? "below" : "above";
    const positionDirection = position === "above" ? -1 : 1;

    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = `${rect.left + window.scrollX}px`;
    div.style.zIndex = "1000";

    if (position === "above") {
      div.style.bottom = `${window.innerHeight - rect.bottom + window.pageYOffset}px`;
    } else {
      div.style.top = `${rect.top + window.pageYOffset}px`;
    }

    document.body.appendChild(div);

    e.preventDefault();

    const escapeListener = (e: KeyboardEvent) => {
      handleEscape(e, div, inputField);
    };

    document.addEventListener("keydown", escapeListener);

    ReactDOM.render(
      <React.StrictMode>
        <AutoComplete
          prompts={prompts}
          onPromptInsert={(prompt) => {
            handlePromptInsert(inputField, prompt);
            handleCloseAutoComplete(div);
            document.removeEventListener("keydown", escapeListener);
          }}
          position={position}
        />
      </React.StrictMode>,
      div,
    );
  }
});