using System.ComponentModel.Composition;
using System.Windows.Media;

namespace WordsViaSubtitle.Contracts
{
    [InheritedExport(typeof(IExplanationProvider))]
    public interface IExplanationProvider
    {
        void RefreshExplanationPresenter(string wordInEnglish);
        object ExplanationPresenter { get; }
        string Language { get; }
        string GetExplanationInText(string wordInEnglish);
        ImageSource RibbonButtonImage { get; }
    }
}
