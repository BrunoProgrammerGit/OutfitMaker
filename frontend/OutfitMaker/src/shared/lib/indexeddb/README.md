# IndexedDB para silueta corporal

Este módulo guarda la silueta del usuario en IndexedDB mediante un store dedicado `user-silhouette`.

## Reglas implementadas
- El contenido se cifra localmente con Web Crypto API usando AES-GCM.
- La clave de derivación se obtiene a partir de una semilla local del usuario y una sal guardada únicamente en el dispositivo.
- La imagen nunca se envía al backend ni se registra en logs o analítica.
- La operación de cifrado/desencriptado se ejecuta en un Web Worker.
- Se intenta `navigator.storage.persist()` al guardar y, si el navegador no lo permite, se puede disparar un flujo de recaptura.
