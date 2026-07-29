const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * 1. Trigger Firestore onDocumentWritten sobre la colección 'usuarios/{userId}'
 * Se dispara automáticamente cuando un usuario se crea, edita o cambia su rol/empresaId en Firestore.
 * Sincroniza en tiempo real los Custom Claims en Firebase Auth.
 */
exports.syncUserCustomClaims = onDocumentWritten("usuarios/{userId}", async (event) => {
  const userId = event.params.userId;
  const snapshot = event.data;

  // Si el documento fue eliminado de Firestore, limpiar los claims
  if (!snapshot.after.exists) {
    console.log(`[Claims] Usuario ${userId} eliminado de Firestore. Limpiando custom claims...`);
    try {
      await admin.auth().setCustomUserClaims(userId, null);
    } catch (err) {
      console.error(`[Claims] Error al limpiar custom claims para ${userId}:`, err);
    }
    return;
  }

  const userData = snapshot.after.data();
  const empresaId = userData.empresaId || null;
  const rol = userData.rol || 'empleado';

  try {
    // Sincronizar Custom Claims de empresaId y rol en Firebase Auth
    await admin.auth().setCustomUserClaims(userId, {
      empresaId: empresaId,
      rol: rol,
      superadmin: rol === 'superadmin'
    });
    console.log(`[Claims] Custom Claims sincronizados exitosamente para ${userId}: empresaId=${empresaId}, rol=${rol}`);
  } catch (err) {
    console.error(`[Claims] Error al asignar custom claims para ${userId}:`, err);
  }
});

/**
 * 2. Cloud Function Callable: setUserCustomClaims
 * Invocable directamente desde el cliente por un SuperAdmin o Dueño para forzar actualización inmediata de claims.
 */
exports.setUserCustomClaims = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'El usuario debe estar autenticado para ejecutar esta función.');
  }

  const callerUid = request.auth.uid;
  const callerClaims = request.auth.token;

  // Verificar que el emisor sea superadmin o dueño
  const callerRecord = await admin.firestore().collection('usuarios').doc(callerUid).get();
  const callerData = callerRecord.exists ? callerRecord.data() : {};
  const callerRol = callerClaims.rol || callerData.rol;

  if (callerRol !== 'superadmin' && callerRol !== 'dueno') {
    throw new HttpsError('permission-denied', 'Solo administradores o dueños pueden asignar custom claims.');
  }

  const { targetUid, empresaId, rol } = request.data || {};
  if (!targetUid || !rol) {
    throw new HttpsError('invalid-argument', 'Se requieren los parámetros targetUid y rol.');
  }

  // Si es dueño (no superadmin), asegurar que solo gestione usuarios de su propia empresa
  if (callerRol === 'dueno') {
    const callerCompany = callerClaims.empresaId || callerData.empresaId;
    if (callerCompany !== empresaId) {
      throw new HttpsError('permission-denied', 'Un dueño solo puede asignar usuarios a su propia empresa.');
    }
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, {
      empresaId: empresaId || null,
      rol: rol,
      superadmin: rol === 'superadmin'
    });
    return { success: true, message: `Custom claims asignados correctamente a ${targetUid}` };
  } catch (err) {
    console.error(`[Claims] Error en setUserCustomClaims:`, err);
    throw new HttpsError('internal', err.message || 'Error interno al asignar custom claims.');
  }
});
