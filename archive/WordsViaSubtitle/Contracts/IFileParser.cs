using System.ComponentModel.Composition;

namespace WordsViaSubtitle.Contracts
{
    [InheritedExport(typeof(IFileParser))]
    public interface IFileParser
    {
        string CurrentFilePath { get; set; }
        string[] GetWordsFromCurrentFile();
        string[] SupportedFileSuffixes { get; }
        PlayTimeDuration GetTimeDuration(string word);
    }
}
