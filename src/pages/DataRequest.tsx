import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getSubmittedDataList, 
  deleteSubmittedData, 
  deleteTelegramMessage,
  SubmittedData 
} from '@/lib/form-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const DataRequest: React.FC = () => {
  const { language } = useLanguage();
  const [submittedData, setSubmittedData] = useState<SubmittedData[]>(getSubmittedDataList());
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<'access' | 'delete' | null>(null);

  // Refresh submitted data list on mount
  useEffect(() => {
    setSubmittedData(getSubmittedDataList());
  }, []);
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
    if (!window.confirm(content[language].deleteWarning)) {
      return;
    }

    setIsDeleting(messageId);
    try {
      const result = await deleteTelegramMessage(messageId);
      if (result.success) {
        deleteSubmittedData(messageId);
        setSubmittedData(getSubmittedDataList());
        toast.success(content[language].deleteSuccess);
      } else {
        // Even if Telegram deletion fails, remove from local list
        deleteSubmittedData(messageId);
        setSubmittedData(getSubmittedDataList());
        toast.warning(result.error || content[language].deleteError + '. Data removed from local list.');
      }
    } catch (error: any) {
      // Even if error occurs, remove from local list
      deleteSubmittedData(messageId);
      setSubmittedData(getSubmittedDataList());
      toast.error(error.message || content[language].deleteError);
    } finally {
      setIsDeleting(null);
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
            <h1 className="text-3xl font-bold text-foreground mb-4">{content[language].title}</h1>
            <p className="text-muted-foreground">{content[language].description}</p>
          </div>

          {/* Submitted Data List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{content[language].submittedData}</h2>
            {submittedData.length === 0 ? (
              <p className="text-muted-foreground">{content[language].noData}</p>
            ) : (
              <div className="space-y-3">
                {submittedData.map((data) => (
                  <div key={data.messageId} className="card-wellness p-4 flex items-center justify-between">
                    <div className="flex-1">
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
                          {content[language].deleting}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {content[language].deleteButton}
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

