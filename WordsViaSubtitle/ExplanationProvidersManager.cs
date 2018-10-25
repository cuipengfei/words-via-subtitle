using System.Collections.Generic;
using System.ComponentModel.Composition;
using WordsViaSubtitle.Contracts;
using System.Text;

namespace WordsViaSubtitle
{
    [Export(typeof(ExplanationProvidersManager))]
    internal class ExplanationProvidersManager
    {
        [ImportMany(typeof(IExplanationProvider))]
        private List<IExplanationProvider> allExplanationProviders;

        public List<IExplanationProvider> AllExplanationProviders
        {
            get
            {
                return allExplanationProviders;
            }
        }

        public object CurrentPresenter { get; private set; }

        public void RefreshExplanation(IEnumerable<IExplanationProvider> providers, string word)
        {
            foreach (var item in providers)
            {
                item.RefreshExplanationPresenter(word);
            }
        }

        public string GetExplanationsInText(string word)
        {
            StringBuilder builder = new StringBuilder();

            allExplanationProviders.ForEach(provider =>
            {
                builder.AppendLine(provider.GetExplanationInText(word));
            });

            return builder.ToString();
        }
    }
}
