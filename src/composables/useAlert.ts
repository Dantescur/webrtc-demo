import { ref, nextTick } from "vue";

export function useAlert() {
  const error = ref("");
  const success = ref("");
  const timeoutId = ref<number | null>(null);

  const showAlert = (type: "error" | "success", message: string) => {
    if (timeoutId.value) clearTimeout(timeoutId.value);
    if (type === "error") {
      error.value = message;
      success.value = "";
    } else {
      success.value = message;
      error.value = "";
    }
    timeoutId.value = setTimeout(() => {
      error.value = "";
      success.value = "";
      timeoutId.value = null;
    }, 5000);
    nextTick(() => {
      const alertEl =
        type === "error"
          ? document.querySelector(".el-alert.is-error")
          : document.querySelector(".el-alert.is-success");
      if (alertEl) {
        alertEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  return { error, success, showAlert };
}
