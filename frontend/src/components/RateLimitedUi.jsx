import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react';

const RateLimitedUi = () => {
    return (
        <div className="max-w-6xl mx-auto px-[var(--space-4)] py-[var(--space-4)]">
            <div className="bg-[var(--accent-orange-subtle)] border border-[var(--accent-orange)] rounded-[var(--radius-md)] shadow-none">
                <div className="flex flex-col md:flex-row items-center p-[var(--space-4)] gap-[var(--space-4)]">

                    <div className="flex-shrink-0 flex items-center justify-center">
                        <AlertTriangle className="size-5 text-[var(--accent-orange)]" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-[length:var(--text-base)] font-[family:var(--font-mono)] font-[var(--weight-semibold)] text-[var(--accent-orange)] mb-[var(--space-1)]">
                            Processando Cartões
                        </h3>
                        <p className="font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-[var(--text-secondary)] leading-[var(--line-ui)]">
                            Você está criando muitos cartões ao mesmo tempo. Aguarde a sincronização.
                        </p>
                    </div>

                    <div className="flex items-center gap-[var(--space-2)] bg-[var(--bg-tertiary)] px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-sm)] border border-[var(--border-default)]">
                        <Loader2 className="animate-spin size-4 text-[var(--text-secondary)]" />
                        <span className="font-[family:var(--font-mono)] text-[length:var(--text-xs)] font-[var(--weight-medium)] uppercase text-[var(--text-secondary)] tracking-wider">
                            Salvando
                        </span>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default RateLimitedUi
