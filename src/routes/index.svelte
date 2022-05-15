<script>
	import Editor from '$lib/Editor.svelte';
	let html = '<h3>Hello</h3>';
	let editor;
</script>

<Editor {html} on:change={(evt) => (html = evt.detail)} bind:this={editor} />

<style>
	.cl-content {
		/* resize: both; */
	}
</style>
