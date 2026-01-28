/**
 * Notification System
 * 
 * Provides real-time feedback for async blockchain operations.
 * Critical for UX - users need to know what's happening.
 */

import { useState, useCallback, useEffect } from 'preact/hooks';
import { createContext, FunctionalComponent } from 'preact';
import { useContext } from 'preact/hooks';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: FunctionalComponent = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// ============= NOTIFICATION CONTAINER =============

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: FunctionalComponent<NotificationContainerProps> = ({ 
  notifications, 
  onRemove 
}) => {
  if (notifications.length === 0) return null;

  return (
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationToast 
          key={notification.id} 
          notification={notification} 
          onRemove={() => onRemove(notification.id)} 
        />
      ))}
    </div>
  );
};

// ============= NOTIFICATION TOAST =============

interface NotificationToastProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationToast: FunctionalComponent<NotificationToastProps> = ({ 
  notification, 
  onRemove 
}) => {
  const { type, title, message, action } = notification;

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200',
  };

  const iconStyles = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div 
      class={`p-4 rounded-lg border shadow-lg animate-slideInRight ${typeStyles[type]}`}
      role="alert"
    >
      <div class="flex items-start gap-3">
        <span class="text-xl">{iconStyles[type]}</span>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm">{title}</h4>
          <p class="text-sm mt-1 opacity-90">{message}</p>
          
          {action && (
            <button
              onClick={action.onClick}
              class="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={onRemove}
          class="text-lg opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ============= CONVENIENCE HOOKS =============

export function useTransactionNotifications() {
  const { addNotification } = useNotifications();

  const notifySubmitted = useCallback((txSignature: string) => {
    addNotification({
      type: 'info',
      title: 'Transaction Submitted',
      message: 'Waiting for blockchain confirmation...',
      duration: 10000,
    });
  }, [addNotification]);

  const notifyConfirmed = useCallback((txSignature: string, description?: string) => {
    addNotification({
      type: 'success',
      title: 'Transaction Confirmed',
      message: description || 'Your transaction has been confirmed on-chain.',
      duration: 8000,
      action: {
        label: 'View on Solscan',
        onClick: () => window.open(`https://solscan.io/tx/${txSignature}`, '_blank'),
      },
    });
  }, [addNotification]);

  const notifyFailed = useCallback((error: string) => {
    addNotification({
      type: 'error',
      title: 'Transaction Failed',
      message: error,
      duration: 10000,
    });
  }, [addNotification]);

  const notifyReward = useCallback((amount: number, activity: string) => {
    addNotification({
      type: 'success',
      title: '🎉 Reward Earned!',
      message: `You earned ${amount} DBC for ${activity}`,
      duration: 8000,
    });
  }, [addNotification]);

  return {
    notifySubmitted,
    notifyConfirmed,
    notifyFailed,
    notifyReward,
  };
}

export default NotificationProvider;
