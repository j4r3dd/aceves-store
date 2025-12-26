/**
 * Email Service using Resend
 * Handles all transactional emails for the Aceves Store
 */

import { Resend } from 'resend';

// Initialize Resend client
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is not set - email functionality will be disabled');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Aceves Joyería <noreply@acevesoficial.com>';

// Types
export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedSize?: string;
  }>;
  total: number;
  originalTotal?: number;
  couponDiscount?: number;
  userDiscount?: number;
  shippingAddress: {
    calle: string;
    colonia: string;
    ciudad: string;
    cp: string;
    pais: string;
  };
  trackingNumber?: string;
}

/**
 * Email Service Functions
 */
export const emailService = {
  /**
   * Send order confirmation email
   * Sent immediately after order is placed
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<any> {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - skipping order confirmation email');
      return null;
    }

    const itemsList = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            ${item.quantity}x ${item.name}${item.selectedSize ? ` <span style="color: #6b7280;">(Talla: ${item.selectedSize})</span>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            $${(item.price * item.quantity).toLocaleString()} MXN
          </td>
        </tr>
      `
      )
      .join('');

    const discountRows = [];
    if (data.couponDiscount && data.couponDiscount > 0) {
      discountRows.push(`
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #059669;">
            Descuento (cupón)
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669;">
            -$${data.couponDiscount.toLocaleString()} MXN
          </td>
        </tr>
      `);
    }
    if (data.userDiscount && data.userDiscount > 0) {
      discountRows.push(`
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #059669;">
            Descuento de usuario
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669;">
            -$${data.userDiscount.toLocaleString()} MXN
          </td>
        </tr>
      `);
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Pedido - Aceves Joyería</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #092536 0%, #1a4a6b 100%); color: #ffffff; padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">¡Gracias por tu compra!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu pedido ha sido confirmado</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        Hola <strong>${data.customerName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        Hemos recibido tu pedido y lo estamos preparando con mucho cuidado. Te notificaremos cuando sea enviado.
                      </p>

                      <!-- Order Number -->
                      <div style="background-color: #f3f4f6; border-left: 4px solid #092536; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Número de pedido</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">#${data.orderId}</p>
                      </div>

                      <!-- Order Items -->
                      <h2 style="margin: 30px 0 15px 0; font-size: 20px; font-weight: 600; color: #111827;">Detalles de tu pedido</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        ${itemsList}
                        ${data.originalTotal && (data.couponDiscount || data.userDiscount) ? `
                          <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                              Subtotal
                            </td>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                              $${data.originalTotal.toLocaleString()} MXN
                            </td>
                          </tr>
                        ` : ''}
                        ${discountRows.join('')}
                        <tr>
                          <td style="padding: 15px 10px; font-weight: 700; font-size: 18px; color: #111827;">
                            Total
                          </td>
                          <td style="padding: 15px 10px; font-weight: 700; font-size: 18px; color: #111827; text-align: right;">
                            $${data.total.toLocaleString()} MXN
                          </td>
                        </tr>
                      </table>

                      <!-- Shipping Address -->
                      <h2 style="margin: 30px 0 15px 0; font-size: 20px; font-weight: 600; color: #111827;">Dirección de envío</h2>
                      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                          ${data.shippingAddress.calle}<br>
                          ${data.shippingAddress.colonia}<br>
                          ${data.shippingAddress.ciudad}, ${data.shippingAddress.cp}<br>
                          ${data.shippingAddress.pais}
                        </p>
                      </div>

                      <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #111827;">Aceves Joyería</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">www.acevesoficial.com</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      const { data: result, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.customerEmail,
        subject: `✓ Confirmación de pedido #${data.orderId} - Aceves Joyería`,
        html,
      });

      if (error) {
        console.error('❌ Error sending order confirmation email:', error);
        throw error;
      }

      console.log('✅ Order confirmation email sent:', result?.id);
      return result;
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      throw error;
    }
  },

  /**
   * Send shipping notification email
   * Sent when order status changes to "shipped"
   */
  async sendShippingNotification(data: OrderEmailData): Promise<any> {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - skipping shipping notification email');
      return null;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tu pedido va en camino - Aceves Joyería</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🚚</div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">¡Tu pedido va en camino!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu joya está llegando pronto</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        Hola <strong>${data.customerName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        ¡Buenas noticias! Tu pedido <strong>#${data.orderId}</strong> ha sido enviado y está en camino.
                      </p>

                      ${data.trackingNumber ? `
                        <!-- Tracking Number -->
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">Número de rastreo</p>
                          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1e3a8a; font-family: 'Courier New', monospace; letter-spacing: 1px;">${data.trackingNumber}</p>
                        </div>
                      ` : ''}

                      <!-- Shipping Address -->
                      <h2 style="margin: 30px 0 15px 0; font-size: 18px; font-weight: 600; color: #111827;">Dirección de entrega</h2>
                      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                          ${data.shippingAddress.calle}<br>
                          ${data.shippingAddress.colonia}<br>
                          ${data.shippingAddress.ciudad}, ${data.shippingAddress.cp}<br>
                          ${data.shippingAddress.pais}
                        </p>
                      </div>

                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 6px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                          <strong>💡 Consejo:</strong> Asegúrate de que alguien esté disponible para recibir el paquete en la dirección indicada.
                        </p>
                      </div>

                      <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        ¡Gracias por confiar en Aceves Joyería!
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #111827;">Aceves Joyería</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">www.acevesoficial.com</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      const { data: result, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.customerEmail,
        subject: `🚚 Tu pedido #${data.orderId} ha sido enviado - Aceves Joyería`,
        html,
      });

      if (error) {
        console.error('❌ Error sending shipping notification email:', error);
        throw error;
      }

      console.log('✅ Shipping notification email sent:', result?.id);
      return result;
    } catch (error) {
      console.error('❌ Failed to send shipping notification email:', error);
      throw error;
    }
  },

  /**
   * Send welcome email
   * Sent when a new user registers
   */
  async sendWelcomeEmail(email: string, name: string): Promise<any> {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - skipping welcome email');
      return null;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Aceves Joyería</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">💎</div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">¡Bienvenido a Aceves Joyería!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu cuenta ha sido creada exitosamente</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        Hola <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        ¡Gracias por crear tu cuenta en Aceves Joyería! Estamos emocionados de tenerte como parte de nuestra familia.
                      </p>

                      <!-- Benefits -->
                      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #166534;">Ahora puedes disfrutar de:</h2>
                        <ul style="margin: 0; padding-left: 20px; color: #166534;">
                          <li style="margin-bottom: 10px; font-size: 15px; line-height: 1.5;">✓ Ver el historial completo de tus pedidos</li>
                          <li style="margin-bottom: 10px; font-size: 15px; line-height: 1.5;">✓ Guardar múltiples direcciones de envío</li>
                          <li style="margin-bottom: 10px; font-size: 15px; line-height: 1.5;">✓ Recibir descuentos exclusivos para clientes registrados</li>
                          <li style="margin-bottom: 10px; font-size: 15px; line-height: 1.5;">✓ Realizar compras más rápido con tus datos guardados</li>
                          <li style="margin-bottom: 0; font-size: 15px; line-height: 1.5;">✓ Acceder a ofertas especiales y preventa de nuevos productos</li>
                        </ul>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.acevesoficial.com/cuenta" style="display: inline-block; background: linear-gradient(135deg, #092536 0%, #1a4a6b 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Ir a Mi Cuenta
                        </a>
                      </div>

                      <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                        Si tienes alguna pregunta, estamos aquí para ayudarte. ¡Bienvenido!
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #111827;">Aceves Joyería</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">www.acevesoficial.com</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      const { data: result, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '💎 Bienvenido a Aceves Joyería',
        html,
      });

      if (error) {
        console.error('❌ Error sending welcome email:', error);
        throw error;
      }

      console.log('✅ Welcome email sent:', result?.id);
      return result;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't throw for welcome emails - they're nice-to-have
      return null;
    }
  },
};
