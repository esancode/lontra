import React from 'react'
import { FileIcon } from 'lucide-react'

const NotesNotFound = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-[50vh] px-4 text-center select-none pointer-events-none'>
            <FileIcon strokeWidth={1} className='size-12 text-[var(--text-muted)] opacity-20 mb-3' />
            <p className='font-[family:var(--font-ui)] text-[13px] text-[var(--text-muted)] opacity-40'>
                Vazio
            </p>
        </div>
    )
}

export default NotesNotFound
