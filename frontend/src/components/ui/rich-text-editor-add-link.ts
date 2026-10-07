export function createAddLink(context: { editor: import("../../../node_modules/@tiptap/core/dist/index").Editor }) {
const { editor } = context;
function addLink() {
    const url = window.prompt("Link URL (https://…)");
    if (!url) return;
    if (url.trim() === "") editor?.chain().focus().unsetLink().run();
    else
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
  }
return addLink;
}
