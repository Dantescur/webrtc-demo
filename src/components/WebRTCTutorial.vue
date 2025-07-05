<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="emit('close')"
    :fullscreen="breakpoints.isSmaller('md')"
    width="600px"
    class="custom-wizard-dialog"
    :close-on-click-modal="false"
    center
  >
    <!-- Step content -->
    <transition name="fade" mode="out-in">
      <div :key="activeStep" class="step-content p-4">
        <h2 ref="activeTitle" class="text-xl font-bold text-white mb-2">
          {{ sections[activeStep].title }}
        </h2>
        <div class="space-y-4">
          <div
            v-for="(entry, idx) in sections[activeStep].entries"
            :key="idx"
            class="flex items-start gap-3"
          >
            <div class="p-2 bg-blue-500/20 rounded-lg">
              <el-icon class="text-blue-400">
                <component :is="entry.icon" />
              </el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-white text-base mb-1">
                {{ entry.title }}
              </h3>
              <p class="text-sm text-gray-300" v-html="entry.description"></p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-between items-center">
        <el-button
          plain
          :disabled="activeStep === 0"
          @click="activeStep--"
          size="small"
        >
          Anterior
        </el-button>
        <el-button plain size="small" @click="emit('close')">
          Cerrar
        </el-button>
        <el-button
          type="primary"
          :disabled="activeStep === sections.length - 1"
          @click="activeStep++"
          size="small"
        >
          Siguiente
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import { useBreakpoints } from "@vueuse/core";
import type { Component } from "vue";
import { useStreamerTutorialSections } from "@/composables/useTutorial";

export interface TutorialSection {
  title: string;
  entries: {
    icon: Component;
    title: string;
    description: string;
  }[];
}

const sections = useStreamerTutorialSections();

defineProps<{
  modelValue: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const activeTitle = useTemplateRef("activeTitle");

watch(activeTitle, (newTitle) => {
  newTitle?.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "start",
  });
});

const activeStep = ref(0);
const breakpoints = useBreakpoints({ sm: 640, md: 768 });
</script>

<style scoped>
.custom-wizard-dialog :deep(.el-dialog) {
  overflow: hidden;
  max-width: 100vw;
}

.step-content {
  max-width: 100%;
  overflow-x: hidden;
}

.step-content :deep(p),
.step-content :deep(h1),
.step-content :deep(h2),
.step-content :deep(h3),
.step-content :deep(h4),
.step-content :deep(h5),
.step-content :deep(h6),
.step-content :deep(ul),
.step-content :deep(ol),
.step-content :deep(li),
.step-content :deep(blockquote) {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.step-content :deep(pre),
.step-content :deep(code),
.step-content :deep(.hljs) {
  max-width: 100%;
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #111827;
  font-size: 0.875rem;
  color: #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

.step-content :deep(pre)::-webkit-scrollbar {
  height: 6px;
}
.step-content :deep(pre)::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
