# Primer flujo de uso
1. Iniciar sesión con Google, una vez configurado por el administrador.
2. Si no hay membresías, aceptar el código de invitación o registrar una institución nueva como representante.
3. El propietario crea y verifica un dominio DNS, registra al estudiante con su correo Google y crea una invitación de rol STUDENT. Invita también al docente con rol TEACHER.
4. Crear programa, curso, período y sección en Gestión académica. Asignar docente y matricular al estudiante.
5. Docente asignado crea una evaluación y guarda una nota como borrador o publicada. Puede registrar asistencia. El administrador configura horarios.
6. Estudiante acepta la invitación con el mismo correo y abre su portal: cursos, notas publicadas, asistencia y horario provienen de PostgreSQL.
7. Si tiene varias instituciones, el selector cambia el contexto. Todas las peticiones se vuelven a autorizar en NestJS.
8. Cerrar sesión revoca la sesión actual.
Las opciones sin datos muestran estados vacíos. No existen pagos, sincronizaciones externas ni métricas simuladas.
