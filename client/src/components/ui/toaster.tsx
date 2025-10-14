import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-none">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-white dark:text-gray-900">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-gray-200 dark:text-gray-700">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white dark:text-gray-900" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
