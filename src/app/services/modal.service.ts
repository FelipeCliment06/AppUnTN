import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  message: string;
  type: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  visible = signal(false);
  config = signal<ModalConfig>({ message: '', type: 'alert' });

  private resolveRef: ((value: boolean) => void) | null = null;

  alert(message: string): Promise<void> {
    return new Promise(resolve => {
      this.config.set({ message, type: 'alert', confirmText: 'Aceptar' });
      this.visible.set(true);
      this.resolveRef = () => resolve();
    });
  }

  confirm(message: string, confirmText = 'Aceptar', cancelText = 'Cancelar'): Promise<boolean> {
    return new Promise(resolve => {
      this.config.set({ message, type: 'confirm', confirmText, cancelText });
      this.visible.set(true);
      this.resolveRef = resolve;
    });
  }

  accept(): void {
    this.visible.set(false);
    this.resolveRef?.(true);
    this.resolveRef = null;
  }

  cancel(): void {
    this.visible.set(false);
    this.resolveRef?.(false);
    this.resolveRef = null;
  }
}
