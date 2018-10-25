using System;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using WordsViaSubtitle.Contracts;
using System.Windows.Navigation;
using mshtml;

namespace ChineseExplanationProvider
{
    public class ChineseExplanationProvider : IExplanationProvider
    {
        private WebBrowser browser;
        private BitmapImage ribbonButtonImage;
        private string currentWord;

        public string Language
        {
            get { return "Chinese(Dict.cn)"; }
        }

        public ChineseExplanationProvider()
        {
            browser = new WebBrowser();
            ribbonButtonImage = new BitmapImage(new Uri("/ChineseExplanationProvider;component/dictcn.png", UriKind.Relative));
        }

        public void RefreshExplanationPresenter(string wordInEnglish)
        {
            if (currentWord != wordInEnglish)
            {
                currentWord = wordInEnglish;
                browser.Navigate(new Uri("http://dict.cn/mini.php?q=" + wordInEnglish));
            }
        }

        public object ExplanationPresenter
        {
            get { return browser; }
        }

        public ImageSource RibbonButtonImage { get { return ribbonButtonImage; } }

        public string GetExplanationInText(string wordInEnglish)
        {
            if (currentWord != wordInEnglish)
            {
                currentWord = wordInEnglish;
                browser.Navigate(new Uri("http://dict.cn/mini.php?q=" + wordInEnglish));
            }

            IHTMLDocument2 htmlDocument = browser.Document as IHTMLDocument2;

            string result = htmlDocument.activeElement.innerText;
            return result;
        }
    }
}
