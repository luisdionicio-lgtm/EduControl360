# Demo funcional · Campus Atelier
## Abrir
[Demo local](http://localhost:3010/demo). Perfiles de Lucía (estudiante), Diego (docente) y Valeria (administradora). Datos ficticios en PostgreSQL exclusivo.
En PowerShell desde D:\educontrol360: `pnpm demo`.
El comando genera .env.demo con secretos aleatorios, construye imágenes, levanta PostgreSQL/Redis, aplica migraciones, inicializa datos una sola vez y levanta web/API. Repetir preserva cambios.
## Recorrido
1. Entrar como estudiante: tres cursos, promedio parcial ponderado por notas publicadas y créditos, asistencia, agenda semanal interactiva, horario y notas.
2. Cambiar a docente: evaluaciones y notas; seleccionar matrícula y evaluación del mismo curso; publicar nota.
3. Volver al estudiante y consultar la nota persistida.
4. Entrar como administradora: crear programa, curso, período, sección; registrar estudiante, matricular, asignar docente y horario.
5. Cambiar institución para comprobar el contexto y los datos de Academia Prisma.
6. Cerrar sesión revoca la sesión persistida.
## Aislamiento
Compose educontrol360-demo con volúmenes separados; web 3010, API 4020, PostgreSQL 54339 y Redis 63809. Solo loopback.
Cookies educontrol.demo.* separadas de las normales. Proveedor credentials explícito solo con APP_ENV=demo, DEMO_MODE=true, instancia válida y NEXTAUTH_URL local. No existe en el entorno normal. Cualquier visitante local de esta demo puede elegir los tres perfiles: no publicarla en Internet.
La marca de dominio precargada solo habilita probar invitaciones en la base ficticia. No acredita DNS real.
## Verificar
`pnpm verify`: cinco pruebas de métricas/activación demo más diez de integración.
`pnpm test:e2e`: servidores aislados para entorno normal.
`pnpm test:demo`: navegador contra Docker, acceso real de los tres perfiles, cookies separadas, publicación y lectura de nota, creación de programa, calendario, móvil, aislamiento y CSRF.
El test restaura la nota modificada y elimina el programa de prueba.
## Detener
`docker compose --env-file .env.demo -f docker-compose.demo.yml down` conserva los datos. No usar -v salvo que se quiera borrar exclusivamente la base ficticia.
## Alcance
Funciona el núcleo académico implementado. Google real, DNS institucional, finanzas, Workspace, Gemini, comunicaciones y módulos futuros permanecen pendientes según STATUS.md. Esta demo no representa las siete fases terminadas.
