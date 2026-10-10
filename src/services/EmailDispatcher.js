import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = '@safechain_trusted_contacts';

export class EmailDispatcher {
  static async sendEmergencyAlerts(incidentId, dashboardBaseUrl) {
    try {
      console.log('[EMAIL] Dispatching silent alert for:', incidentId);

      const rawContacts = await AsyncStorage.getItem(CONTACTS_KEY);
      if (!rawContacts) {
        console.warn('[EMAIL] No contacts saved in local storage.');
        return;
      }

      const contacts = JSON.parse(rawContacts);
      if (!Array.isArray(contacts) || contacts.length === 0) {
        console.warn('[EMAIL] Contacts array is empty.');
        return;
      }

      // Read both .email and .phone in case an email was saved in either field
      const recipientEmails = contacts
        .map(c => {
          if (typeof c === 'string') return c;
          return c.email || c.phone;
        })
        .filter(entry => typeof entry === 'string' && entry.includes('@'));

      if (recipientEmails.length === 0) {
        console.warn('[EMAIL] No valid recipient email address found in contacts.');
        return;
      }

      console.log(`[EMAIL] Target recipients: ${recipientEmails.join(', ')}`);

      // Covert fire-and-forget fetch to Vercel
      fetch(`${dashboardBaseUrl}/api/send-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmails,
          incidentId,
          dashboardUrl: dashboardBaseUrl,
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('[EMAIL] Success response:', data);
        })
        .catch(err => {
          console.warn('[EMAIL] Network dispatch error:', err);
        });
    } catch (err) {
      console.warn('[EMAIL] Dispatcher error:', err);
    }
  }
}