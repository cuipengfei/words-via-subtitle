using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using WordsViaSubtitle.Contracts;

namespace SrtParser
{
    public class SrtFileParser : IFileParser
    {
        private string[] allLines;
        private string[] supportedFiles = { "srt", "txt" };
        private string currentFilePath;

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
            string allText = File.ReadAllText(CurrentFilePath);
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
            string containerLine = allLines.FirstOrDefault(line => line.ToLower().Contains(word.ToLower()));
            if (containerLine != null)
            {
                int index = allLines.ToList().IndexOf(containerLine);
                while (!allLines[--index].Contains("-->")) { }
                string timeLine = allLines[index];

                string[] startAndStop = timeLine.Split(new string[] { "-->" }, 2, StringSplitOptions.None);
                string start = startAndStop[0].Replace(',', '.');
                string stop = startAndStop[1].Replace(',', '.');

                return new PlayTimeDuration
                {
                    Start = TimeSpan.Parse(start),
                    Stop = TimeSpan.Parse(stop)
                };
            }
            else
            {
                return null;
            }
        }
    }
}
