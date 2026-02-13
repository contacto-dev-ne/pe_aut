import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // IMPORTANTE: El nombre aquí debe coincidir con el nombre de tu repositorio en GitHub
    base: '/pe_aut/',
})
