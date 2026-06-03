import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        packages: resolve(__dirname, 'pages/packages.html'),
        reservation: resolve(__dirname, 'pages/reservation.html'),
        checkReservation: resolve(__dirname, 'pages/check-reservation.html'),
        area: resolve(__dirname, 'pages/area.html'),
      },
    },
  },
})
