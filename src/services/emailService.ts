// EmailJS service for submitting duty station requests via email
import emailjs from '@emailjs/browser';
import type { BasketItem, DutyStationRequest, SubmissionResult } from '../schemas/dutyStationSchema';
import type { RequestType } from '../types/request';

/**
 * EmailJS configuration
 * These should be set in environment variables
 */
const EMAIL_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_un_duty_station',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_duty_station',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};

/**
 * Initialize EmailJS with public key
 */
export const initializeEmailJS = (): void => {
  if (EMAIL_CONFIG.publicKey) {
    emailjs.init(EMAIL_CONFIG.publicKey);
  } else {
    console.warn('EmailJS public key not configured. Email submission will be simulated.');
  }
};

/**
 * Format request type for email template
 */
const formatRequestType = (type: RequestType): string => {
  const typeMap: Record<RequestType, string> = {
    add: 'Add New Duty Station',
    update: 'Update Existing Duty Station',
    remove: 'Remove Duty Station',
    coordinate_update: 'Correct Duty Station Coordinates',
  };
  return typeMap[type] || type;
};

/**
 * Format request details for email body
 */
const formatRequestDetails = (request: DutyStationRequest): string => {
  const lines: string[] = [
    `Request Type: ${formatRequestType(request.requestType)}`,
    `Requested By: ${request.submittedBy}`,
    `Organization: ${request.organization}`,
    `Request Date: ${request.requestDate.toLocaleDateString()}`,
    '',
    'Request Details:',
  ];

  // Add type-specific details
  switch (request.requestType) {
    case 'add':
      if ('dsCode' in request && request.dsCode) {
        lines.push(`  Duty Station Code: ${request.dsCode}`);
      }
      if ('name' in request && request.name) {
        lines.push(`  Name: ${request.name}`);
      }
      if ('countryCode' in request && request.countryCode) {
        lines.push(`  Country Code: ${request.countryCode}`);
      }
      if ('countryName' in request && request.countryName) {
        lines.push(`  Country: ${request.countryName}`);
      }
      if ('commonName' in request && request.commonName) {
        lines.push(`  Common Name: ${request.commonName}`);
      }
      if ('latitude' in request && request.latitude !== undefined) {
        lines.push(`  Latitude: ${request.latitude}`);
      }
      if ('longitude' in request && request.longitude !== undefined) {
        lines.push(`  Longitude: ${request.longitude}`);
      }
      break;

    case 'update':
      if ('dsCode' in request && request.dsCode) {
        lines.push(`  Duty Station Code: ${request.dsCode}`);
      }
      if ('name' in request && request.name) {
        lines.push(`  New Name: ${request.name}`);
      }
      if ('countryCode' in request && request.countryCode) {
        lines.push(`  New Country Code: ${request.countryCode}`);
      }
      if ('commonName' in request && request.commonName) {
        lines.push(`  New Common Name: ${request.commonName}`);
      }
      break;

    case 'remove':
      if ('dsCode' in request && request.dsCode) {
        lines.push(`  Duty Station Code: ${request.dsCode}`);
      }
      if ('name' in request && request.name) {
        lines.push(`  Name: ${request.name}`);
      }
      break;

    case 'coordinate_update':
      if ('dsCode' in request && request.dsCode) {
        lines.push(`  Duty Station Code: ${request.dsCode}`);
      }
      if ('name' in request && request.name) {
        lines.push(`  Name: ${request.name}`);
      }
      if ('currentLatitude' in request && request.currentLatitude !== undefined) {
        lines.push(`  Current Latitude: ${request.currentLatitude}`);
      }
      if ('currentLongitude' in request && request.currentLongitude !== undefined) {
        lines.push(`  Current Longitude: ${request.currentLongitude}`);
      }
      if ('newLatitude' in request && request.newLatitude !== undefined) {
        lines.push(`  New Latitude: ${request.newLatitude}`);
      }
      if ('newLongitude' in request && request.newLongitude !== undefined) {
        lines.push(`  New Longitude: ${request.newLongitude}`);
      }
      break;
  }

  lines.push('');
  lines.push('Justification:');
  lines.push(request.justification);

  return lines.join('\n');
};

/**
 * Format multiple requests for batch submission
 */
const formatBatchRequestDetails = (items: BasketItem[]): string => {
  const lines: string[] = [
    `Total Requests: ${items.length}`,
    '',
    '═══════════════════════════════════════════════════',
    '',
  ];

  items.forEach((item, index) => {
    lines.push(`REQUEST ${index + 1} of ${items.length}:`);
    lines.push('');
    lines.push(formatRequestDetails(item.request));
    lines.push('');
    lines.push('═══════════════════════════════════════════════════');
    lines.push('');
  });

  return lines.join('\n');
};

/**
 * Generate summary statistics for batch submission
 */
const generateBatchSummary = (items: BasketItem[]): string => {
  const counts = {
    add: items.filter(i => i.request.requestType === 'add').length,
    update: items.filter(i => i.request.requestType === 'update').length,
    remove: items.filter(i => i.request.requestType === 'remove').length,
    coordinate_update: items.filter(i => i.request.requestType === 'coordinate_update').length,
  };

  const lines: string[] = [
    'Request Summary:',
    `  Total Requests: ${items.length}`,
  ];

  if (counts.add > 0) lines.push(`  - Add New Duty Station: ${counts.add}`);
  if (counts.update > 0) lines.push(`  - Update Existing Duty Station: ${counts.update}`);
  if (counts.remove > 0) lines.push(`  - Remove Duty Station: ${counts.remove}`);
  if (counts.coordinate_update > 0) lines.push(`  - Correct Coordinates: ${counts.coordinate_update}`);

  return lines.join('\n');
};

/**
 * Send single request via EmailJS
 */
export const sendSingleRequest = async (
  item: BasketItem
): Promise<{ success: boolean; confirmationId?: string; error?: string }> => {
  // If no public key configured, simulate email sending
  if (!EMAIL_CONFIG.publicKey) {
    console.log('[EmailJS Simulation] Would send email:', item);
    return {
      success: true,
      confirmationId: `SIM-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  try {
    const templateParams = {
      to_name: 'UN CEB Duty Station Team',
      from_name: item.request.submittedBy,
      organization: item.request.organization,
      request_type: formatRequestType(item.request.requestType),
      request_details: formatRequestDetails(item.request),
      request_date: item.request.requestDate.toLocaleDateString(),
      reply_to: '', // Could be added from form if needed
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      return {
        success: true,
        confirmationId: `EMAIL-${Date.now().toString(36).toUpperCase()}`,
      };
    } else {
      return {
        success: false,
        error: `Email send failed with status: ${response.status}`,
      };
    }
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Send batch of requests via EmailJS
 */
export const sendBatchRequests = async (
  items: BasketItem[]
): Promise<SubmissionResult> => {
  if (items.length === 0) {
    return {
      success: false,
      submittedAt: new Date(),
      errors: ['No items to submit'],
    };
  }

  // If no public key configured, simulate email sending
  if (!EMAIL_CONFIG.publicKey) {
    console.log('[EmailJS Simulation] Would send batch email with items:', items.length);
    return {
      success: true,
      submittedAt: new Date(),
      confirmationId: `BATCH-SIM-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  try {
    const templateParams = {
      to_name: 'UN CEB Duty Station Team',
      from_name: items[0]?.request.submittedBy || 'UN Staff Member',
      organization: items[0]?.request.organization || 'UN Organization',
      request_count: items.length,
      request_summary: generateBatchSummary(items),
      request_details: formatBatchRequestDetails(items),
      request_date: new Date().toLocaleDateString(),
      reply_to: '', // Could be added from form if needed
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      return {
        success: true,
        submittedAt: new Date(),
        confirmationId: `BATCH-${Date.now().toString(36).toUpperCase()}`,
      };
    } else {
      return {
        success: false,
        submittedAt: new Date(),
        errors: [`Email send failed with status: ${response.status}`],
      };
    }
  } catch (error) {
    console.error('Error sending batch email via EmailJS:', error);
    return {
      success: false,
      submittedAt: new Date(),
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
};

/**
 * Validate email configuration
 */
export const isEmailConfigured = (): boolean => {
  return Boolean(EMAIL_CONFIG.publicKey && EMAIL_CONFIG.serviceId && EMAIL_CONFIG.templateId);
};

/**
 * Get email configuration status for debugging
 */
export const getEmailConfigStatus = (): {
  configured: boolean;
  serviceId: boolean;
  templateId: boolean;
  publicKey: boolean;
} => {
  return {
    configured: isEmailConfigured(),
    serviceId: Boolean(EMAIL_CONFIG.serviceId),
    templateId: Boolean(EMAIL_CONFIG.templateId),
    publicKey: Boolean(EMAIL_CONFIG.publicKey),
  };
};

