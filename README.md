# Daintree E-Commerce 
### Hackathon 2026 | Instituto Tecnológico de Tijuana | SOREDI Web3 [

**Daintree** es una plataforma de comercio electrónico diseñada para un rendimiento óptimo en hardware de bajo consumo, como la **Raspberry Pi 4**[cite: 44, 45]. [cite_start]El proyecto fue desarrollado por el equipo **Binary** bajo la carrera de Ingeniería en Sistemas Computacionales[cite: 9, 20, 46].

---

##Integrantes del Equipo: BINARY
* **Prina Meredith Fonseca Novelo** — MerelyMeredith 
***Luis Alberto Castro Roldán** — Luis Roldán2004 
* **América Fernanda Nevarez de la Cruz** — AméricaNC 
* **Karla Itzel Vázquez Cruz** — Xitzel 

---

## Stack Tecnológico
La selección de herramientas se basó en la necesidad de minimizar el uso de recursos y garantizar una latencia inferior a **1ms** en red local[cite: 44, 45].

| Capa | Tecnología | ]Propósito y Justificación |
| :--- | :--- | :--- |
| **Infraestructura** | **Raspberry Pi 4** | Servidor principal para montar el ecosistema del proyecto. |
| **Servidor Web** | **Nginx** | Entrega archivos estáticos desde RAM y protege el backend. |
| **Base de Datos** | **MariaDB** | Elegida por su compatibilidad con procesadores ARM. |
| **Backend** | **Fastify (Node.js)** | Framework con mínima sobrecarga para flujos masivos. |
| **ORM** | **Prisma** | Garantiza la integridad de la base de datos relacional. |
| **Frontend** | **Next.js** | Interfaces de carga instantánea y sesiones seguras. |
| **Estilos** | **Tailwind CSS** | Diseño *mobile-first* con archivos ligeros. |

---

##  Arquitectura de Base de Datos
El sistema utiliza **MariaDB** gestionada a través de **Prisma ORM**, estructurada en **8 tablas principales**:

1.  **User**: Identidad, email, password y rol de los usuarios.
2.  **Category**: Clasificación de productos (relación uno a muchos).
3.  **Product**: Información detallada (precio, stock, imagen) y soporte para *soft delete*.
4.  **Shipping_Method**: Opciones de envío, precios y días estimados.
5.  **Order**: Transacciones finalizadas vinculadas a un usuario y método de envío.
6.  **Order_Item**: Desglose detallado de productos por cada orden.
7.  **Cart**: Carrito de compras persistente asociado 1:1 con un usuario.
8.  **Cart_Item**: Productos añadidos temporalmente al carrito antes del checkout

---

## Instalación y Desarrollo
Este proyecto es una aplicación **Next.js** inicializada con `create-next-app`.

### Primeros pasos
1.  **Instalar pnpm** (si no está disponible):
    ```bash
    npm -g i pnpm
    ```
2.  **Ejecutar el servidor de desarrollo**:
    ```bash
    pnpm dev
    ```
3.  **Acceso**: Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Uso de Inteligencia Artificial
Se implementó **Gemini Pro 3.1** para asistir en el desarrollo de software y resolver problemáticas técnicas. Las tareas incluyeron:
* Asistencia en la instalación de servidores (MariaDB, Nginx, Prisma) en Raspberry Pi.
* Generación de componentes reutilizables como la **SearchBar** y **TopBar**.
* Lógica para la navegación global y validación de credenciales.

---

## Bibliografía y Enlaces
* **Repositorio Backend**: [GitHub - Daintree API](https://github.com/MerelyMeredith/daintree-e-commerce/blob/db/docs/API.md) 
* **Repositorio Frontend**: [GitHub - Daintree Webfront](https://github.com/MerelyMeredith/daintree-e-commerce/blob/main/Webfront/README.md) 
* **Registro de Prompts**: [Google Sheets - Binary Prompts](https://docs.google.com/spreadsheets/d/1Ense2rjWySitk1HpKLFP9uye4rKqgvDdPcnlUul7R51/edit) 
* **Configuración de Hardware**: [BlinkGalaxy Hackathon Setup](https://blinkgalaxy.com/hackathon/setup)
