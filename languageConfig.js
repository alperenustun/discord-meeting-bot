import path from "path";
import { fileURLToPath } from "url";

// Get the directory name for the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Application configuration including language settings and OpenAI prompts
 */
const languageConfig = {
  // Language settings
  language: {
    // Set your preferred language here: "tr" for Turkish, "en" for Turkish
    current: "tr",
    supported: ["en", "tr"],
  },

  // Report section labels by language
  reportLabels: {
    en: {
      meetingSummary: "Meeting Summary",
      sentimentAnalysis: "Meeting Sentiment Analysis"
    },
    tr: {
      meetingSummary: "Toplantı Özeti",
      sentimentAnalysis: "Toplantı Duygu Analizi"
    }
  },

  // OpenAI prompts by language
  prompts: {
    // Meeting summary prompts
    summary: {
      en: {
        system: `You are a helpful assistant that summarizes meeting transcripts. 
        Create a well-structured summary with the following sections:
        
        1. Meeting Overview: A brief introduction about the meeting
        2. Key Discussion Points: The main topics that were discussed
        3. Action Items: Tasks that were assigned or need to be completed
        4. Decisions Made: Any conclusions or decisions reached during the meeting
        5. Next Steps: Plans for follow-up or future meetings
        
        Format your response in markdown for better readability.`,
        user: `Please summarize the following meeting transcript:\n\n{transcription}`,
      },
      tr: {
        system: `Toplantı transkriptlerini özetleyen yardımcı bir asistansınız. 
        Aşağıdaki bölümleri içeren iyi yapılandırılmış bir özet oluşturun:
        
        1. Toplantı Genel Bakışı: Toplantı hakkında kısa bir giriş
        2. Ana Tartışma Konuları: Tartışılan ana konular
        3. Yapılacak İşler: Atanan veya tamamlanması gereken görevler
        4. Alınan Kararlar: Toplantı sırasında varılan sonuçlar veya kararlar
        5. Sonraki Adımlar: Takip veya gelecek toplantılar için planlar
        
        Daha iyi okunabilirlik için yanıtınızı markdown formatında düzenleyin.`,
        user: `Lütfen aşağıdaki toplantı transkriptini özetleyin:\n\n{transcription}`,
      },
    },

    // Sentiment analysis prompts
    sentiment: {
      en: {
        system: `You are an AI assistant that analyzes meeting transcripts to determine:
        1. Overall sentiment of the meeting (positive, negative, neutral)
        2. Level of engagement from participants
        3. Any notable tension or disagreement
        4. Balance of participation among attendees
        
        Provide a brief, objective analysis focused on these aspects.`,
        user: `Please analyze the sentiment and engagement in this meeting transcript:\n\n{transcription}`,
      },
      tr: {
        system: `Toplantı transkriptlerini analiz eden bir yapay zeka asistanısınız. Şunları belirlemelisiniz:
        1. Toplantının genel duygu durumu (pozitif, negatif, nötr)
        2. Katılımcıların katılım seviyesi
        3. Dikkat çekici gerginlik veya anlaşmazlıklar
        4. Katılımcılar arasındaki katılım dengesi
        
        Bu yönlere odaklanan kısa, objektif bir analiz sağlayın.`,
        user: `Lütfen bu toplantı transkriptindeki duygu durumunu ve katılımı analiz edin:\n\n{transcription}`,
      },
    },
  },

  // Paths
  paths: {
    root: __dirname,
  },
};

export default languageConfig;
