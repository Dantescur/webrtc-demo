<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Botón flotante -->
    <el-button
      circle
      class="shadow-lg w-10 h-10 sm:w-8 sm:h-8"
      :class="{ 'animate-pulse-ring': shouldPulse }"
      @click="togglePanel"
    >
      <el-icon>
        <component :is="isOpen ? 'Close' : 'Connection'" />
      </el-icon>
    </el-button>
  </div>

  <!-- Drawer de logs -->

  <el-drawer
    v-model="isOpen"
    :direction="drawerDirection"
    :size="drawerSize"
    :modal="true"
    :append-to-body="true"
    :before-close="handleClose"
    class="z-50"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <span class="text-sm font-medium">WebRTC Connection Logs</span>
        <div class="flex gap-2">
          <el-button size="small" text @click="clearLogs" :icon="Delete"
            >Limpiar</el-button
          >
          <el-button
            size="small"
            text
            @click="toggleAutoScroll"
            :icon="autoScroll ? 'ArrowUp' : 'Minus'"
            :type="autoScroll ? 'primary' : 'info'"
          >
            Auto-scroll
          </el-button>
        </div>
      </div>
    </template>

    <!-- Contenido de logs -->
    <div
      ref="logContainer"
      class="max-h-[60vh] overflow-y-auto bg-gray-900 text-gray-100 p-2 font-mono text-xs"
      @scroll="handleScroll"
    >
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="mb-1 last:mb-0 border-l-4 pl-2 py-1"
        :class="{
          'border-red-500': log.level === 'error',
          'border-yellow-500': log.level === 'warn',
          'border-blue-500': log.level === 'info',
          'border-gray-500': log.level === 'debug',
        }"
      >
        <div class="flex justify-between text-gray-400">
          <span>{{ formatTime(log.timestamp) }}</span>
          <span class="capitalize ml-2">{{ log.level }}</span>
        </div>
        <div class="text-gray-100 mt-1">{{ log.message }}</div>
        <el-collapse-transition>
          <div v-if="log.data" class="mt-1">
            <el-button
              size="small"
              text
              @click="toggleExpand(log.id)"
              class="text-xxs p-0 h-auto"
            >
              {{ expandedLogs.includes(log.id) ? "Ocultar" : "Mostrar" }}
              detalles
            </el-button>
            <pre
              v-show="expandedLogs.includes(log.id)"
              class="bg-gray-800 p-1 rounded mt-1 overflow-x-auto text-xxs"
              >{{ formatData(log.data) }}</pre
            >
          </div>
        </el-collapse-transition>
      </div>

      <div
        v-if="filteredLogs.length === 0"
        class="text-center text-gray-500 py-4"
      >
        No hay logs disponibles
      </div>
    </div>

    <div class="bg-gray-800 px-3 py-1 flex justify-between items-center mt-2">
      <el-tag size="small" :type="logCountType">
        {{ filteredLogs.length }} logs
      </el-tag>
      <div class="flex gap-2">
        <el-tag
          v-for="level in logLevels"
          :key="level"
          size="small"
          :type="getTagType(level)"
          class="cursor-pointer"
          @click="toggleFilterLevel(level)"
          :effect="filterLevel === level ? 'dark' : 'plain'"
        >
          {{ level }}: {{ levelCounts[level] }}
        </el-tag>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { Delete } from "@element-plus/icons-vue";
import { useWebRTCLogger } from "@/composables/useWebRTCLogger";
import type { LogLevel } from "@/shared";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const { logs, clearLogs: clearAllLogs } = useWebRTCLogger();
const isOpen = ref(false);
const autoScroll = ref(true);
const logContainer = ref<HTMLElement>();
const expandedLogs = ref<string[]>([]);
const filterLevel = ref<LogLevel | null>(null);
const userScrolledDown = ref(false);
const lastPanelCloseTime = ref<number>(Date.now());

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("sm");

const drawerDirection = computed(() => (isMobile.value ? "btt" : "rtl"));
const drawerSize = computed(() => (isMobile.value ? "60%" : "30%"));

const shouldPulse = computed(() => {
  if (isOpen.value) return false;
  return logs.value.some(
    (log) => log.timestamp.getTime() > lastPanelCloseTime.value,
  );
});

const togglePanel = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && autoScroll.value) {
    nextTick(() => scrollToTop());
  }
};

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value;
  if (autoScroll.value) {
    nextTick(() => scrollToTop());
  }
};

const toggleFilterLevel = (level: LogLevel) => {
  filterLevel.value = filterLevel.value === level ? null : level;
  if (autoScroll.value) {
    nextTick(() => scrollToTop());
  }
};

const toggleExpand = (id: string) => {
  if (expandedLogs.value.includes(id)) {
    expandedLogs.value = expandedLogs.value.filter((logId) => logId !== id);
  } else {
    expandedLogs.value.push(id);
  }
  if (autoScroll.value) {
    nextTick(() => scrollToTop());
  }
};

const clearLogs = () => {
  clearAllLogs();
  expandedLogs.value = [];
  if (autoScroll.value) {
    nextTick(() => scrollToTop());
  }
};

const handleClose = () => {
  isOpen.value = false;
  lastPanelCloseTime.value = Date.now();
};

const formatTime = (date: Date) => {
  return (
    date.toLocaleTimeString() +
    "." +
    date.getMilliseconds().toString().padStart(3, "0")
  );
};

const formatData = (data: any) => {
  try {
    if (typeof data === "string") return data;
    return JSON.stringify(data, null, 2);
  } catch {
    return "[Non-serializable data]";
  }
};

const filteredLogs = computed(() => {
  if (!filterLevel.value) return logs.value;
  return logs.value.filter((log) => log.level === filterLevel.value);
});

const levelCounts = computed(() => {
  return logs.value.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    },
    {} as Record<LogLevel, number>,
  );
});

const logCountType = computed(() => {
  if (levelCounts.value.error > 0) return "danger";
  if (levelCounts.value.warn > 0) return "warning";
  return "info";
});

const logLevels = ["error", "warn", "info", "debug"] as const;

const getTagType = (level: LogLevel) => {
  switch (level) {
    case "error":
      return "danger";
    case "warn":
      return "warning";
    case "info":
      return "primary";
    default:
      return "info";
  }
};

const scrollToTop = () => {
  if (logContainer.value) {
    logContainer.value.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    userScrolledDown.value = false;
  }
};

const handleScroll = () => {
  if (!logContainer.value) return;

  const { scrollTop } = logContainer.value;
  const isAtTop = scrollTop < 5;

  userScrolledDown.value = !isAtTop;

  // Reactivar auto-scroll si el usuario está en la parte superior
  if (isAtTop && !autoScroll.value) {
    autoScroll.value = true;
  }
};

// Observar cambios en los logs y filteredLogs
watch(
  [logs, filteredLogs],
  () => {
    if (autoScroll.value && !userScrolledDown.value && isOpen.value) {
      nextTick(() => scrollToTop());
    }
  },
  { deep: true },
);

// Scroll al abrir el panel
watch(isOpen, (open) => {
  if (open && autoScroll.value) {
    nextTick(() => scrollToTop());
  }
  if (!open) {
    lastPanelCloseTime.value = Date.now();
  }
});

// Observar cambios en expandedLogs para mantener el scroll
watch(expandedLogs, () => {
  if (autoScroll.value && !userScrolledDown.value && isOpen.value) {
    nextTick(() => scrollToTop());
  }
});
</script>

<style scoped>
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.animate-pulse-ring {
  animation: pulse-ring 1.5s infinite;
  border-color: #3b82f6;
}

:deep(.el-drawer__body) {
  padding: 0;
  background-color: #111827; /* bg-gray-900 */
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  line-height: 1.3;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  background-color: rgba(31, 41, 55, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-collapse-transition) {
  transition: all 0.2s ease-in-out;
}
</style>
