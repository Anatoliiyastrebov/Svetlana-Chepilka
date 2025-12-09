import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home, Trash2, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getSubmittedDataList, 
  deleteSubmittedData, 
  deleteTelegramMessage,
  sendToTelegram,
  SubmittedData 
} from '@/lib/form-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const DataRequest: React.FC = () => {
  const { language } = useLanguage();
  const [submittedData, setSubmittedData] = useState<SubmittedData[]>(getSubmittedDataList());
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<'access' | 'delete' | null>(null);
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    date: '',
    requestDetails: '',
  });

  const content = {
    ru: {
      title: 'Запрос на доступ или удаление данных',
      backToHome: 'Вернуться на главную',
      description: 'В соответствии с CCPA, вы имеете право запросить доступ к вашим данным или их удаление. Мы обработаем ваш запрос в течение 45 дней.',
      accessTitle: 'Запрос на доступ к данным',
      deleteTitle: 'Запрос на удаление данных',
      selectRequest: 'Выберите тип запроса',
      nameLabel: 'Ваше имя (как указано в анкете)',
      emailLabel: 'Email для связи',
      dateLabel: 'Дата заполнения анкеты (примерно)',
      detailsLabel: 'Дополнительная информация (необязательно)',
      submitRequest: 'Отправить запрос',
      submitting: 'Отправка...',
      submittedData: 'Отправленные анкеты',
      deleteButton: 'Удалить',
      deleting: 'Удаление...',
      noData: 'Нет отправленных анкет',
      deleteSuccess: 'Данные успешно удалены',
      deleteError: 'Ошибка при удалении данных',
      requestSent: 'Запрос отправлен. Мы свяжемся с вами в течение 45 дней.',
      fillAllFields: 'Заполните все обязательные поля',
    },
    en: {
      title: 'Data Access or Deletion Request',
      backToHome: 'Back to home',
      description: 'In accordance with CCPA, you have the right to request access to your data or its deletion. We will process your request within 45 days.',
      accessTitle: 'Request Access to Data',
      deleteTitle: 'Request Data Deletion',
      selectRequest: 'Select request type',
      nameLabel: 'Your name (as provided in questionnaire)',
      emailLabel: 'Email for contact',
      dateLabel: 'Date you filled out the questionnaire (approximately)',
      detailsLabel: 'Additional information (optional)',
      submitRequest: 'Submit Request',
      submitting: 'Submitting...',
      submittedData: 'Submitted Questionnaires',
      deleteButton: 'Delete',
      deleting: 'Deleting...',
      noData: 'No submitted questionnaires',
      deleteSuccess: 'Data successfully deleted',
      deleteError: 'Error deleting data',
      requestSent: 'Request sent. We will contact you within 45 days.',
      fillAllFields: 'Please fill all required fields',
    },
  };

  const t = content[language];

  const handleDelete = async (messageId: number) => {
    setIsDeleting(messageId);
    try {
      const result = await deleteTelegramMessage(messageId);
      if (result.success) {
        deleteSubmittedData(messageId);
        setSubmittedData(getSubmittedDataList());
        toast.success(t.deleteSuccess);
      } else {
        toast.error(result.error || t.deleteError);
      }
    } catch (error: any) {
      toast.error(error.message || t.deleteError);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestForm.name || !requestForm.email || !requestForm.date) {
      toast.error(t.fillAllFields);
      return;
    }

    // Send request to Telegram
    const requestText = `
📋 ${requestType === 'access' ? t.accessTitle : t.deleteTitle}

👤 Name: ${requestForm.name}
📧 Email: ${requestForm.email}
📅 Date: ${requestForm.date}
${requestForm.requestDetails ? `\n📝 Details: ${requestForm.requestDetails}` : ''}

⏰ Request submitted: ${new Date().toLocaleString()}
    `.trim();

    try {
      const result = await sendToTelegram(requestText);
      
      if (result.success) {
        toast.success(t.requestSent);
        setRequestForm({ name: '', email: '', date: '', requestDetails: '' });
        setRequestType(null);
      } else {
        toast.error(result.error || 'Error sending request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error sending request');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Home className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>

        <div className="card-wellness space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{t.title}</h1>
            <p className="text-muted-foreground">{t.description}</p>
          </div>

          {/* Request Type Selection */}
          {!requestType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRequestType('access')}
                className="card-wellness p-6 text-left hover:bg-accent/50 transition-colors"
              >
                <FileText className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">{t.accessTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' 
                    ? 'Запросить копию ваших персональных данных'
                    : 'Request a copy of your personal data'}
                </p>
              </button>
              <button
                onClick={() => setRequestType('delete')}
                className="card-wellness p-6 text-left hover:bg-accent/50 transition-colors"
              >
                <Trash2 className="w-8 h-8 text-destructive mb-3" />
                <h3 className="text-xl font-semibold mb-2">{t.deleteTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' 
                    ? 'Запросить удаление ваших персональных данных'
                    : 'Request deletion of your personal data'}
                </p>
              </button>
            </div>
          )}

          {/* Request Form */}
          {requestType && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {requestType === 'access' ? t.accessTitle : t.deleteTitle}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRequestType(null)}
                >
                  {language === 'ru' ? 'Назад' : 'Back'}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.nameLabel} *</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={requestForm.name}
                  onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.emailLabel} *</label>
                <input
                  type="email"
                  className="input-field w-full"
                  value={requestForm.email}
                  onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.dateLabel} *</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={requestForm.date}
                  onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.detailsLabel}</label>
                <textarea
                  className="input-field w-full min-h-[100px]"
                  value={requestForm.requestDetails}
                  onChange={(e) => setRequestForm({ ...requestForm, requestDetails: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                {t.submitRequest}
              </Button>
            </form>
          )}

          {/* Submitted Data List */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">{t.submittedData}</h2>
            {submittedData.length === 0 ? (
              <p className="text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="space-y-3">
                {submittedData.map((data) => (
                  <div key={data.messageId} className="card-wellness p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.contactInfo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(data.messageId)}
                      disabled={isDeleting === data.messageId}
                    >
                      {isDeleting === data.messageId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {t.deleting}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t.deleteButton}
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DataRequest;

