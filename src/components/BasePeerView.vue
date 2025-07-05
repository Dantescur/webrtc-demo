<template>
  <div class="animate-fade-in">
    <!-- Alerts -->
    <div class="fixed top-4 left-0 right-0 z-50 max-w-4xl mx-auto px-4">
      <transition name="el-zoom-in-top">
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          center
          show-icon
          closable
          class="mb-2 shadow-lg"
        />
      </transition>
      <transition name="el-zoom-in-top">
        <el-alert
          v-if="success"
          :title="success"
          type="success"
          center
          show-icon
          closable
          class="mb-2 shadow-lg"
        />
      </transition>
    </div>

    <!-- Header Section -->
    <div class="text-center mb-4 md:mb-8 pt-8 md:pt-16 px-4">
      <h1
        class="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
      >
        {{ title }}
      </h1>
      <p
        class="text-base md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
      >
        {{ description }}
      </p>
      <el-tooltip :content="helpTooltip" placement="top">
        <el-button
          id="help-btn"
          :icon="QuestionFilled"
          circle
          plain
          type="info"
          class="mt-4 md:mt-6"
          @click="showHelpDialog = true"
        />
      </el-tooltip>
    </div>

    <!-- Slots -->
    <div
      v-if="$slots.controls"
      class="text-center mb-4 md:mb-8 flex flex-col sm:flex-row justify-center gap-3 px-4"
    >
      <slot name="controls"></slot>
    </div>

    <!-- Main Content -->
    <el-row :gutter="24" class="mb-8 px-4">
      <!-- Video Column -->
      <el-col :span="24" :md="12" class="mb-6">
        <el-card
          shadow="hover"
          class="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl transition-all hover:shadow-xl hover:border-blue-400/30"
          :body-style="{ padding: '16px' }"
        >
          <div class="flex flex-wrap items-center mb-4 gap-2">
            <div
              class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-3"
            >
              <el-icon :size="24" class="text-blue-400">
                <Monitor />
              </el-icon>
            </div>
            <h2 class="text-xl font-semibold text-gray-100 flex-grow">
              {{ videoTitle }}
            </h2>
            <slot name="statusTag"></slot>
          </div>

          <div
            class="video-container relative w-full aspect-video bg-black rounded-xl overflow-hidden"
          >
            <slot name="videoContent"></slot>
          </div>
        </el-card>
      </el-col>

      <!-- Connection Column -->
      <el-col :span="24" :md="12" class="mb-6">
        <el-card
          shadow="hover"
          class="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl transition-all hover:shadow-xl hover:border-purple-400/30"
          :body-style="{ padding: '16px' }"
        >
          <div class="flex items-center mb-4">
            <div
              class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-3"
            >
              <el-icon :size="24" class="text-purple-400">
                <Connection />
              </el-icon>
            </div>
            <h2 class="text-xl font-semibold text-gray-100">
              Configuración de Conexión
            </h2>
          </div>

          <slot name="connectionContent"></slot>
        </el-card>
      </el-col>
    </el-row>

    <!-- Help Dialog -->
    <WebRTCTutorial
      v-model="showHelpDialog"
      :title="helpDialogTitle"
      @close="showHelpDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QuestionFilled, Monitor, Connection } from "@element-plus/icons-vue";
import WebRTCTutorial from "./WebRTCTutorial.vue";

const helpDialogTitle = ref("Ayuda y detalles a saber sobre WebRTC");

defineProps<{
  title: string;
  description: string;
  videoTitle: string;
  helpTooltip: string;
  error: string;
  success: string;
}>();

const showHelpDialog = ref(false);
</script>
