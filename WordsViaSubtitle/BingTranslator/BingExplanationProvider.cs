using System;
using System.ComponentModel;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Bing;
using WordsViaSubtitle.Contracts;

namespace BingTranslator
{
    public class BingExplanationProvider : IExplanationProvider
    {
        private SearchRequest searchRequest;
        private TranslationRequest translationRequest;
        private BingExplanationPresenter presenter;
        private TranslationResultEntity entity;

        public BingExplanationProvider()
        {
            RibbonButtonImage = new BitmapImage(new Uri("/BingTranslator;component/bing.png", UriKind.Relative));

            entity = new TranslationResultEntity();
            presenter = new BingExplanationPresenter { DataContext = entity };

            searchRequest = new SearchRequest()
            {
                AppId = "A44B7B61BCC720009D1DBFDEDF219691CAC6DAB9",
            };

            translationRequest = new TranslationRequest();
            translationRequest.SourceLanguage = "En";
            translationRequest.TargetLanguage = "zh-CHS";
        }

        public void RefreshExplanationPresenter(string wordInEnglish)
        {
            searchRequest.Query = wordInEnglish;
            TranslationResponse result = API.Translation(searchRequest, translationRequest);

            if (result.TranslationResults.Count > 0)
            {
                entity.English = wordInEnglish;
                entity.Chinese = result.TranslationResults[0].TranslatedTerm;
            }
        }

        public object ExplanationPresenter
        {
            get { return presenter; }
        }

        public string Language
        {
            get { return "Chinese(Bing)"; }
        }

        public ImageSource RibbonButtonImage
        { get; private set; }

        public string GetExplanationInText(string wordInEnglish)
        {
            searchRequest.Query = wordInEnglish;
            TranslationResponse result = API.Translation(searchRequest, translationRequest);

            return result.TranslationResults[0].TranslatedTerm;
        }
    }

    public class TranslationResultEntity : INotifyPropertyChanged
    {
        private string english;
        private string chinese;

        public event PropertyChangedEventHandler PropertyChanged;

        public string English
        {
            get { return english; }
            set
            {
                english = value;
                OnPropertyChanged("English");
            }
        }

        public string Chinese
        {
            get { return chinese; }
            set
            {
                chinese = value;
                OnPropertyChanged("Chinese");
            }
        }

        private void OnPropertyChanged(string propertyName)
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
    }
}
