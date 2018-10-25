using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Controls;
using WordsViaSubtitle.Contracts;

namespace WordsViaSubtitle
{
    internal static class ExtensionMethods
    {
        private static Stopwatch watch;
        private static List<string> knownWords;
        private static string currentFolder;

        public static string CurrentFolder { get { return currentFolder; } }

        static ExtensionMethods()
        {
            watch = new Stopwatch();
            currentFolder = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            RefreshList();
        }

        private static void RefreshList()
        {
            knownWords = new List<string>();

            using (StreamReader reader = new StreamReader(Path.Combine(currentFolder, @"WordsList\KnownWords.txt")))
            {
                while (!reader.EndOfStream)
                {
                    knownWords.Add(reader.ReadLine());
                }
            }
        }

        public static void ForEach<T>(this IEnumerable<T> collection, Action<T> action)
        {
            foreach (var item in collection)
            {
                action(item);
            }
        }

        public static void Play(this MediaElement player, PlayTimeDuration duration)
        {
            player.Position = duration.Start;
            player.Play();
            while (player.Position <= duration.Stop)
            {
                System.Windows.Forms.Application.DoEvents();
            }
            player.Pause();
        }

        public static bool Known(this string str)
        {
            RefreshList();
            return knownWords.Contains(str);
        }

        public static void WaitFor(double seconds)
        {
            watch.Reset();
            watch.Start();

            while (watch.Elapsed <= TimeSpan.FromSeconds(seconds))
            {
                System.Windows.Forms.Application.DoEvents();
            }

            watch.Stop();
        }
    }
}
