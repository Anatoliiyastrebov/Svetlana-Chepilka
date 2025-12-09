import { QuestionnaireSection, QuestionnaireType } from './questionnaire-data';
import { Language, translations } from './translations';

export interface FormData {
  [key: string]: string | string[];
}

export interface FormAdditionalData {
  [key: string]: string;
}

export interface ContactData {
  telegram?: string;
  instagram?: string;
  phone?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface SubmittedData {
  messageId: number;
  timestamp: number;
  name: string;
  contactInfo: string;
  type: QuestionnaireType;
}

// Storage keys
const getStorageKey = (type: QuestionnaireType, lang: Language) => 
  `health_questionnaire_${type}_${lang}`;

const getSubmittedDataKey = () => 'health_questionnaire_submitted';

// Save form data to localStorage
export const saveFormData = (
  type: QuestionnaireType,
  lang: Language,
  formData: FormData,
  additionalData: FormAdditionalData,
  contactData: ContactData
) => {
  try {
    const data = { formData, additionalData, contactData, timestamp: Date.now() };
    localStorage.setItem(getStorageKey(type, lang), JSON.stringify(data));
  } catch (err) {
    console.error('Error saving form data:', err);
  }
};

// Load form data from localStorage
export const loadFormData = (type: QuestionnaireType, lang: Language) => {
  try {
    const stored = localStorage.getItem(getStorageKey(type, lang));
    if (stored) {
      const data = JSON.parse(stored);
      // Only return if data is less than 24 hours old
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return {
          formData: data.formData as FormData,
          additionalData: data.additionalData as FormAdditionalData,
          contactData: data.contactData as ContactData,
        };
      }
    }
  } catch (err) {
    console.error('Error loading form data:', err);
  }
  return null;
};

// Clear form data from localStorage
export const clearFormData = (type: QuestionnaireType, lang: Language) => {
  try {
    localStorage.removeItem(getStorageKey(type, lang));
  } catch (err) {
    console.error('Error clearing form data:', err);
  }
};

// Save submitted data with message_id for deletion requests
export const saveSubmittedData = (data: SubmittedData) => {
  try {
    const existing = getSubmittedDataList();
    existing.push(data);
    localStorage.setItem(getSubmittedDataKey(), JSON.stringify(existing));
  } catch (err) {
    console.error('Error saving submitted data:', err);
  }
};

// Get list of submitted data
export const getSubmittedDataList = (): SubmittedData[] => {
  try {
    const stored = localStorage.getItem(getSubmittedDataKey());
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading submitted data:', err);
    return [];
  }
};

// Delete submitted data by message_id
export const deleteSubmittedData = (messageId: number) => {
  try {
    const existing = getSubmittedDataList();
    const filtered = existing.filter(item => item.messageId !== messageId);
    localStorage.setItem(getSubmittedDataKey(), JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting submitted data:', err);
  }
};

// Delete message from Telegram
export const deleteTelegramMessage = async (messageId: number): Promise<{ success: boolean; error?: string }> => {
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { success: false, error: 'Telegram Bot Token or Chat ID not configured' };
  }

  // Check if messageId is a real Telegram message_id (usually small numbers) or a timestamp fallback
  // Telegram message_ids are typically small integers, timestamps are large numbers (milliseconds since epoch)
  // If messageId is larger than a reasonable message_id (e.g., > 1 billion), it's likely a timestamp
  if (messageId > 1000000000) {
    return { 
      success: false, 
      error: 'Cannot delete: message ID not available. Please contact us directly to delete your data.' 
    };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          message_id: messageId,
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok || !responseData.ok) {
      const errorMsg = responseData.description || 'Failed to delete message';
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
};

// Validate form
export const validateForm = (
  sections: QuestionnaireSection[],
  formData: FormData,
  contactData: ContactData,
  lang: Language,
  additionalData?: FormAdditionalData
): FormErrors => {
  const errors: FormErrors = {};
  const t = translations[lang];

  sections.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.required) {
        const value = formData[question.id];
        
        if (question.type === 'checkbox') {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            errors[question.id] = t.selectAtLeastOne;
          }
        } else if (question.type === 'number') {
          if (!value || value === '' || isNaN(Number(value))) {
            errors[question.id] = t.required;
          }
        } else {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[question.id] = t.required;
          }
        }
      }
    });
  });

  // Special validation: if operations is "yes", additional field is required
  if (formData['operations'] === 'yes' && additionalData) {
    const operationsAdditional = additionalData['operations_additional'];
    if (!operationsAdditional || operationsAdditional.trim() === '') {
      errors['operations_additional'] = t.required;
    }
  }

  // Special validation: if pregnancy_problems is "yes", additional field is required
  if (formData['pregnancy_problems'] === 'yes' && additionalData) {
    const pregnancyProblemsAdditional = additionalData['pregnancy_problems_additional'];
    if (!pregnancyProblemsAdditional || pregnancyProblemsAdditional.trim() === '') {
      errors['pregnancy_problems_additional'] = t.required;
    }
  }

  // Special validation: if injuries has any option selected except "no_issues", additional field is required
  if (formData['injuries'] && additionalData) {
    const injuriesValue = formData['injuries'];
    const injuriesArray = Array.isArray(injuriesValue) ? injuriesValue : [injuriesValue];
    // Check if any option other than "no_issues" is selected
    const hasOtherThanNoIssues = injuriesArray.some((val: string) => val !== 'no_issues');
    if (hasOtherThanNoIssues) {
      const injuriesAdditional = additionalData['injuries_additional'];
      if (!injuriesAdditional || injuriesAdditional.trim() === '') {
        errors['injuries_additional'] = t.required;
      }
    }
  }

  // Special validation: if allergies has "other" selected, additional field is required
  if (formData['allergies'] && additionalData) {
    const allergiesValue = formData['allergies'];
    const allergiesArray = Array.isArray(allergiesValue) ? allergiesValue : [allergiesValue];
    const hasOther = allergiesArray.includes('other');
    if (hasOther) {
      const allergiesAdditional = additionalData['allergies_additional'];
      if (!allergiesAdditional || allergiesAdditional.trim() === '') {
        errors['allergies_additional'] = t.required;
      }
    }
  }

  // Special validation: if skin_condition has "other" selected, additional field is required
  if (formData['skin_condition'] && additionalData) {
    const skinConditionValue = formData['skin_condition'];
    const skinConditionArray = Array.isArray(skinConditionValue) ? skinConditionValue : [skinConditionValue];
    const hasOther = skinConditionArray.includes('other');
    if (hasOther) {
      const skinConditionAdditional = additionalData['skin_condition_additional'];
      if (!skinConditionAdditional || skinConditionAdditional.trim() === '') {
        errors['skin_condition_additional'] = t.required;
      }
    }
  }

  // Special validation: if how_learned is "recommendation", additional field is required
  if (formData['how_learned'] === 'recommendation' && additionalData) {
    const howLearnedAdditional = additionalData['how_learned_additional'];
    if (!howLearnedAdditional || howLearnedAdditional.trim() === '') {
      errors['how_learned_additional'] = t.required;
    }
  }

  // Special validation: if diabetes has "diabetes_stage" selected, additional field is required
  if (formData['diabetes'] && additionalData) {
    const diabetesValue = formData['diabetes'];
    const diabetesArray = Array.isArray(diabetesValue) ? diabetesValue : [diabetesValue];
    const hasDiabetesStage = diabetesArray.includes('diabetes_stage');
    if (hasDiabetesStage) {
      const diabetesAdditional = additionalData['diabetes_additional'];
      if (!diabetesAdditional || diabetesAdditional.trim() === '') {
        errors['diabetes_additional'] = t.required;
      }
    }
  }

  // Validate contact - at least one method must be filled
  const hasTelegram = contactData.telegram && contactData.telegram.trim() !== '';
  const hasInstagram = contactData.instagram && contactData.instagram.trim() !== '';
  const hasPhone = contactData.phone && contactData.phone.trim() !== '';
  
  if (!hasTelegram && !hasInstagram && !hasPhone) {
    errors['contact_method'] = t.required;
  }

  return errors;
};

// Generate Markdown
export const generateMarkdown = (
  type: QuestionnaireType,
  sections: QuestionnaireSection[],
  formData: FormData,
  additionalData: FormAdditionalData,
  contactData: ContactData,
  lang: Language
): string => {
  const t = translations[lang];
  const headers = {
    infant: t.mdInfant,
    child: t.mdChild,
    woman: t.mdWoman,
    man: t.mdMan,
  };

  // Escape special characters for HTML (Telegram supports HTML parse mode)
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Start with header
  let html = `<b>${escapeHtml(headers[type])}</b>\n`;

  let questionNumber = 1;
  let digestionQuestionPassed = false;

  sections.forEach((section) => {
    // Skip empty sections
    const hasAnswers = section.questions.some((question) => {
      const value = formData[question.id];
      return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '');
    });

    if (!hasAnswers) return;

    // Section header
    html += `<b>${escapeHtml(section.title[lang])}</b>\n`;

    section.questions.forEach((question) => {
      const value = formData[question.id];
      const additional = additionalData[`${question.id}_additional`];

      if (value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '')) {
        const label = question.label[lang];
        
        // Question number - start numbering from "digestion" question
        if (question.id === 'digestion') {
          digestionQuestionPassed = true;
          questionNumber = 1;
        }
        
        // Format answer
        let answerText = '';
        if (Array.isArray(value)) {
          const optionLabels = value.map((v) => {
            const opt = question.options?.find((o) => o.value === v);
            return opt ? opt.label[lang] : v;
          });
          answerText = optionLabels.join(', ');
        } else if (question.options) {
          const opt = question.options.find((o) => o.value === value);
          answerText = opt ? opt.label[lang] : value;
        } else {
          answerText = String(value);
        }

        // Question on one line, answer on next line
        if (digestionQuestionPassed) {
          html += `${questionNumber}. <b>${escapeHtml(label)}</b>\n`;
          questionNumber++;
        } else {
          html += `<b>${escapeHtml(label)}</b>\n`;
        }
        
        html += `${escapeHtml(answerText)}`;
        
        // Additional info on same line if present
        if (additional && additional.trim() !== '') {
          html += ` <i>(${escapeHtml(additional.trim())})</i>`;
        }
        
        html += `\n`;
      }
    });
  });

  // Contact section
  const contacts: string[] = [];
  
  if (contactData.telegram && contactData.telegram.trim() !== '') {
    const cleanTelegram = contactData.telegram.replace(/^@/, '').trim();
    const telegramLink = `https://t.me/${cleanTelegram}`;
    contacts.push(`Telegram: @${escapeHtml(cleanTelegram)}\n<a href="${telegramLink}">${escapeHtml(telegramLink)}</a>`);
  }
  
  if (contactData.instagram && contactData.instagram.trim() !== '') {
    const cleanInstagram = contactData.instagram.replace(/^@/, '').trim();
    const instagramLink = `https://instagram.com/${cleanInstagram}`;
    contacts.push(`Instagram: @${escapeHtml(cleanInstagram)}\n<a href="${instagramLink}">${escapeHtml(instagramLink)}</a>`);
  }
  
  if (contactData.phone && contactData.phone.trim() !== '') {
    const cleanPhone = contactData.phone.trim();
    const phoneLink = `tel:${cleanPhone}`;
    const phoneLabel = lang === 'ru' ? 'Телефон' : 'Phone';
    contacts.push(`${phoneLabel}: <a href="${phoneLink}">${escapeHtml(cleanPhone)}</a>`);
  }

  if (contacts.length > 0) {
    html += `<b>${escapeHtml(t.mdContacts)}</b>\n`;
    contacts.forEach((contact) => {
      html += `${contact}\n`;
    });
  }

  return html;
};

// Send to Telegram
// SECURITY NOTE: In production, use environment variables or a server-side proxy
// Do not expose BOT_TOKEN in client-side code in production!
// For development: Set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env file
export const sendToTelegram = async (markdown: string): Promise<{ success: boolean; error?: string; messageId?: number }> => {
  // Try to get from environment variables first (for Vite: VITE_ prefix)
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  // Debug: Log all environment variables (without exposing sensitive data)
  const allViteEnvKeys = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
  console.log('Environment check:', {
    hasToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID,
    tokenLength: BOT_TOKEN?.length || 0,
    chatIdLength: CHAT_ID?.length || 0,
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV,
    allEnvKeys: allViteEnvKeys,
    allEnvValues: allViteEnvKeys.map(key => ({ key, hasValue: !!import.meta.env[key] }))
  });

  // Validate that tokens are set
  if (!BOT_TOKEN || !CHAT_ID || BOT_TOKEN.trim() === '' || CHAT_ID.trim() === '') {
    const errorMsg = `Telegram Bot Token or Chat ID not configured. 
    
Please check:
1. Go to Vercel → Project settings → Environment variables
2. Make sure these variables are set:
   - Key: VITE_TELEGRAM_BOT_TOKEN, Value: your_bot_token
   - Key: VITE_TELEGRAM_CHAT_ID, Value: your_chat_id
3. After adding variables, redeploy your site
4. Wait for the build to complete

Current status:
- VITE_TELEGRAM_BOT_TOKEN: ${BOT_TOKEN ? 'SET' : 'NOT SET'}
- VITE_TELEGRAM_CHAT_ID: ${CHAT_ID ? 'SET' : 'NOT SET'}
- All VITE_ variables found: ${allViteEnvKeys.join(', ') || 'NONE'}`;
    
    console.error('Environment variables check failed:', {
      BOT_TOKEN: BOT_TOKEN ? 'SET (hidden)' : 'NOT SET',
      CHAT_ID: CHAT_ID ? 'SET (hidden)' : 'NOT SET',
      allViteEnvKeys,
      mode: import.meta.env.MODE
    });
    return { success: false, error: errorMsg };
  }

  // Log payload for debugging
  console.log('Sending to Telegram...', { 
    chatId: CHAT_ID.substring(0, 4) + '...', 
    textLength: markdown.length,
    hasToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID
  });

  // Create AbortController for timeout
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: markdown,
          parse_mode: 'HTML',
        }),
        signal: controller.signal,
      }
    );

    if (timeoutId) clearTimeout(timeoutId);

    const responseData = await response.json();

    if (!response.ok) {
      const errorMsg = responseData.description || `HTTP ${response.status}`;
      console.error('Telegram API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      return { 
        success: false, 
        error: `Telegram API error: ${errorMsg}` 
      };
    }

    if (!responseData.ok) {
      const errorMsg = responseData.description || 'Unknown Telegram API error';
      console.error('Telegram API returned error:', responseData);
      return { 
        success: false, 
        error: `Telegram API error: ${errorMsg}` 
      };
    }

    const messageId = responseData.result?.message_id;
    console.log('Successfully sent to Telegram', { 
      messageId,
      fullResponse: responseData 
    });
    return { 
      success: true, 
      messageId: messageId 
    };
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Please check your internet connection and try again.';
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Error sending to Telegram:', {
      error,
      message: errorMessage,
      name: error?.name,
      stack: error?.stack
    });
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};
