# Sistema de Gestión para Agencia Automotriz

Aplicación web full stack desarrollada como proyecto académico para administrar la información y operaciones principales de una agencia automotriz.

El sistema permite gestionar sucursales, personal, clientes y vehículos mediante operaciones CRUD, además de manejar procesos relacionados con el apartado y venta de automóviles.

## Tecnologías utilizadas

### Frontend
- Vue.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- API REST
- JSON

## Funcionalidades

- Gestión de sucursales
- Gestión de personal
- Gestión de clientes
- Gestión de vehículos
- Registro y edición de información
- Eliminación de registros
- Apartado de vehículos
- Venta de vehículos
- Validaciones y reglas de negocio
- Comunicación entre frontend y backend mediante API REST

## Estructura del proyecto

```text
agencia-automotriz/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── db.json
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md