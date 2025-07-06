<template>
  <div class="flex items-center justify-center min-h-screen py-12 px-6">
    <el-card
      shadow="hover"
      class="w-full max-w-2xl text-center border border-gray-700 bg-gray-850 rounded-2xl"
    >
      <div class="flex flex-col items-center justify-center gap-6 py-8">
        <el-icon :size="80" class="text-red-500">
          <WarningFilled />
        </el-icon>

        <div>
          <h1 class="text-4xl font-bold text-white mb-2">
            404 - Página no encontrada
          </h1>
          <p class="text-lg text-gray-400">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
        </div>

        <el-button type="primary" plain @click="goHome">
          Volver al inicio
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { WarningFilled } from "@element-plus/icons-vue";

const router = useRouter();

const goHome = () => {
  router.push({ name: "home" }); // Asegúrate de que esta ruta existe
};
</script>

<style scoped>
.bg-gray-850 {
  background-color: #1f1f1f;
}
</style>
