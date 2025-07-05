<template>
  <div class="animate-fade-in">
    <!-- Seccion de Header -->
    <div class="text-center mb-16 pt-8">
      <h1
        class="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
      >
        Demo Educativo de WebRTC
      </h1>
      <p class="text-xl text-gray-300 max-w-xl mx-auto leading-relaxed">
        Explora la tecnología peer-to-peer con tours guiados y explicaciones
        detalladas de cada paso del proceso.
      </p>
      <div class="mt-8 flex justify-center space-x-4">
        <el-button
          type="primary"
          size="large"
          round
          @click="showHelpDialog = true"
        >
          <el-icon class="mr-2">
            <QuestionFilled />
          </el-icon>
          Comenzar Tour Educativo
        </el-button>
      </div>
    </div>

    <!-- Cards -->
    <el-row :gutter="24" class="mb-12">
      <el-col
        v-for="(card, index) in cards"
        :key="index"
        :span="24"
        :md="12"
        class="mb-6"
      >
        <el-card
          shadow="hover"
          class="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl transition-all hover:shadow-xl hover:border-blue-400/30 hover:scale-[1.02]"
          :body-style="{ padding: '24px' }"
        >
          <div class="flex items-center mb-4">
            <div
              class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-3"
            >
              <el-icon :size="28" class="text-blue-400">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <h2 class="text-2xl font-semibold mb-2 text-gray-100">
              {{ card.title }}
            </h2>
            <el-tooltip :content="card.tooltip" placement="top">
              <el-button
                :icon="InfoFilled"
                circle
                plain
                size="small"
                class="ml-auto text-gray-400 hover:text-blue-400"
                :aria-label="`Más información sobre ${card.title}`"
                @click="showFeatureExplanation(card.title)"
              />
            </el-tooltip>
          </div>
          <p class="text-gray-300 mb-6 leading-relaxed">
            {{ card.description }}
          </p>
          <el-button
            type="primary"
            size="large"
            class="w-full font-medium tracking-wide py-2 rounded-xl hover:shadow-lg"
            :loading="loading && activeCard === index"
            @click="navigateTo(card.route, index)"
          >
            {{ card.buttonText }}
            <el-icon class="ml-2">
              <ArrowRight />
            </el-icon>
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- Seccion educativa -->
    <div class="max-w-4xl mx-auto mt-20 mb-16">
      <h2 class="text-3xl font-bold text-center mb-12 text-gray-100">
        Recursos Educativos
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="text-center p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-blue-400/30 transition-all"
        >
          <div
            class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <el-icon :size="28" class="text-blue-400">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-100">
            {{ feature.title }}
          </h3>
          <p class="text-gray-400">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- Guia instructiva -->
    <el-dialog
      v-model="showHelpDialog"
      title="Guía Educativa de WebRTC"
      :fullscreen="breakpoints.isSmaller('md')"
      :close-on-click-modal="false"
      :lock-scroll="false"
      center
      class="custom-dialog"
      width="800px"
    >
      <div class="space-y-6">
        <h3 class="text-xl font-semibold text-gray-100 mb-4">
          Bienvenido al Demo Educativo de WebRTC
        </h3>
        <p class="text-gray-300 mb-6">
          Este demo está diseñado para enseñarte los conceptos fundamentales de
          WebRTC a través de una experiencia práctica. Cada sección incluye:
        </p>

        <div
          v-for="(item, index) in helpItems"
          :key="index"
          class="flex items-start bg-gray-800/50 p-4 rounded-lg"
        >
          <div
            class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-3"
          >
            <el-icon :size="20" class="text-purple-400">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-100 mb-2">
              {{ item.title }}
            </h3>
            <p class="text-gray-400">{{ item.description }}</p>
            <ul
              v-if="item.steps"
              class="mt-2 text-gray-400 list-disc pl-5 space-y-1"
            >
              <li v-for="(step, stepIndex) in item.steps" :key="stepIndex">
                {{ step }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="text-center">
          <el-button
            type="primary"
            size="default"
            @click="showHelpDialog = false"
            class="px-8"
          >
            Comenzar Exploración
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialogo de explicacion -->
    <el-dialog
      v-model="showFeatureDialog"
      :title="currentFeatureTitle"
      width="600px"
      center
      :lock-scroll="false"
    >
      <div v-html="currentFeatureContent"></div>
      <template #footer>
        <el-button type="primary" @click="showFeatureDialog = false">
          Entendido
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useBreakpoints } from "@vueuse/core";
import {
  QuestionFilled,
  InfoFilled,
  VideoCamera,
  Monitor,
  Connection,
  Lock,
  ArrowRight,
  Guide,
} from "@element-plus/icons-vue";

const router = useRouter();
const breakpoints = useBreakpoints({ sm: 640, md: 768 });

const showHelpDialog = ref(false);
const showFeatureDialog = ref(false);
const currentFeatureTitle = ref("");
const currentFeatureContent = ref("");
const loading = ref(false);
const activeCard = ref<number | null>(null);

type FeatureKey =
  | "Conexión P2P"
  | "Seguridad en WebRTC"
  | "Modo Transmisor"
  | "Modo Espectador";

const showFeatureExplanation = (feature: string) => {
  currentFeatureTitle.value = feature;
  const featureKey = feature as FeatureKey;
  currentFeatureContent.value =
    featureExplanations[featureKey] ||
    `<p class="text-gray-300">Explicación no disponible.</p>`;

  showFeatureDialog.value = true;
};

const cards = [
  {
    icon: VideoCamera,
    title: "Modo Transmisor",
    description:
      "Aprende cómo compartir tu pantalla mediante WebRTC, con explicaciones paso a paso sobre el proceso de negociación y conexión P2P.",
    tooltip: "Ver explicación detallada del modo transmisor",
    route: "/stream",
    buttonText: "Explorar Transmisión",
  },
  {
    icon: Monitor,
    title: "Modo Espectador",
    description:
      "Descubre cómo funciona la recepción de transmisiones WebRTC, incluyendo el intercambio de SDP y candidatos ICE.",
    tooltip: "Ver explicación detallada del modo espectador",
    route: "/live",
    buttonText: "Explorar Recepción",
  },
];

const features = [
  {
    icon: Guide,
    title: "Tours Guiados",
    description:
      "Recorridos interactivos que explican cada componente del proceso WebRTC.",
    action: () => {
      showHelpDialog.value = true;
    },
  },
  {
    icon: Connection,
    title: "Conexión P2P",
    description:
      "Explicación detallada del establecimiento de conexión directa entre navegadores.",
    action: () => showFeatureExplanation("Conexión P2P"),
  },
  {
    icon: Lock,
    title: "Seguridad",
    description:
      "Cómo WebRTC implementa cifrado de extremo a extremo para proteger tus datos.",
    action: () => showFeatureExplanation("Seguridad en WebRTC"),
  },
];

const helpItems = [
  {
    icon: VideoCamera,
    title: "Transmisión Paso a Paso",
    description:
      "El demo te guía a través de cada etapa del proceso de transmisión:",
    steps: [
      "Obtención de permisos para compartir pantalla",
      "Creación de la oferta SDP",
      "Intercambio de candidatos ICE",
      "Establecimiento de la conexión P2P",
    ],
  },
  {
    icon: Monitor,
    title: "Recepción con Explicaciones",
    description: "Al recibir una transmisión, el demo explica:",
    steps: [
      "Cómo procesar la oferta SDP recibida",
      "Generación de la respuesta SDP",
      "Manejo de los flujos de medios",
      "Optimización para diferentes condiciones de red",
    ],
  },
  {
    icon: Connection,
    title: "Visualización de Estados",
    description:
      "El demo muestra información en tiempo real sobre el estado de la conexión, incluyendo señales de negociación y métricas de red.",
  },
  {
    icon: Lock,
    title: "Componentes Educativos",
    description:
      "Cada pantalla incluye explicaciones contextuales, diagramas de flujo y referencias a la especificación WebRTC.",
  },
];

const featureExplanations: Record<FeatureKey, string> = {
  "Conexión P2P": `
    <div class="text-gray-300 space-y-4">
      <p>WebRTC utiliza varios protocolos para establecer conexiones directas entre navegadores:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>ICE (Interactive Connectivity Establishment):</strong> Encuentra la mejor ruta para conectar los peers</li>
        <li><strong>STUN:</strong> Descubre la dirección IP pública y puertos disponibles</li>
        <li><strong>TURN:</strong> Actúa como retransmisor cuando la conexión directa falla</li>
      </ul>
      <p class="mt-4">Este demo muestra visualmente cada etapa del proceso ICE.</p>
    </div>
  `,
  "Seguridad en WebRTC": `
    <div class="text-gray-300 space-y-4">
      <p>WebRTC implementa múltiples medidas de seguridad:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Cifrado obligatorio:</strong> Todo el tráfico usa DTLS-SRTP</li>
        <li><strong>Verificación de identidad:</strong> Certificados DTLS generados por cada peer</li>
        <li><strong>Protección contra MITM:</strong> Fingerprints de certificados en los mensajes SDP</li>
      </ul>
      <p class="mt-4">El demo explica cómo se aplican estas medidas durante la conexión.</p>
    </div>
  `,
  "Modo Transmisor": `
    <div class="text-gray-300 space-y-4">
      <p>Como transmisor, aprenderás sobre:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Obtención de streams de medios con getDisplayMedia()</li>
        <li>Creación de RTCPeerConnection y configuración</li>
        <li>Generación de ofertas SDP</li>
        <li>Manejo de candidatos ICE</li>
      </ul>
      <p class="mt-4">El tour guiado explica cada paso con ejemplos de código relevante.</p>
    </div>
  `,
  "Modo Espectador": `
    <div class="text-gray-300 space-y-4">
      <p>Como espectador, aprenderás sobre:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Procesamiento de ofertas SDP recibidas</li>
        <li>Generación de respuestas SDP</li>
        <li>Manejo de eventos ontrack para recibir streams</li>
        <li>Optimización de la reproducción</li>
      </ul>
      <p class="mt-4">El demo incluye visualizaciones del estado de la conexión en tiempo real.</p>
    </div>
  `,
};

const navigateTo = async (route: string, index: number | null) => {
  loading.value = true;
  if (index !== null) activeCard.value = index;
  await new Promise((resolve) => setTimeout(resolve, 500));
  router.push(route);
  activeCard.value = null;
  loading.value = false;
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::v-deep(.el-dialog.is-fullscreen) {
  height: auto;
}

::v-deep(.custom-dialog .el-dialog__body) {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  padding: 1.5rem;
  color: #d1d5db;
}

::v-deep(.custom-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-right: 0;
}
</style>
