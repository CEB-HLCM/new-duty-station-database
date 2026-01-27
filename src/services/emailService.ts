// EmailJS service for submitting duty station requests via email
import emailjs from '@emailjs/browser';
import type { BasketItem, DutyStationRequest, SubmissionResult } from '../schemas/dutyStationSchema';
import type { RequestType } from '../types/request';
import type { Country } from '../types/dutyStation';
import { fetchCountries } from './dataService';

/**
 * EmailJS configuration - Using environment variables for security
 * Note: Public key, service ID, and template ID are safe to expose in client-side code
 * as per EmailJS design. Private key is used for additional verification.
 */
const EMAIL_CONFIG = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  privateKey: import.meta.env.VITE_EMAILJS_PRIVATE_KEY, // Used for additional security, not authentication
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
};

/**
 * Fixed chunk size for splitting requests into batches
 * Matches old codebase behavior: 15 requests per email
 */
const CHUNK_SIZE = 15;

/**
 * Delay between email sends (in milliseconds)
 * Matches old codebase: 2 second delay between batches
 */
const EMAIL_SEND_DELAY = 2000;

/**
 * Initialize EmailJS with public key
 * Throws error if required environment variables are not configured
 */
export const initializeEmailJS = (): void => {
  // Validate environment variables are loaded
  if (!EMAIL_CONFIG.publicKey || !EMAIL_CONFIG.serviceId || !EMAIL_CONFIG.templateId) {
    const missing = [];
    if (!EMAIL_CONFIG.publicKey) missing.push('VITE_EMAILJS_PUBLIC_KEY');
    if (!EMAIL_CONFIG.serviceId) missing.push('VITE_EMAILJS_SERVICE_ID');
    if (!EMAIL_CONFIG.templateId) missing.push('VITE_EMAILJS_TEMPLATE_ID');
    
    throw new Error(`EmailJS environment variables not configured: ${missing.join(', ')}. Set these in your .env file or deployment environment variables.`);
  }

  emailjs.init(EMAIL_CONFIG.publicKey);
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
 * Format requests as HTML table for email template {{{requests}}} placeholder
 * Uses new field names: CITY_CODE, COUNTRY_CODE, CITY_NAME, COUNTRY_NAME, REGION, LATITUDE, LONGITUDE, JUSTIFICATION
 */
const formatRequestsAsHtmlTable = (items: BasketItem[], countries: Country[]): string => {
  // Create country lookup map for country name and region
  const countryMap = new Map<string, { name: string; region: string }>();
  countries.forEach(country => {
    countryMap.set(country.COUNTRY_CODE, {
      name: country.COUNTRY_NAME,
      region: country.REGION || ''
    });
  });

  let emailTable = `<table style="border-collapse: collapse; width: 100%; height: 18px;" border="1">
    <tbody>
    <tr style="height: 18px;">
    <td style="width: 10%; height: 18px;"><strong>REQUEST_TYPE</strong></td>
    <td style="width: 10%; height: 18px;"><strong>CITY_CODE</strong></td>
    <td style="width: 10%; height: 18px;"><strong>COUNTRY_CODE</strong></td>
    <td style="width: 12%; height: 18px;"><strong>CITY_NAME</strong></td>
    <td style="width: 10%; height: 18px;"><strong>COUNTRY_NAME</strong></td>
    <td style="width: 8%; height: 18px;"><strong>REGION</strong></td>
    <td style="width: 8%; height: 18px;"><strong>LATITUDE</strong></td>
    <td style="width: 8%; height: 18px;"><strong>LONGITUDE</strong></td>
    <td style="width: 24%; height: 18px;"><strong>JUSTIFICATION</strong></td>
    </tr>`;

  items.forEach((item) => {
    const request = item.request;
    
    // Extract values based on request type
    let requestType = formatRequestType(request.requestType);
    let dsCode = '';
    let countryCode = '';
    let cityName = '';
    let countryName = '';
    let region = '';
    let latitude = '';
    let longitude = '';
    let justification = request.justification || '';

    switch (request.requestType) {
      case 'add':
        dsCode = ('proposedCode' in request && request.proposedCode) ? request.proposedCode : '';
        countryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        cityName = ('name' in request && request.name) ? request.name : '';
        // Get country name and region from countries data
        const addCountryInfo = countryMap.get(countryCode);
        countryName = addCountryInfo?.name || (('country' in request && request.country) ? request.country : '');
        region = addCountryInfo?.region || '';
        latitude = ('coordinates' in request && request.coordinates?.latitude !== undefined) 
          ? String(request.coordinates.latitude) : '';
        longitude = ('coordinates' in request && request.coordinates?.longitude !== undefined) 
          ? String(request.coordinates.longitude) : '';
        break;

      case 'update':
        dsCode = ('dutyStationCode' in request && request.dutyStationCode) ? request.dutyStationCode : '';
        countryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        cityName = ('proposedChanges' in request && request.proposedChanges?.name) 
          ? request.proposedChanges.name 
          : ('currentData' in request && request.currentData?.name) ? request.currentData.name : '';
        // Get country name and region from countries data
        const updateCountryInfo = countryMap.get(countryCode);
        countryName = updateCountryInfo?.name || (('currentData' in request && request.currentData?.country) ? request.currentData.country : '');
        region = updateCountryInfo?.region || '';
        // For updates, use proposed coordinates if available
        if ('proposedChanges' in request && request.proposedChanges?.coordinates) {
          latitude = String(request.proposedChanges.coordinates.latitude);
          longitude = String(request.proposedChanges.coordinates.longitude);
        } else if ('currentData' in request && request.currentData?.coordinates) {
          latitude = String(request.currentData.coordinates.latitude);
          longitude = String(request.currentData.coordinates.longitude);
        }
        break;

      case 'remove':
        dsCode = ('dutyStationCode' in request && request.dutyStationCode) ? request.dutyStationCode : '';
        countryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        cityName = ('currentData' in request && request.currentData?.name) ? request.currentData.name : '';
        // Get country name and region from countries data
        const removeCountryInfo = countryMap.get(countryCode);
        countryName = removeCountryInfo?.name || (('currentData' in request && request.currentData?.country) ? request.currentData.country : '');
        region = removeCountryInfo?.region || '';
        latitude = '';
        longitude = '';
        break;

      case 'coordinate_update':
        dsCode = ('dutyStationCode' in request && request.dutyStationCode) ? request.dutyStationCode : '';
        countryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        cityName = ('stationName' in request && request.stationName) ? request.stationName : '';
        // Get country name and region from countries data
        const coordCountryInfo = countryMap.get(countryCode);
        countryName = coordCountryInfo?.name || '';
        region = coordCountryInfo?.region || '';
        latitude = ('proposedCoordinates' in request && request.proposedCoordinates?.latitude !== undefined) 
          ? String(request.proposedCoordinates.latitude) : '';
        longitude = ('proposedCoordinates' in request && request.proposedCoordinates?.longitude !== undefined) 
          ? String(request.proposedCoordinates.longitude) : '';
        break;
    }

    emailTable += `<tr style="height: 18px;">
      <td style="width: 10%; height: 18px;">${requestType}</td>
      <td style="width: 10%; height: 18px;">${dsCode}</td>
      <td style="width: 10%; height: 18px;">${countryCode}</td>
      <td style="width: 12%; height: 18px;">${cityName}</td>
      <td style="width: 10%; height: 18px;">${countryName}</td>
      <td style="width: 8%; height: 18px;">${region}</td>
      <td style="width: 8%; height: 18px;">${latitude}</td>
      <td style="width: 8%; height: 18px;">${longitude}</td>
      <td style="width: 24%; height: 18px;">${justification}</td>
      </tr>`;
  });

  emailTable += `</tbody></table>`;
  
  // Remove newlines to match old codebase format
  return emailTable.replace(/(\r\n|\n|\r)/gm, '');
};

/**
 * Format requests as CSV rows for email template {{{json_snippet}}} placeholder
 * Includes CSV rows for ADD requests and instructions for other request types
 * Now includes JUSTIFICATION field
 */
const formatRequestsAsCsv = (items: BasketItem[], countries: Country[]): string => {
  // Create country lookup map for country name and region
  const countryMap = new Map<string, { name: string; region: string }>();
  countries.forEach(country => {
    countryMap.set(country.COUNTRY_CODE, {
      name: country.COUNTRY_NAME,
      region: country.REGION || ''
    });
  });
  const csvRows: string[] = [];
  const instructions: string[] = [];

  items.forEach((item) => {
    const request = item.request;
    const justification = request.justification || '';

    switch (request.requestType) {
      case 'add':
        // Format as CSV row: CITY_CODE,COUNTRY_CODE,CITY_NAME,COUNTRY_NAME,REGION,LATITUDE,LONGITUDE,COMMON_NAME,JUSTIFICATION
        const dsCode = ('proposedCode' in request && request.proposedCode) ? request.proposedCode : '';
        const countryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        const cityName = ('name' in request && request.name) ? request.name : '';
        const commonName = ('commonName' in request && request.commonName) ? request.commonName || '' : '';
        const lat = ('coordinates' in request && request.coordinates?.latitude !== undefined) 
          ? String(request.coordinates.latitude) : '';
        const lng = ('coordinates' in request && request.coordinates?.longitude !== undefined) 
          ? String(request.coordinates.longitude) : '';
        // Get country name and region from countries data
        const csvAddCountryInfo = countryMap.get(countryCode);
        const countryName = csvAddCountryInfo?.name || (('country' in request && request.country) ? request.country : '');
        const region = csvAddCountryInfo?.region || '';
        
        // CSV format: CITY_CODE,COUNTRY_CODE,CITY_NAME,COUNTRY_NAME,REGION,LATITUDE,LONGITUDE,COMMON_NAME,JUSTIFICATION
        csvRows.push(`${dsCode},${countryCode},"${cityName}","${countryName}",${region},${lat},${lng},"${commonName}","${justification}"`);
        break;

      case 'update':
        // Instructions for UPDATE requests
        const updateDsCode = ('dutyStationCode' in request && request.dutyStationCode) ? request.dutyStationCode : '';
        const updateCountryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        instructions.push(`UPDATE: Duty Station ${updateDsCode} (${updateCountryCode}) - See request details above for fields to update. JUSTIFICATION: ${justification}`);
        break;

      case 'remove':
        // Instructions for REMOVE requests
        const removeDsCode = ('dutyStationCode' in request && request.dutyStationCode) ? request.dutyStationCode : '';
        const removeCountryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        instructions.push(`REMOVE: Duty Station ${removeDsCode} (${removeCountryCode}) - Mark as OBSOLETE=1 in CSV. JUSTIFICATION: ${justification}`);
        break;

      case 'coordinate_update':
        // Instructions for COORDINATE_UPDATE requests
        const coordDsCode = ('dutyStationCode' in request && request.dutyStationCode) ? request.dutyStationCode : '';
        const coordCountryCode = ('countryCode' in request && request.countryCode) ? request.countryCode : '';
        const newLat = ('proposedCoordinates' in request && request.proposedCoordinates?.latitude !== undefined) 
          ? String(request.proposedCoordinates.latitude) : '';
        const newLng = ('proposedCoordinates' in request && request.proposedCoordinates?.longitude !== undefined) 
          ? String(request.proposedCoordinates.longitude) : '';
        instructions.push(`COORDINATE UPDATE: Duty Station ${coordDsCode} (${coordCountryCode}) - Update LATITUDE=${newLat}, LONGITUDE=${newLng}. JUSTIFICATION: ${justification}`);
        break;
    }
  });

  let csvSnippet = '';
  
  // Add CSV header (now includes JUSTIFICATION)
  if (csvRows.length > 0) {
    csvSnippet += 'CITY_CODE,COUNTRY_CODE,CITY_NAME,COUNTRY_NAME,REGION,LATITUDE,LONGITUDE,COMMON_NAME,JUSTIFICATION\n';
    csvSnippet += csvRows.join('\n');
  }

  // Add instructions for non-ADD requests
  if (instructions.length > 0) {
    if (csvSnippet) csvSnippet += '\n\n';
    csvSnippet += 'INSTRUCTIONS FOR OTHER REQUEST TYPES:\n';
    csvSnippet += instructions.join('\n');
  }

  // Format with HTML entities like old codebase (&#13; for newline, &#9; for tab)
  return csvSnippet
    .replace(/\r\n/g, '&#13;')
    .replace(/\n/g, '&#13;')
    .replace(/\r/g, '&#13;')
    .replace(/\t/g, '&#9;');
};


/**
 * Send single request via EmailJS
 */
export const sendSingleRequest = async (
  item: BasketItem
): Promise<{ success: boolean; error?: string }> => {
  // Validate configuration before sending
  if (!isEmailConfigured()) {
    return {
      success: false,
      error: 'Email service not configured. Please contact the administrator.',
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
 * Split items into chunks of fixed size (matches old codebase pattern)
 */
const splitIntoChunks = (items: BasketItem[]): BasketItem[][] => {
  if (items.length === 0) return [];
  
  const chunks: BasketItem[][] = [];
  
  // Split into chunks of CHUNK_SIZE (15 requests per email)
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }
  
  return chunks;
};

/**
 * Send a single batch email
 * Uses template variables matching old codebase: {{email}}, {{{requests}}}, {{{json_snippet}}}
 */
const sendSingleBatch = async (
  batch: BasketItem[],
  batchNumber: number,
  totalBatches: number,
  countries: Country[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate that all items in batch have email addresses
    const itemsWithoutEmail = batch.filter(item => !item.request.submittedBy || item.request.submittedBy.trim().length === 0);
    
    if (itemsWithoutEmail.length > 0) {
      console.error('[EmailJS] Found items without email addresses:', itemsWithoutEmail.map(item => ({
        id: item.id,
        requestType: item.request.requestType,
        email: item.request.submittedBy || '(empty)',
      })));
      
      return {
        success: false,
        error: `Batch ${batchNumber}/${totalBatches} contains ${itemsWithoutEmail.length} item(s) without email address. Please ensure all requests have a valid email address.`,
      };
    }
    
    // Get email address from first request (all requests in batch should have same submitter)
    const emailAddress = batch[0].request.submittedBy;
    
    // Verify all items have the same email address
    const allSameEmail = batch.every(item => item.request.submittedBy === emailAddress);
    if (!allSameEmail) {
      console.warn('[EmailJS] Warning: Batch contains requests from different submitters. Using first email:', emailAddress);
      console.warn('[EmailJS] Different emails found:', 
        Array.from(new Set(batch.map(item => item.request.submittedBy)))
      );
    }
    
    // Format requests as HTML table for {{{requests}}} placeholder
    const requestsTable = formatRequestsAsHtmlTable(batch, countries);
    
    // Format CSV rows for {{{json_snippet}}} placeholder
    const csvSnippet = formatRequestsAsCsv(batch, countries);

    // Template parameters matching old codebase format
    // EmailJS template expects: {{email}}, {{{requests}}}, {{{json_snippet}}}
    // Note: EmailJS variable names are case-sensitive and must match template exactly
    const templateParams = {
      email: emailAddress, // {{email}} - email address of the user (MUST match template variable name exactly)
      requests: requestsTable, // {{{requests}}} - HTML table with request details
      json_snippet: csvSnippet, // {{{json_snippet}}} - CSV rows formatted with HTML entities
    };

    // Debug: Template params prepared for email
    // console.debug('[EmailJS] Template params:', {
    //   email: emailAddress,
    //   emailLength: emailAddress.length,
    //   requestsLength: requestsTable.length,
    //   jsonSnippetLength: csvSnippet.length,
    //   batchNumber,
    //   totalBatches
    // });

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      return { success: true };
    } else {
      return {
        success: false,
        error: `Email send failed with status: ${response.status} (Batch ${batchNumber}/${totalBatches})`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error 
        ? `${error.message} (Batch ${batchNumber}/${totalBatches})`
        : `Unknown error occurred (Batch ${batchNumber}/${totalBatches})`,
    };
  }
};

/**
 * Send batch of requests via EmailJS
 * Automatically splits into chunks of 15 requests per email (matches old codebase)
 * Sends sequentially with 2 second delays between emails
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

  // Validate configuration before sending
  if (!isEmailConfigured()) {
    return {
      success: false,
      submittedAt: new Date(),
      errors: ['Email service not configured. Please contact the administrator.'],
    };
  }

  try {
    // Fetch countries data for country name and region lookups
    let countries: Country[] = [];
    try {
      countries = await fetchCountries();
      // Loaded countries for email formatting
    } catch (error) {
      console.warn('[EmailJS] Failed to fetch countries data, proceeding without country/region info:', error);
      // Continue without countries data - country/region will be empty
    }

    // Split into chunks of 15 (matches old codebase)
    const chunks = splitIntoChunks(items);
    const totalBatches = chunks.length;

    console.log(`[EmailJS] Sending ${items.length} requests in ${totalBatches} batch(es) (${CHUNK_SIZE} requests per batch)`);

    // Send batches sequentially with delays (matches old codebase pattern)
    const errors: string[] = [];
    let allSuccessful = true;

    for (let i = 0; i < chunks.length; i++) {
      const batch = chunks[i];
      const batchNumber = i + 1;
      
      console.log(`[EmailJS] Sending batch ${batchNumber}/${totalBatches} (${batch.length} requests)`);
      
      const result = await sendSingleBatch(batch, batchNumber, totalBatches, countries);
      
      if (!result.success) {
        allSuccessful = false;
        if (result.error) {
          errors.push(result.error);
        }
      }

      // Delay between batches (2 seconds, matches old codebase)
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, EMAIL_SEND_DELAY));
      }
    }

    if (allSuccessful) {
      return {
        success: true,
        submittedAt: new Date(),
      };
    } else {
      return {
        success: false,
        submittedAt: new Date(),
        errors: errors.length > 0 ? errors : ['Some batches failed to send'],
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
  mode: 'production' | 'simulation';
  details: {
    serviceId: string;
    templateId: string;
    publicKeyPrefix: string;
  };
} => {
  const isConfigured = isEmailConfigured();
  return {
    configured: isConfigured,
    serviceId: Boolean(EMAIL_CONFIG.serviceId),
    templateId: Boolean(EMAIL_CONFIG.templateId),
    publicKey: Boolean(EMAIL_CONFIG.publicKey),
    mode: isConfigured ? 'production' : 'simulation',
    details: {
      serviceId: EMAIL_CONFIG.serviceId,
      templateId: EMAIL_CONFIG.templateId,
      publicKeyPrefix: EMAIL_CONFIG.publicKey 
        ? `${EMAIL_CONFIG.publicKey.substring(0, 8)}...` 
        : '(not set)',
    },
  };
};

