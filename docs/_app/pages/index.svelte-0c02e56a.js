import { get_store_value, SvelteComponent, init, safe_not_equal, flush, element, space, text, claim_element, children, detach, claim_space, claim_text, attr, toggle_class, insert_hydration, append_hydration, set_input_value, listen, action_destroyer, prevent_default, set_data, run_all, empty, noop, createEventDispatcher, binding_callbacks, set_style, destroy_each, HtmlTagHydration, claim_html_tag, create_component, claim_component, mount_component, transition_in, transition_out, destroy_component, component_subscribe, set_store_value, setContext, onMount } from "../chunks/index-0aa0f850.js";
import { writable } from "../chunks/index-279c23e1.js";
let t = {};
const exec = (command, value = null) => {
  document.execCommand(command, false, value);
};
const getTagsRecursive = (element2, tags) => {
  tags = tags || (element2 && element2.tagName ? [element2.tagName] : []);
  if (element2 && element2.parentNode) {
    element2 = element2.parentNode;
  } else {
    return tags;
  }
  const tag = element2.tagName;
  if (element2.style && element2.getAttribute) {
    [element2.style.textAlign || element2.getAttribute("align"), element2.style.color || tag === "FONT" && "forecolor", element2.style.backgroundColor && "backcolor"].filter((item) => item).forEach((item) => tags.push(item));
  }
  if (tag === "DIV") {
    return tags;
  }
  tags.push(tag);
  return getTagsRecursive(element2, tags).filter((_tag) => _tag != null);
};
const saveRange = (editor) => {
  const documentSelection = document.getSelection();
  t.range = null;
  if (documentSelection.rangeCount) {
    let savedRange = t.range = documentSelection.getRangeAt(0);
    let range = document.createRange();
    let rangeStart;
    range.selectNodeContents(editor);
    range.setEnd(savedRange.startContainer, savedRange.startOffset);
    rangeStart = (range + "").length;
    t.metaRange = {
      start: rangeStart,
      end: rangeStart + (savedRange + "").length
    };
  }
};
const restoreRange = (editor) => {
  let metaRange = t.metaRange;
  let savedRange = t.range;
  let documentSelection = document.getSelection();
  let range;
  if (!savedRange) {
    return;
  }
  if (metaRange && metaRange.start !== metaRange.end) {
    let charIndex = 0, nodeStack = [editor], node, foundStart = false, stop = false;
    range = document.createRange();
    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        let nextCharIndex = charIndex + node.length;
        if (!foundStart && metaRange.start >= charIndex && metaRange.start <= nextCharIndex) {
          range.setStart(node, metaRange.start - charIndex);
          foundStart = true;
        }
        if (foundStart && metaRange.end >= charIndex && metaRange.end <= nextCharIndex) {
          range.setEnd(node, metaRange.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let cn = node.childNodes;
        let i = cn.length;
        while (i > 0) {
          i -= 1;
          nodeStack.push(cn[i]);
        }
      }
    }
  }
  documentSelection.removeAllRanges();
  documentSelection.addRange(range || savedRange);
};
const cleanHtml = (input) => {
  const html = input.match(/<!--StartFragment-->(.*?)<!--EndFragment-->/);
  let output = html && html[1] || input;
  output = output.replace(/\r?\n|\r/g, " ").replace(/<!--(.*?)-->/g, "").replace(new RegExp("<(/)*(meta|link|span|\\?xml:|st1:|o:|font|w:sdt)(.*?)>", "gi"), "").replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi, "").replace(/style="[^"]*"/gi, "").replace(/style='[^']*'/gi, "").replace(/&nbsp;/gi, " ").replace(/>(\s+)</g, "><").replace(/class="[^"]*"/gi, "").replace(/class='[^']*'/gi, "").replace(/<[^/].*?>/g, (i) => i.split(/[ >]/g)[0] + ">").trim();
  output = removeBadTags(output);
  return output;
};
const unwrap = (wrapper) => {
  const docFrag = document.createDocumentFragment();
  while (wrapper.firstChild) {
    const child = wrapper.removeChild(wrapper.firstChild);
    docFrag.appendChild(child);
  }
  wrapper.parentNode.replaceChild(docFrag, wrapper);
};
const removeBlockTagsRecursive = (elements, tagsToRemove) => {
  Array.from(elements).forEach((item) => {
    if (tagsToRemove.some((tag) => tag === item.tagName.toLowerCase())) {
      if (item.children.length) {
        removeBlockTagsRecursive(item.children, tagsToRemove);
      }
      unwrap(item);
    }
  });
};
const getActionBtns = (actions) => {
  return Object.keys(actions).map((action) => actions[action]);
};
const getNewActionObj = (actions, userActions = []) => {
  if (userActions && userActions.length) {
    const newActions = {};
    userActions.forEach((action) => {
      if (typeof action === "string") {
        newActions[action] = Object.assign({}, actions[action]);
      } else if (actions[action.name]) {
        newActions[action.name] = Object.assign(actions[action.name], action);
      } else {
        newActions[action.name] = Object.assign({}, action);
      }
    });
    return newActions;
  } else {
    return actions;
  }
};
const removeBadTags = (html) => {
  ["style", "script", "applet", "embed", "noframes", "noscript"].forEach((badTag) => {
    html = html.replace(new RegExp(`<${badTag}.*?${badTag}(.*?)>`, "gi"), "");
  });
  return html;
};
const isEditorClick = (target, editorWrapper) => {
  if (target === editorWrapper) {
    return true;
  }
  if (target.parentElement) {
    return isEditorClick(target.parentElement, editorWrapper);
  }
  return false;
};
const linkSvg = '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>';
const unlinkSvg = '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"></path><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"></path></svg>';
var defaultActions = {
  viewHtml: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"></path></svg>',
    title: "View HTML",
    result: function() {
      let refs = get_store_value(this.references);
      let actionObj = get_store_value(this.state).actionObj;
      let helper = get_store_value(this.helper);
      helper.showEditor = !helper.showEditor;
      refs.editor.style.display = helper.showEditor ? "block" : "none";
      refs.raw.style.display = helper.showEditor ? "none" : "block";
      if (helper.showEditor) {
        refs.editor.innerHTML = refs.raw.value;
      } else {
        refs.raw.value = refs.editor.innerHTML;
      }
      setTimeout(() => {
        Object.keys(actionObj).forEach((action) => actionObj[action].disabled = !helper.showEditor);
        actionObj.viewHtml.disabled = false;
        actionObj.viewHtml.active = !helper.showEditor;
        this.state.update((state2) => {
          state2.actionBtns = getActionBtns(actionObj);
          state2.actionObj = actionObj;
          return state2;
        });
      });
    }
  },
  undo: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M61.2 51.2c0-5.1-2.1-9.7-5.4-13.1-3.3-3.3-8-5.4-13.1-5.4H26.1v-12L10.8 36l15.3 15.3V39.1h16.7c3.3 0 6.4 1.3 8.5 3.5 2.2 2.2 3.5 5.2 3.5 8.5h6.4z"></path></svg>',
    title: "Undo",
    result: () => exec("undo")
  },
  redo: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M10.8 51.2c0-5.1 2.1-9.7 5.4-13.1 3.3-3.3 8-5.4 13.1-5.4H46v-12L61.3 36 45.9 51.3V39.1H29.3c-3.3 0-6.4 1.3-8.5 3.5-2.2 2.2-3.5 5.2-3.5 8.5h-6.5z"></path></svg>',
    title: "Redo",
    result: () => exec("redo")
  },
  b: {
    icon: "<b>B</b>",
    title: "Bold",
    result: () => exec("bold")
  },
  i: {
    icon: "<i>I</i>",
    title: "Italic",
    result: () => exec("italic")
  },
  u: {
    icon: "<u>U</u>",
    title: "Underline",
    result: () => exec("underline")
  },
  strike: {
    icon: "<strike>S</strike>",
    title: "Strike-through",
    result: () => exec("strikeThrough")
  },
  sup: {
    icon: "A<sup>2</sup>",
    title: "Superscript",
    result: () => exec("superscript")
  },
  sub: {
    icon: "A<sub>2</sub>",
    title: "Subscript",
    result: () => exec("subscript")
  },
  h1: {
    icon: "<b>H<sub>1</sub></b>",
    title: "Heading 1",
    result: () => exec("formatBlock", "<H1>")
  },
  h2: {
    icon: "<b>H<sub>2</sub></b>",
    title: "Heading 2",
    result: () => exec("formatBlock", "<H2>")
  },
  p: {
    icon: "&#182;",
    title: "Paragraph",
    result: () => exec("formatBlock", "<P>")
  },
  blockquote: {
    icon: "&#8220; &#8221;",
    title: "Quote",
    result: () => exec("formatBlock", "<BLOCKQUOTE>")
  },
  ol: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"></path></svg>',
    title: "Ordered List",
    result: () => exec("insertOrderedList")
  },
  ul: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"></path></svg>',
    title: "Unordered List",
    result: () => exec("insertUnorderedList")
  },
  hr: {
    icon: "&#8213;",
    title: "Horizontal Line",
    result: () => exec("insertHorizontalRule")
  },
  left: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h36v8H9z"></path></svg>',
    title: "Justify left",
    result: () => exec("justifyLeft")
  },
  right: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM27 32h36v8H27z"></path></svg>',
    title: "Justify right",
    result: () => exec("justifyRight")
  },
  center: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM18 32h36v8H18z"></path></svg>',
    title: "Justify center",
    result: () => exec("justifyCenter")
  },
  justify: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h54v8H9z"></path></svg>',
    title: "Justify full",
    result: () => exec("justifyFull")
  },
  a: {
    icon: linkSvg,
    title: "Insert link",
    result: function() {
      const actionObj = get_store_value(this.state).actionObj;
      const refs = get_store_value(this.references);
      if (actionObj.a.active) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(document.getSelection().focusNode);
        selection.removeAllRanges();
        selection.addRange(range);
        exec("unlink");
        actionObj.a.title = "Insert link";
        actionObj.a.icon = linkSvg;
        this.state.update((state2) => {
          state2.actionBtn = getActionBtns(actionObj);
          state2.actionObj = actionObj;
          return state2;
        });
      } else {
        saveRange(refs.editor);
        refs.modal.$set({
          show: true,
          event: "linkUrl",
          title: "Insert link",
          label: "Url"
        });
        if (!get_store_value(this.helper).link) {
          this.helper.update((state2) => {
            state2.link = true;
            return state2;
          });
          refs.modal.$on("linkUrl", (event) => {
            restoreRange(refs.editor);
            exec("createLink", event.detail);
            actionObj.a.title = "Unlink";
            actionObj.a.icon = unlinkSvg;
            this.state.update((state2) => {
              state2.actionBtn = getActionBtns(actionObj);
              state2.actionObj = actionObj;
              return state2;
            });
          });
        }
      }
    }
  },
  image: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"></path><path d="M17.5 22C15 22 13 24 13 26.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zM16 50h27L29.5 32zM36 36.2l8.9-8.5L60.2 50H45.9S35.6 35.9 36 36.2z"></path></svg>',
    title: "Image",
    result: function() {
      const refs = get_store_value(this.references);
      saveRange(refs.editor);
      refs.modal.$set({
        show: true,
        event: "imageUrl",
        title: "Insert image",
        label: "Url"
      });
      if (!get_store_value(this.helper).image) {
        this.helper.update((state2) => {
          state2.image = true;
          return state2;
        });
        refs.modal.$on("imageUrl", (event) => {
          restoreRange(refs.editor);
          exec("insertImage", event.detail);
        });
      }
    }
  },
  forecolor: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M32 15h7.8L56 57.1h-7.9l-4-11.1H27.4l-4 11.1h-7.6L32 15zm-2.5 25.4h12.9L36 22.3h-.2l-6.3 18.1z"></path></svg>',
    title: "Text color",
    colorPicker: true,
    result: function() {
      showColorPicker.call(this, "foreColor");
    }
  },
  backcolor: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"></path><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"></path></svg>',
    title: "Background color",
    colorPicker: true,
    result: function() {
      showColorPicker.call(this, "backColor");
    }
  },
  removeFormat: {
    icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M58.2 54.6L52 48.5l3.6-3.6 6.1 6.1 6.4-6.4 3.8 3.8-6.4 6.4 6.1 6.1-3.6 3.6-6.1-6.1-6.4 6.4-3.7-3.8 6.4-6.4zM21.7 52.1H50V57H21.7zM18.8 15.2h34.1v6.4H39.5v24.2h-7.4V21.5H18.8v-6.3z"></path></svg>',
    title: "Remove format",
    result: function() {
      const refs = get_store_value(this.references);
      const selection = window.getSelection();
      if (!selection.toString().length) {
        removeBlockTagsRecursive(refs.editor.children, this.removeFormatTags);
        const range = document.createRange();
        range.selectNodeContents(refs.editor);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      exec("removeFormat");
      selection.removeAllRanges();
    }
  }
};
const showColorPicker = function(cmd) {
  const refs = get_store_value(this.references);
  saveRange(refs.editor);
  refs.colorPicker.$set({ show: true, event: cmd });
  if (!get_store_value(this.helper)[cmd]) {
    this.helper.update((state2) => {
      state2[cmd] = true;
      return state2;
    });
    refs.colorPicker.$on(cmd, (event) => {
      let item = event.detail;
      if (item.modal) {
        refs.modal.$set({
          show: true,
          event: `${cmd}Changed`,
          title: "Text color",
          label: cmd === "foreColor" ? "Text color" : "Background color"
        });
        const command = cmd;
        if (!get_store_value(this.helper)[`${command}Modal`]) {
          get_store_value(this.helper)[`${command}Modal`] = true;
          refs.modal.$on(`${command}Changed`, (event2) => {
            let color = event2.detail;
            restoreRange(refs.editor);
            exec(command, color);
          });
        }
      } else {
        restoreRange(refs.editor);
        exec(cmd, item.color);
      }
    });
  }
};
var EditorModal_svelte_svelte_type_style_lang = "";
function create_if_block(ctx) {
  let div0;
  let t0;
  let div2;
  let div1;
  let span0;
  let t1;
  let t2;
  let form;
  let label_1;
  let input;
  let inputType_action;
  let t3;
  let span2;
  let span1;
  let t4;
  let t5;
  let t6;
  let button0;
  let t7;
  let t8;
  let button1;
  let t9;
  let mounted;
  let dispose;
  let if_block = ctx[2] && create_if_block_1();
  return {
    c() {
      div0 = element("div");
      t0 = space();
      div2 = element("div");
      div1 = element("div");
      span0 = element("span");
      t1 = text(ctx[3]);
      t2 = space();
      form = element("form");
      label_1 = element("label");
      input = element("input");
      t3 = space();
      span2 = element("span");
      span1 = element("span");
      t4 = text(ctx[4]);
      t5 = space();
      if (if_block)
        if_block.c();
      t6 = space();
      button0 = element("button");
      t7 = text("Confirm");
      t8 = space();
      button1 = element("button");
      t9 = text("Cancel");
      this.h();
    },
    l(nodes) {
      div0 = claim_element(nodes, "DIV", { class: true });
      children(div0).forEach(detach);
      t0 = claim_space(nodes);
      div2 = claim_element(nodes, "DIV", { class: true });
      var div2_nodes = children(div2);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      span0 = claim_element(div1_nodes, "SPAN", { class: true });
      var span0_nodes = children(span0);
      t1 = claim_text(span0_nodes, ctx[3]);
      span0_nodes.forEach(detach);
      t2 = claim_space(div1_nodes);
      form = claim_element(div1_nodes, "FORM", {});
      var form_nodes = children(form);
      label_1 = claim_element(form_nodes, "LABEL", { class: true });
      var label_1_nodes = children(label_1);
      input = claim_element(label_1_nodes, "INPUT", { name: true, class: true });
      t3 = claim_space(label_1_nodes);
      span2 = claim_element(label_1_nodes, "SPAN", { class: true });
      var span2_nodes = children(span2);
      span1 = claim_element(span2_nodes, "SPAN", { class: true });
      var span1_nodes = children(span1);
      t4 = claim_text(span1_nodes, ctx[4]);
      span1_nodes.forEach(detach);
      t5 = claim_space(span2_nodes);
      if (if_block)
        if_block.l(span2_nodes);
      span2_nodes.forEach(detach);
      label_1_nodes.forEach(detach);
      t6 = claim_space(form_nodes);
      button0 = claim_element(form_nodes, "BUTTON", { class: true, type: true });
      var button0_nodes = children(button0);
      t7 = claim_text(button0_nodes, "Confirm");
      button0_nodes.forEach(detach);
      t8 = claim_space(form_nodes);
      button1 = claim_element(form_nodes, "BUTTON", { class: true, type: true });
      var button1_nodes = children(button1);
      t9 = claim_text(button1_nodes, "Cancel");
      button1_nodes.forEach(detach);
      form_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "cl-editor-overlay svelte-42yfje");
      attr(span0, "class", "modal-title svelte-42yfje");
      attr(input, "name", "text");
      attr(input, "class", "svelte-42yfje");
      attr(span1, "class", "svelte-42yfje");
      attr(span2, "class", "input-info svelte-42yfje");
      attr(label_1, "class", "modal-label svelte-42yfje");
      toggle_class(label_1, "input-error", ctx[2]);
      attr(button0, "class", "modal-button modal-submit svelte-42yfje");
      attr(button0, "type", "submit");
      attr(button1, "class", "modal-button modal-reset svelte-42yfje");
      attr(button1, "type", "reset");
      attr(div1, "class", "modal-box svelte-42yfje");
      attr(div2, "class", "cl-editor-modal svelte-42yfje");
    },
    m(target, anchor) {
      insert_hydration(target, div0, anchor);
      insert_hydration(target, t0, anchor);
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div1);
      append_hydration(div1, span0);
      append_hydration(span0, t1);
      append_hydration(div1, t2);
      append_hydration(div1, form);
      append_hydration(form, label_1);
      append_hydration(label_1, input);
      ctx[11](input);
      set_input_value(input, ctx[1]);
      append_hydration(label_1, t3);
      append_hydration(label_1, span2);
      append_hydration(span2, span1);
      append_hydration(span1, t4);
      append_hydration(span2, t5);
      if (if_block)
        if_block.m(span2, null);
      append_hydration(form, t6);
      append_hydration(form, button0);
      append_hydration(button0, t7);
      append_hydration(form, t8);
      append_hydration(form, button1);
      append_hydration(button1, t9);
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[8]),
          listen(input, "keyup", ctx[9]),
          action_destroyer(inputType_action = ctx[6].call(null, input)),
          listen(input, "input", ctx[12]),
          listen(button1, "click", ctx[8]),
          listen(form, "submit", prevent_default(ctx[13]))
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 8)
        set_data(t1, ctx2[3]);
      if (dirty & 2 && input.value !== ctx2[1]) {
        set_input_value(input, ctx2[1]);
      }
      if (dirty & 16)
        set_data(t4, ctx2[4]);
      if (ctx2[2]) {
        if (if_block)
          ;
        else {
          if_block = create_if_block_1();
          if_block.c();
          if_block.m(span2, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & 4) {
        toggle_class(label_1, "input-error", ctx2[2]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div0);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(div2);
      ctx[11](null);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1(ctx) {
  let span;
  let t2;
  return {
    c() {
      span = element("span");
      t2 = text("Required");
      this.h();
    },
    l(nodes) {
      span = claim_element(nodes, "SPAN", { class: true });
      var span_nodes = children(span);
      t2 = claim_text(span_nodes, "Required");
      span_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(span, "class", "msg-error svelte-42yfje");
    },
    m(target, anchor) {
      insert_hydration(target, span, anchor);
      append_hydration(span, t2);
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_fragment$3(ctx) {
  let if_block_anchor;
  let if_block = ctx[0] && create_if_block(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if (if_block)
        if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let dispatcher = new createEventDispatcher();
  let { show = false } = $$props;
  let { text: text2 = "" } = $$props;
  let { event = "" } = $$props;
  let { title = "" } = $$props;
  let { label = "" } = $$props;
  let { error = false } = $$props;
  let refs = {};
  const inputType = (e) => {
    e.type = event.includes("Color") ? "color" : "text";
  };
  function confirm() {
    if (text2) {
      dispatcher(event, text2);
      cancel();
    } else {
      $$invalidate(2, error = true);
      refs.text.focus();
    }
  }
  function cancel() {
    $$invalidate(0, show = false);
    $$invalidate(1, text2 = "");
    $$invalidate(2, error = false);
  }
  function hideError() {
    $$invalidate(2, error = false);
  }
  function input_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      refs.text = $$value;
      $$invalidate(5, refs);
    });
  }
  function input_input_handler() {
    text2 = this.value;
    $$invalidate(1, text2);
  }
  const submit_handler = (event2) => confirm();
  $$self.$$set = ($$props2) => {
    if ("show" in $$props2)
      $$invalidate(0, show = $$props2.show);
    if ("text" in $$props2)
      $$invalidate(1, text2 = $$props2.text);
    if ("event" in $$props2)
      $$invalidate(10, event = $$props2.event);
    if ("title" in $$props2)
      $$invalidate(3, title = $$props2.title);
    if ("label" in $$props2)
      $$invalidate(4, label = $$props2.label);
    if ("error" in $$props2)
      $$invalidate(2, error = $$props2.error);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 33) {
      {
        if (show) {
          setTimeout(() => {
            refs.text.focus();
          });
        }
      }
    }
  };
  return [
    show,
    text2,
    error,
    title,
    label,
    refs,
    inputType,
    confirm,
    cancel,
    hideError,
    event,
    input_binding,
    input_input_handler,
    submit_handler
  ];
}
class EditorModal extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      show: 0,
      text: 1,
      event: 10,
      title: 3,
      label: 4,
      error: 2
    });
  }
  get show() {
    return this.$$.ctx[0];
  }
  set show(show) {
    this.$$set({ show });
    flush();
  }
  get text() {
    return this.$$.ctx[1];
  }
  set text(text2) {
    this.$$set({ text: text2 });
    flush();
  }
  get event() {
    return this.$$.ctx[10];
  }
  set event(event) {
    this.$$set({ event });
    flush();
  }
  get title() {
    return this.$$.ctx[3];
  }
  set title(title) {
    this.$$set({ title });
    flush();
  }
  get label() {
    return this.$$.ctx[4];
  }
  set label(label) {
    this.$$set({ label });
    flush();
  }
  get error() {
    return this.$$.ctx[2];
  }
  set error(error) {
    this.$$set({ error });
    flush();
  }
}
var EditorColorPicker_svelte_svelte_type_style_lang = "";
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
function create_each_block$1(ctx) {
  let button;
  let t_value = (ctx[8].text || "") + "";
  let t2;
  let mounted;
  let dispose;
  function click_handler(...args) {
    return ctx[6](ctx[8], ...args);
  }
  return {
    c() {
      button = element("button");
      t2 = text(t_value);
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", { type: true, class: true, style: true });
      var button_nodes = children(button);
      t2 = claim_text(button_nodes, t_value);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "type", "button");
      attr(button, "class", "color-picker-btn svelte-njq4pk");
      set_style(button, "background-color", ctx[8].color);
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      append_hydration(button, t2);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && t_value !== (t_value = (ctx[8].text || "") + ""))
        set_data(t2, t_value);
      if (dirty & 2) {
        set_style(button, "background-color", ctx[8].color);
      }
    },
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$2(ctx) {
  let div2;
  let div0;
  let t2;
  let div1;
  let mounted;
  let dispose;
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      t2 = space();
      div1 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div2 = claim_element(nodes, "DIV", { style: true });
      var div2_nodes = children(div2);
      div0 = claim_element(div2_nodes, "DIV", { class: true });
      children(div0).forEach(detach);
      t2 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(div1_nodes);
      }
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "color-picker-overlay svelte-njq4pk");
      attr(div1, "class", "color-picker-wrapper svelte-njq4pk");
      set_style(div2, "display", ctx[0] ? "block" : "none");
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div0);
      append_hydration(div2, t2);
      append_hydration(div2, div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div1, null);
      }
      if (!mounted) {
        dispose = listen(div0, "click", ctx[2]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 10) {
        each_value = ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div1, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & 1) {
        set_style(div2, "display", ctx2[0] ? "block" : "none");
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div2);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  const dispatcher = new createEventDispatcher();
  let { show = false } = $$props;
  let { btns = [] } = $$props;
  let { event = "" } = $$props;
  let { colors = [] } = $$props;
  function close() {
    $$invalidate(0, show = false);
  }
  function selectColor(btn) {
    dispatcher(event, btn);
    close();
  }
  const click_handler = (btn, event2) => selectColor(btn);
  $$self.$$set = ($$props2) => {
    if ("show" in $$props2)
      $$invalidate(0, show = $$props2.show);
    if ("btns" in $$props2)
      $$invalidate(1, btns = $$props2.btns);
    if ("event" in $$props2)
      $$invalidate(4, event = $$props2.event);
    if ("colors" in $$props2)
      $$invalidate(5, colors = $$props2.colors);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 32) {
      $$invalidate(1, btns = colors.map((color) => ({ color })).concat([{ text: "#", modal: true }]));
    }
  };
  return [show, btns, close, selectColor, event, colors, click_handler];
}
class EditorColorPicker extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { show: 0, btns: 1, event: 4, colors: 5 });
  }
}
const state = function(name) {
  let state2 = {
    actionBtns: [],
    actionObj: {}
  };
  const { subscribe, set, update } = writable(state2);
  return {
    name,
    set,
    update,
    subscribe
  };
};
const createStateStore = state;
var Editor_svelte_svelte_type_style_lang = "";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[38] = list[i];
  return child_ctx;
}
function create_each_block(ctx) {
  let button;
  let html_tag;
  let raw_value = ctx[38].icon + "";
  let t2;
  let button_class_value;
  let button_title_value;
  let button_disabled_value;
  let mounted;
  let dispose;
  function click_handler_1(...args) {
    return ctx[24](ctx[38], ...args);
  }
  return {
    c() {
      button = element("button");
      html_tag = new HtmlTagHydration(false);
      t2 = space();
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", { type: true, class: true, title: true });
      var button_nodes = children(button);
      html_tag = claim_html_tag(button_nodes, false);
      t2 = claim_space(button_nodes);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      html_tag.a = t2;
      attr(button, "type", "button");
      attr(button, "class", button_class_value = "cl-button " + (ctx[38].active ? "active" : "") + " svelte-11siz1e");
      attr(button, "title", button_title_value = ctx[38].title);
      button.disabled = button_disabled_value = ctx[38].disabled;
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      html_tag.m(raw_value, button);
      append_hydration(button, t2);
      if (!mounted) {
        dispose = listen(button, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 16 && raw_value !== (raw_value = ctx[38].icon + ""))
        html_tag.p(raw_value);
      if (dirty[0] & 16 && button_class_value !== (button_class_value = "cl-button " + (ctx[38].active ? "active" : "") + " svelte-11siz1e")) {
        attr(button, "class", button_class_value);
      }
      if (dirty[0] & 16 && button_title_value !== (button_title_value = ctx[38].title)) {
        attr(button, "title", button_title_value);
      }
      if (dirty[0] & 16 && button_disabled_value !== (button_disabled_value = ctx[38].disabled)) {
        button.disabled = button_disabled_value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$1(ctx) {
  let div2;
  let div0;
  let t0;
  let div1;
  let t1;
  let textarea;
  let t2;
  let editormodal;
  let t3;
  let editorcolorpicker;
  let current;
  let mounted;
  let dispose;
  let each_value = ctx[4].actionBtns;
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let editormodal_props = {};
  editormodal = new EditorModal({ props: editormodal_props });
  ctx[31](editormodal);
  let editorcolorpicker_props = { colors: ctx[2] };
  editorcolorpicker = new EditorColorPicker({ props: editorcolorpicker_props });
  ctx[32](editorcolorpicker);
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      div1 = element("div");
      t1 = space();
      textarea = element("textarea");
      t2 = space();
      create_component(editormodal.$$.fragment);
      t3 = space();
      create_component(editorcolorpicker.$$.fragment);
      this.h();
    },
    l(nodes) {
      div2 = claim_element(nodes, "DIV", { class: true });
      var div2_nodes = children(div2);
      div0 = claim_element(div2_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(div0_nodes);
      }
      div0_nodes.forEach(detach);
      t0 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", {
        id: true,
        class: true,
        style: true,
        contenteditable: true
      });
      children(div1).forEach(detach);
      t1 = claim_space(div2_nodes);
      textarea = claim_element(div2_nodes, "TEXTAREA", { class: true, style: true });
      children(textarea).forEach(detach);
      t2 = claim_space(div2_nodes);
      claim_component(editormodal.$$.fragment, div2_nodes);
      t3 = claim_space(div2_nodes);
      claim_component(editorcolorpicker.$$.fragment, div2_nodes);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "cl-actionbar svelte-11siz1e");
      attr(div1, "id", ctx[1]);
      attr(div1, "class", "cl-content svelte-11siz1e");
      set_style(div1, "height", ctx[0]);
      attr(div1, "contenteditable", "true");
      attr(textarea, "class", "cl-textarea svelte-11siz1e");
      set_style(textarea, "max-height", ctx[0]);
      set_style(textarea, "min-height", ctx[0]);
      attr(div2, "class", "cl svelte-11siz1e");
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div0, null);
      }
      append_hydration(div2, t0);
      append_hydration(div2, div1);
      ctx[25](div1);
      append_hydration(div2, t1);
      append_hydration(div2, textarea);
      ctx[30](textarea);
      append_hydration(div2, t2);
      mount_component(editormodal, div2, null);
      append_hydration(div2, t3);
      mount_component(editorcolorpicker, div2, null);
      ctx[33](div2);
      current = true;
      if (!mounted) {
        dispose = [
          listen(window, "click", ctx[23]),
          listen(div1, "input", ctx[26]),
          listen(div1, "mouseup", ctx[27]),
          listen(div1, "keyup", ctx[28]),
          listen(div1, "paste", ctx[29])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & 272) {
        each_value = ctx2[4].actionBtns;
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div0, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (!current || dirty[0] & 2) {
        attr(div1, "id", ctx2[1]);
      }
      if (!current || dirty[0] & 1) {
        set_style(div1, "height", ctx2[0]);
      }
      if (!current || dirty[0] & 1) {
        set_style(textarea, "max-height", ctx2[0]);
      }
      if (!current || dirty[0] & 1) {
        set_style(textarea, "min-height", ctx2[0]);
      }
      const editormodal_changes = {};
      editormodal.$set(editormodal_changes);
      const editorcolorpicker_changes = {};
      if (dirty[0] & 4)
        editorcolorpicker_changes.colors = ctx2[2];
      editorcolorpicker.$set(editorcolorpicker_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(editormodal.$$.fragment, local);
      transition_in(editorcolorpicker.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(editormodal.$$.fragment, local);
      transition_out(editorcolorpicker.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div2);
      destroy_each(each_blocks, detaching);
      ctx[25](null);
      ctx[30](null);
      ctx[31](null);
      destroy_component(editormodal);
      ctx[32](null);
      destroy_component(editorcolorpicker);
      ctx[33](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
const editors = [];
function instance$1($$self, $$props, $$invalidate) {
  let $references;
  let $helper;
  let $state;
  let dispatcher = new createEventDispatcher();
  let { actions = [] } = $$props;
  let { height = "300px" } = $$props;
  let { html = "" } = $$props;
  let { contentId = "" } = $$props;
  let { colors = [
    "#ffffff",
    "#000000",
    "#eeece1",
    "#1f497d",
    "#4f81bd",
    "#c0504d",
    "#9bbb59",
    "#8064a2",
    "#4bacc6",
    "#f79646",
    "#ffff00",
    "#f2f2f2",
    "#7f7f7f",
    "#ddd9c3",
    "#c6d9f0",
    "#dbe5f1",
    "#f2dcdb",
    "#ebf1dd",
    "#e5e0ec",
    "#dbeef3",
    "#fdeada",
    "#fff2ca",
    "#d8d8d8",
    "#595959",
    "#c4bd97",
    "#8db3e2",
    "#b8cce4",
    "#e5b9b7",
    "#d7e3bc",
    "#ccc1d9",
    "#b7dde8",
    "#fbd5b5",
    "#ffe694",
    "#bfbfbf",
    "#3f3f3f",
    "#938953",
    "#548dd4",
    "#95b3d7",
    "#d99694",
    "#c3d69b",
    "#b2a2c7",
    "#b7dde8",
    "#fac08f",
    "#f2c314",
    "#a5a5a5",
    "#262626",
    "#494429",
    "#17365d",
    "#366092",
    "#953734",
    "#76923c",
    "#5f497a",
    "#92cddc",
    "#e36c09",
    "#c09100",
    "#7f7f7f",
    "#0c0c0c",
    "#1d1b10",
    "#0f243e",
    "#244061",
    "#632423",
    "#4f6128",
    "#3f3151",
    "#31859b",
    "#974806",
    "#7f6000"
  ] } = $$props;
  let { removeFormatTags = ["h1", "h2", "blockquote"] } = $$props;
  let helper = writable({
    foreColor: false,
    backColor: false,
    foreColorModal: false,
    backColorModal: false,
    image: false,
    link: false,
    showEditor: true,
    blurActive: false
  });
  component_subscribe($$self, helper, (value) => $$invalidate(34, $helper = value));
  editors.push({});
  let contextKey = "editor_" + editors.length;
  let state2 = createStateStore(contextKey);
  component_subscribe($$self, state2, (value) => $$invalidate(4, $state = value));
  let references = writable({});
  component_subscribe($$self, references, (value) => $$invalidate(3, $references = value));
  set_store_value(state2, $state.actionObj = getNewActionObj(defaultActions, actions), $state);
  let context = {
    exec: exec$1,
    getHtml,
    getText,
    setHtml,
    saveRange: saveRange$1,
    restoreRange: restoreRange$1,
    helper,
    references,
    state: state2,
    removeFormatTags
  };
  setContext(contextKey, context);
  onMount(() => {
    set_store_value(state2, $state.actionBtns = getActionBtns($state.actionObj), $state);
    setHtml(html);
  });
  function _btnClicked(action) {
    $references.editor.focus();
    saveRange$1($references.editor);
    restoreRange$1($references.editor);
    action.result.call(context);
    _handleButtonStatus();
  }
  function _handleButtonStatus(clearBtns) {
    const tags = clearBtns ? [] : getTagsRecursive(document.getSelection().focusNode);
    Object.keys($state.actionObj).forEach((action) => set_store_value(state2, $state.actionObj[action].active = false, $state));
    tags.forEach((tag) => ($state.actionObj[tag.toLowerCase()] || {}).active = true);
    set_store_value(state2, $state.actionBtns = getActionBtns($state.actionObj), $state);
    state2.set($state);
  }
  function _onPaste(event) {
    event.preventDefault();
    exec$1("insertHTML", event.clipboardData.getData("text/html") ? cleanHtml(event.clipboardData.getData("text/html")) : event.clipboardData.getData("text"));
  }
  function _onChange(event) {
    dispatcher("change", event);
  }
  function _documentClick(event) {
    if (!isEditorClick(event.target, $references.editorWrapper) && $helper.blurActive) {
      dispatcher("blur", event);
    }
    set_store_value(helper, $helper.blurActive = true, $helper);
  }
  function exec$1(cmd, value) {
    exec(cmd, value);
  }
  function getHtml(sanitize) {
    return sanitize ? removeBadTags($references.editor.innerHTML) : $references.editor.innerHTML;
  }
  function getText() {
    return $references.editor.innerText;
  }
  function setHtml(html2, sanitize) {
    const htmlData = sanitize ? removeBadTags(html2) : html2 || "";
    set_store_value(references, $references.editor.innerHTML = htmlData, $references);
    set_store_value(references, $references.raw.value = htmlData, $references);
  }
  function saveRange$1() {
    saveRange($references.editor);
  }
  function restoreRange$1() {
    restoreRange($references.editor);
  }
  const refs = $references;
  const click_handler = (event) => _documentClick(event);
  const click_handler_1 = (action, event) => _btnClicked(action);
  function div1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      $references.editor = $$value;
      references.set($references);
    });
  }
  const input_handler = (event) => _onChange(event.target.innerHTML);
  const mouseup_handler = () => _handleButtonStatus();
  const keyup_handler = () => _handleButtonStatus();
  const paste_handler = (event) => _onPaste(event);
  function textarea_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      $references.raw = $$value;
      references.set($references);
    });
  }
  function editormodal_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      $references.modal = $$value;
      references.set($references);
    });
  }
  function editorcolorpicker_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      $references.colorPicker = $$value;
      references.set($references);
    });
  }
  function div2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      $references.editorWrapper = $$value;
      references.set($references);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("actions" in $$props2)
      $$invalidate(13, actions = $$props2.actions);
    if ("height" in $$props2)
      $$invalidate(0, height = $$props2.height);
    if ("html" in $$props2)
      $$invalidate(14, html = $$props2.html);
    if ("contentId" in $$props2)
      $$invalidate(1, contentId = $$props2.contentId);
    if ("colors" in $$props2)
      $$invalidate(2, colors = $$props2.colors);
    if ("removeFormatTags" in $$props2)
      $$invalidate(15, removeFormatTags = $$props2.removeFormatTags);
  };
  return [
    height,
    contentId,
    colors,
    $references,
    $state,
    helper,
    state2,
    references,
    _btnClicked,
    _handleButtonStatus,
    _onPaste,
    _onChange,
    _documentClick,
    actions,
    html,
    removeFormatTags,
    exec$1,
    getHtml,
    getText,
    setHtml,
    saveRange$1,
    restoreRange$1,
    refs,
    click_handler,
    click_handler_1,
    div1_binding,
    input_handler,
    mouseup_handler,
    keyup_handler,
    paste_handler,
    textarea_binding,
    editormodal_binding,
    editorcolorpicker_binding,
    div2_binding
  ];
}
class Editor extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      actions: 13,
      height: 0,
      html: 14,
      contentId: 1,
      colors: 2,
      removeFormatTags: 15,
      exec: 16,
      getHtml: 17,
      getText: 18,
      setHtml: 19,
      saveRange: 20,
      restoreRange: 21,
      refs: 22
    }, null, [-1, -1]);
  }
  get actions() {
    return this.$$.ctx[13];
  }
  set actions(actions) {
    this.$$set({ actions });
    flush();
  }
  get height() {
    return this.$$.ctx[0];
  }
  set height(height) {
    this.$$set({ height });
    flush();
  }
  get html() {
    return this.$$.ctx[14];
  }
  set html(html) {
    this.$$set({ html });
    flush();
  }
  get contentId() {
    return this.$$.ctx[1];
  }
  set contentId(contentId) {
    this.$$set({ contentId });
    flush();
  }
  get colors() {
    return this.$$.ctx[2];
  }
  set colors(colors) {
    this.$$set({ colors });
    flush();
  }
  get removeFormatTags() {
    return this.$$.ctx[15];
  }
  set removeFormatTags(removeFormatTags) {
    this.$$set({ removeFormatTags });
    flush();
  }
  get exec() {
    return this.$$.ctx[16];
  }
  get getHtml() {
    return this.$$.ctx[17];
  }
  get getText() {
    return this.$$.ctx[18];
  }
  get setHtml() {
    return this.$$.ctx[19];
  }
  get saveRange() {
    return this.$$.ctx[20];
  }
  get restoreRange() {
    return this.$$.ctx[21];
  }
  get refs() {
    return this.$$.ctx[22];
  }
}
function create_fragment(ctx) {
  let editor_1;
  let current;
  let editor_1_props = { html: ctx[0] };
  editor_1 = new Editor({ props: editor_1_props });
  ctx[2](editor_1);
  editor_1.$on("change", ctx[3]);
  return {
    c() {
      create_component(editor_1.$$.fragment);
    },
    l(nodes) {
      claim_component(editor_1.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(editor_1, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const editor_1_changes = {};
      if (dirty & 1)
        editor_1_changes.html = ctx2[0];
      editor_1.$set(editor_1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(editor_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(editor_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      ctx[2](null);
      destroy_component(editor_1, detaching);
    }
  };
}
const prerender = true;
function instance($$self, $$props, $$invalidate) {
  let html = "<h3>Hello</h3>";
  let editor;
  function editor_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      editor = $$value;
      $$invalidate(1, editor);
    });
  }
  const change_handler = (evt) => $$invalidate(0, html = evt.detail);
  return [html, editor, editor_1_binding, change_handler];
}
class Routes extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export { Routes as default, prerender };
//# sourceMappingURL=index.svelte-0c02e56a.js.map
