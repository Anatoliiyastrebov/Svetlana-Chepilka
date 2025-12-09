import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShieldCheck } from 'lucide-react';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();

  const privacyPolicy = {
    ru: {
      title: 'Политика конфиденциальности',
      sections: [
        {
          title: 'Контролер данных',
          content: 'Контролером данных является лицо, предоставляющее консультацию по здоровью. Для запросов по обработке данных свяжитесь с нами через указанные контактные данные в анкете.',
        },
        {
          title: 'Правовая основа обработки',
          content: 'Обработка персональных данных осуществляется на основании вашего добровольного согласия (ст. 6 п. 1 лит. a GDPR). Вы можете в любое время отозвать свое согласие.',
        },
        {
          title: 'Какие данные мы собираем',
          content: 'Мы собираем персональные данные, которые вы предоставляете в анкете: имя, возраст, вес, информацию о состоянии здоровья, симптомы, жалобы, аллергии, историю болезней и контактные данные (Telegram или Instagram). Предоставление данных является добровольным, но необходимо для предоставления консультации.',
        },
        {
          title: 'Зачем мы собираем данные',
          content: 'Данные собираются исключительно для предоставления консультации по здоровью. Мы используем эту информацию для анализа вашего состояния и подготовки рекомендаций. Данные не используются для автоматизированного принятия решений или профилирования.',
        },
        {
          title: 'Куда отправляются данные',
          content: 'Данные отправляются в Telegram-бот через официальный API Telegram. Сообщение с вашей анкетой отправляется в защищенный чат для обработки консультантом. Telegram обрабатывает данные в соответствии с применимыми законами о защите данных.',
        },
        {
          title: 'Как долго хранятся данные',
          content: 'Данные хранятся в Telegram-чате до момента завершения консультации или до момента отзыва вашего согласия. После завершения консультации или отзыва согласия вы можете запросить удаление ваших данных. Мы удалим ваши данные в течение 30 дней с момента запроса.',
        },
        {
          title: 'Ваши права',
          content: 'В соответствии с GDPR/DSGVO вы имеете право: на доступ к вашим данным (ст. 15 GDPR), их исправление (ст. 16 GDPR), удаление (ст. 17 GDPR), ограничение обработки (ст. 18 GDPR), переносимость данных (ст. 20 GDPR) и возражение против обработки (ст. 21 GDPR). Вы можете в любое время отозвать согласие на обработку данных без влияния на законность обработки, основанную на согласии до его отзыва.',
        },
        {
          title: 'Право на подачу жалобы',
          content: 'Вы имеете право подать жалобу в надзорный орган по защите данных, если считаете, что обработка ваших персональных данных нарушает GDPR. В Германии это Федеральный уполномоченный по защите данных и свободе информации (BfDI).',
        },
        {
          title: 'Как реализовать ваши права',
          content: 'Для реализации ваших прав (доступ, исправление, удаление и т.д.) свяжитесь с нами через Telegram или Instagram, указав ваше имя и дату заполнения анкеты. Мы обработаем ваш запрос в течение 30 дней с момента получения.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        {
          title: 'Data Controller',
          content: 'The data controller is Svetlana Chepilka, located at 4763 69th Street, Sacramento, CA 95820. For requests regarding data processing, please contact us through the contact details provided in the questionnaire or via email at schepilka@gmail.com.',
        },
        {
          title: 'Legal Basis for Processing',
          content: 'The processing of personal data is based on your voluntary consent. This service operates in accordance with the California Consumer Privacy Act (CCPA) and applicable U.S. privacy laws. You can withdraw your consent at any time.',
        },
        {
          title: 'What data we collect',
          content: 'We collect personal data that you provide in the questionnaire: name, age, weight, health information, symptoms, complaints, allergies, medical history, and contact details (Telegram or Instagram). Providing data is voluntary but necessary for providing consultation. We do not sell your personal information.',
        },
        {
          title: 'Why we collect data',
          content: 'Data is collected solely for the purpose of providing health consultation. We use this information to analyze your condition and prepare recommendations. Data is not used for automated decision-making, profiling, or commercial purposes. We do not share your data with third parties for marketing purposes.',
        },
        {
          title: 'Where data is sent',
          content: 'Data is sent to a Telegram bot through the official Telegram API. The message with your questionnaire is sent to a secure chat for processing by a consultant. Telegram processes data in accordance with its privacy policy and applicable data protection laws.',
        },
        {
          title: 'How long data is stored',
          content: 'Data is stored in the Telegram chat until the consultation is completed or until you withdraw your consent. After completion of the consultation or withdrawal of consent, you can request deletion of your data. We will delete your data within 45 days of the request, as required by CCPA.',
        },
        {
          title: 'Your rights under CCPA',
          content: 'In accordance with the California Consumer Privacy Act (CCPA) and applicable U.S. privacy laws, you have the right to: (1) Know what personal information is collected, used, shared, or sold; (2) Delete personal information held by us; (3) Opt-out of the sale of personal information (we do not sell your information); (4) Non-discrimination for exercising your privacy rights. You can withdraw your consent to data processing at any time.',
        },
        {
          title: 'How to exercise your rights',
          content: 'To exercise your rights (access, correction, deletion, etc.), contact us via Telegram, Instagram, or email at schepilka@gmail.com, providing your name and the date you filled out the questionnaire. We will process your request within 45 days of receipt, as required by CCPA. You may also designate an authorized agent to make a request on your behalf.',
        },
        {
          title: 'Children\'s Privacy',
          content: 'This service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to have that information deleted.',
        },
      ],
    },
  };

  const policy = privacyPolicy[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {policy.title}
          </DialogTitle>
          <DialogDescription>
            {language === 'ru'
              ? 'Информация о сборе и обработке персональных данных'
              : 'Information about collection and processing of personal data'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {policy.sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

