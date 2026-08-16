import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3500) => {
    const toast: ToastItem = {
      id: nextId++,
      message,
      type,
      duration,
    }

    toasts.value.push(toast)

    if (duration > 0) {
      window.setTimeout(() => removeToast(toast.id), duration)
    }
  }

  const dismiss = (id: number) => removeToast(id)

  return {
    toasts,
    show,
    dismiss,
    success: (message: string, duration = 3500) => show(message, 'success', duration),
    error: (message: string, duration = 4000) => show(message, 'error', duration),
    info: (message: string, duration = 3500) => show(message, 'info', duration),
  }
}

export default useToast
