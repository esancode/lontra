import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2Icon } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDanger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  title, 
  description, 
  confirmLabel, 
  onConfirm, 
  onCancel,
  isDanger = true
}) => {

  return (
    <AnimatePresence>
    {isOpen && (
    <motion.div 
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
        onClick={onCancel}
      />
      <motion.div 
        className="relative w-full max-w-[340px] mx-4 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_24px_64px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] ${isDanger ? 'bg-[var(--accent-red-subtle)]' : 'bg-[var(--accent-blue-subtle)]'}`}>
            <Trash2Icon className={`size-4 ${isDanger ? 'text-[var(--accent-red)]' : 'text-[var(--accent-blue)]'}`} />
          </div>
          <h3 className="font-[family:var(--font-mono)] text-[length:var(--text-base)] font-[var(--weight-semibold)] text-[var(--text-primary)]">
            {title || 'Confirmar ação'}
          </h3>
        </div>

        <p className="font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-[var(--text-secondary)] leading-relaxed">
          {description || 'Esta ação não pode ser desfeita.'}
        </p>

        <div className="flex gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 h-[34px] rounded-[var(--radius-md)] font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 h-[34px] rounded-[var(--radius-md)] font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-white transition-all ${isDanger ? 'bg-[var(--accent-red)] hover:brightness-110' : 'bg-[var(--accent-blue)] hover:brightness-110'}`}
          >
            {confirmLabel || 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
