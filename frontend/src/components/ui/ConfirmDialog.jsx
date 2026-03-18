import React from 'react'
import { Trash2Icon } from 'lucide-react'

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-[340px] mx-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_16px_48px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-red-subtle)]">
            <Trash2Icon className="size-4 text-[var(--accent-red)]" />
          </div>
          <h3 className="font-[family:var(--font-mono)] text-[length:var(--text-base)] font-[var(--weight-semibold)] text-[var(--text-primary)]">
            {title || 'Confirmar exclusão'}
          </h3>
        </div>

        <p className="font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-[var(--text-secondary)] leading-relaxed">
          {message || 'Esta ação não pode ser desfeita.'}
        </p>

        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={onCancel}
            className="px-4 h-[34px] rounded-[var(--radius-md)] font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 h-[34px] rounded-[var(--radius-md)] font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-white bg-[var(--accent-red)] hover:brightness-110 transition-all"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
