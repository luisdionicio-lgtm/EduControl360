# Google OAuth — pendiente de credenciales reales
1. Crear proyecto propio en Google Cloud Console.
2. Configurar Google Auth Platform: marca, audiencia y acceso de prueba. Para desarrollo usar usuarios de prueba autorizados.
3. Crear cliente OAuth de tipo aplicación web.
4. Origen local: http://localhost:3000
5. URI de retorno exacta: http://localhost:3000/api/auth/callback/google
6. Configurar D:\\educontrol360\\.env: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET y AUTH_URL. La instalación inicial admite NEXTAUTH_SECRET y NEXTAUTH_URL como alias de Auth.js v4; el código prefiere AUTH_SECRET.
7. Copiar .env a apps/web/.env.local y reiniciar ambos servidores. En Docker reconstruir/recrear web con el entorno actualizado.
8. Probar inicio, rechazo de correo no verificado, cambio de institución, cierre de sesión y expiración con cuentas reales.
Scopes iniciales: openid email profile. No se solicitan Classroom, Drive, Gmail ni Calendar durante el login.
No guardar secretos en Git, capturas, tickets ni chat. .env.example contiene únicamente marcadores.
## Verificación institucional
En Gestión académica / Accesos y dominio crear un desafío. Publicar un registro TXT con el nombre y valor mostrados y pulsar Comprobar DNS. Requiere acceso real al DNS institucional. No hay endpoint para marcar un dominio como verificado manualmente.
## Estado honesto
El flujo OIDC está implementado y compila. NO se ha verificado con Google: el usuario indicó que no dispone de credenciales. Las identidades y el DNS simulado de las pruebas pertenecen solo a fixtures aislados; no son un login Google ni una verificación DNS reales.
Fuentes: [Auth.js OAuth](https://next-auth.js.org/configuration/providers/oauth), [Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect).
