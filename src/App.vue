<template>
  <VaNavbar color="#282F69" class="h-24">
    <template #left>
      <VaNavbarItem class="logo">
        Boox Text Note Converter
      </VaNavbarItem>
    </template>
  </VaNavbar>

  <main class="p-3">
    <VaFileUpload v-model="noteFile" dropzone file-types="note,zip" />
    <div class="row content-pane">
      <div class="flex flex-col md6">
        <VaCard class="item content">
          <VaCardTitle>Preview</VaCardTitle>
          <VaCardContent v-html="previewOutput"></VaCardContent>
        </VaCard>
        <!-- <div class="item content">
          <VueJsonView v-if="contentFile" :src="contentFile.content"></VueJsonView>
<pre>{{ previewOutput }}</pre>
          <div v-html="previewOutput"></div>
        </div> -->
      </div>
      <div class="flex flex-col md6">

        <VaCard class="item content">
          <VaCardTitle>Generated</VaCardTitle>
          <VaCardContent>

          <pre>{{ markdownOutput }}</pre>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import * as zip from "@zip.js/zip.js";
import VueJsonView from '@matpool/vue-json-view'
import MarkdownRenderer from './renderers/markdown';
import PreviewRenderer from './renderers/preview';
import MarkdownIt from "markdown-it";

const noteFile = ref([]);
const files = ref([]);
const readerClient = ref(null);

const readZipFilelist = async () => {
  const entries = await readerClient.value.getEntries({});
  if (entries && entries.length) {
    const resources = entries.filter((e) => {
      return e.filename.includes("/resource/data/") && !e.filename.endsWith("/")
    })
    files.value = await Promise.all(resources.map(async (e) => {
      var writer = e.filename.endsWith(".html") ? new zip.TextWriter() : new zip.BlobWriter();
      var content = await e.getData(writer);
      if (e.filename.endsWith(".html")) {
        content = JSON.parse(content);
      }
      return {
        name: e.filename,
        entry: e,
        content: content,
      }

    }));
    console.log(files.value)
  } else {
    files.value = [];
  }
};


const contentFile = computed(() => {
  return files.value.find((f) => f.name.endsWith(".html"));
});

const markdownOutput = ref('');
const previewOutput = ref('');

watch(contentFile, (newVal) => {
  if (newVal) {
    const renderer = new MarkdownRenderer(newVal.content, files.value);
    renderer.render().then((output) => {
      markdownOutput.value = output;
    });
    const previewRenderer = new PreviewRenderer(newVal.content, files.value);
    previewRenderer.render().then((output) => {
      const markdown = new MarkdownIt();
      previewOutput.value = markdown.render(output);
    });
  }
});



watch(noteFile, async (newVal) => {
  readerClient.value = new zip.ZipReader(new zip.BlobReader(newVal[0]));
  await readZipFilelist();
});

</script>

<style lang="scss" scoped>
main {
  padding: 20px;

  .content-pane {
    margin-top: 20px;

    .content {
      padding-right: 10px;
    }
  }

  .item {
    margin: 20px;
  }

  ::v-deep img {
    max-width: 80%;
    height: auto;
    margin: 20px;
  }

  ::v-deep ul {
    list-style-type: disc;
    padding-left: 20px;
  }

  ::v-deep ol {
    list-style-type: decimal;
    padding-left: 20px;
  }

  ::v-deep h1 {
    font-size: 2em;
  }

  ::v-deep h2 {
    font-size: 1.5em;
  }

  ::v-deep h3 {
    font-size: 1.17em;
  }

  pre {
    white-space: pre-wrap;
  }
}
</style>
