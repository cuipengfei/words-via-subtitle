using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using WordsViaSubtitle.Contracts;

namespace AssParser
{
    public class AssFileParser : IFileParser
    {
        private string currentFilePath;
        private string[] supportedFiles = new string[] { "ass" };
        private string[] allLines;

        public string CurrentFilePath
        {
            get { return currentFilePath; }
            set
            {
                currentFilePath = value;
                allLines = File.ReadAllLines(value);
            }
        }

        public string[] GetWordsFromCurrentFile()
        {
            StringBuilder builder = new StringBuilder();
            string[] allLines = File.ReadAllLines(CurrentFilePath);
            foreach (var line in allLines)
            {
                if (line.Contains("Dialogue:"))
                {
                    builder.AppendLine(line);
                }
            }

            string allText = builder.ToString();

            Regex reg = new Regex(@"(?i)\b(?!['-])[a-z'-]+(?<!['-])\b");
            List<string> wordList = new List<string>();

            reg.Replace(allText, (Match match) =>
            {
                if (!wordList.Contains(match.Value.ToLower()))
                {
                    wordList.Add(match.Value.ToLower());
                }
                return string.Empty;
            });

            return wordList.ToArray();
        }

        public string[] SupportedFileSuffixes
        {
            get { return supportedFiles; }
        }

        public PlayTimeDuration GetTimeDuration(string word)
        {
            string theLine = allLines.FirstOrDefault(line => line.ToLower().Contains(word.ToLower()) && line.Contains("Dialogue"));
            if (theLine != null)
            {
                string[] startAndEnd = theLine.Substring(12, 21).Split(','); ;
                return new PlayTimeDuration
                {
                    Start = TimeSpan.Parse(startAndEnd[0]),
                    Stop = TimeSpan.Parse(startAndEnd[1])
                };
            }
            else
            {
                return null;
            }
        }
    }
}
