using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.IO;
using System.Linq;
using WordsViaSubtitle.Contracts;

namespace WordsViaSubtitle
{
    [Export(typeof(FileParsersManager))]
    internal class FileParsersManager
    {
        [ImportMany(typeof(IFileParser))]
        private List<IFileParser> fileParsers;

        private IFileParser currentParser;

        public List<IFileParser> FileParsers
        {
            get
            {
                return fileParsers;
            }
        }

        public string[] GetWords(string filePath)
        {
            string suffix = Path.GetExtension(filePath).Trim('.');
            currentParser = fileParsers.First(parser => parser.SupportedFileSuffixes.Contains(suffix));

            currentParser.CurrentFilePath = filePath;
            return currentParser.GetWordsFromCurrentFile();
        }

        public PlayTimeDuration GetDuration(string word)
        {
            return currentParser.GetTimeDuration(word);
        }
    }
}
