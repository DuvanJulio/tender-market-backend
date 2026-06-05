# Pedidos y WhatsApp (sin pasarela de pago)

## Flujo acordado

1. El **tendero** realiza el pedido en la app (sin pago en línea).
2. El **proveedor** ve el pedido en estado *Pendiente*.
3. Al pulsar **Confirmar** → estado *Procesando*:
   - Notificación in-app al tendero.
   - Enlace **wa.me** con mensaje prellenado al teléfono del tendero.
4. El proveedor abre WhatsApp, revisa el mensaje y pulsa **Enviar** desde su número.

También se genera enlace al marcar **Enviado** o **Rechazar** (mensajes distintos).

## Requisitos

- El tendero debe tener **teléfono válido** en su perfil (registro / datos de tienda).
- Formato Colombia: celular de 10 dígitos (ej. `3001234567`) o con prefijo `57`.

## Envío automático (futuro)

Para que el mensaje salga **sin** que el proveedor abra WhatsApp, hace falta **WhatsApp Business API** (Meta Cloud API, Twilio, etc.): verificación de negocio, plantillas aprobadas y costo por mensaje. El enlace `wa.me` es la opción recomendada para MVP.

## Texto de confirmación (ejemplo)

Incluye código de pedido, total, dirección y que el **pago se coordina al recibir** (efectivo o transferencia).
