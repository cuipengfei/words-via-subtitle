using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using LocalDictionary.Properties;
using WordsViaSubtitle.Contracts;

namespace LocalDictionary
{
    public class LocalExplanationProvider : IExplanationProvider
    {
        private List<string> localWords;
        private ExplanationPresenter presenter = new ExplanationPresenter();
        private BitmapImage ribbonButtonImage = new BitmapImage(new Uri("/LocalDictionary;component/Resources/local.png", UriKind.RelativeOrAbsolute));

        public LocalExplanationProvider()
        {
            string[] greWords = Resources.gre.Split(new string[] { "\r\n" }, StringSplitOptions.None);
            string[] toeflWords = Resources.toefl.Split(new string[] { "\r\n" }, StringSplitOptions.None);
            localWords = greWords.Concat(toeflWords).ToList();
            localWords.ForEach(str => { str = str.ToLower(); });
        }

        public void RefreshExplanationPresenter(string wordInEnglish)
        {
            int index = localWords.IndexOf(wordInEnglish.ToLower());
            if (index >= 0)
            {
                presenter.DataContext = new { Word = wordInEnglish, Explanation = localWords[index + 1] };
            }
            else
            {
                presenter.DataContext = new { Word = "Sorry", Explanation = "This word is not contained in the local dictionary." };
            }
        }

        public object ExplanationPresenter
        {
            get { return presenter; }
        }

        public string Language
        {
            get { return "Local Dictionary"; }
        }

        public ImageSource RibbonButtonImage
        {
            get { return ribbonButtonImage; }
        }

        public string GetExplanationInText(string wordInEnglish)
        {
            int index = localWords.IndexOf(wordInEnglish.ToLower());
            if (index >= 0)
            {
                return localWords[index + 1];
            }
            else
            {
                return string.Empty;
            }
        }
    }
}
