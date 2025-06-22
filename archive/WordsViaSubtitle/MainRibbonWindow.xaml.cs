using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.Composition.Hosting;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Speech.Synthesis;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Win32;
using Microsoft.Windows.Controls.Ribbon;
using WordsViaSubtitle.Contracts;

namespace WordsViaSubtitle
{
    /// <summary>
    /// Interaction logic for MainRibbonWindow.xaml
    /// </summary>
    public partial class MainRibbonWindow : RibbonWindow
    {
        private bool keepPlaying;
        private List<string> supportedSubtitleFiles = new List<string>();
        private ObservableCollection<string> wordsCollection = new ObservableCollection<string>();

        private ExplanationProvidersManager explanationProvidersManager;
        private FileParsersManager fileParsersManager;

        private MediaElement videoPlayer = new MediaElement { LoadedBehavior = MediaState.Manual };
        private SpeechSynthesizer speechSynthesizer = new SpeechSynthesizer();

        private ObservableCollection<IExplanationProvider> currentProviders = new ObservableCollection<IExplanationProvider>();

        private string currentVideoPath = string.Empty;

        public MainRibbonWindow()
        {
            InitializeComponent();
            InitializeManagers();
            InitializeData();
            InitializeVoiceSettings();
        }

        private void InitializeVoiceSettings()
        {
            var availableVoices = speechSynthesizer.GetInstalledVoices().Select(voice => voice.VoiceInfo.Name);
            voiceGalleryCategory.ItemsSource = availableVoices;
        }

        private void InitializeData()
        {
            //init words list
            wordsListBox.ItemsSource = wordsCollection;

            explanationList.ItemsSource = currentProviders;

            //init language buttons
            explanationProvidersManager.AllExplanationProviders.ForEach((provider) =>
            {
                RibbonToggleButton languageButton = new RibbonToggleButton
                {
                    Label = provider.Language,
                    LargeImageSource = provider.RibbonButtonImage,
                    IsChecked = true,
                    Tag = provider
                };

                languageButton.Click += (s, e) =>
                {
                    RibbonToggleButton clickedButton = (RibbonToggleButton)s;
                    IExplanationProvider clickedProvider = (IExplanationProvider)clickedButton.Tag;
                    if (currentProviders.Contains(clickedProvider))
                    {
                        currentProviders.Remove(clickedProvider);
                    }
                    else
                    {
                        currentProviders.Add(clickedProvider);
                    }
                    RefreshExplanationPresenter();
                };

                languageGroup.Items.Add(languageButton);

                currentProviders.Add(provider);
            });

            //init filter
            supportedSubtitleFiles.AddRange(fileParsersManager.FileParsers.SelectMany(parser => parser.SupportedFileSuffixes));
        }

        private void InitializeManagers()
        {
            explanationProvidersManager = CreateInstanceFromFolder<ExplanationProvidersManager>("ExplanationProviders");
            fileParsersManager = CreateInstanceFromFolder<FileParsersManager>("FileParsers");
        }

        private static T CreateInstanceFromFolder<T>(string folder)
        {
            DirectoryCatalog directoryCatalog = new DirectoryCatalog(folder);
            AssemblyCatalog assemblyCatalog = new AssemblyCatalog(Assembly.GetExecutingAssembly());
            AggregateCatalog aggregateCatalog = new AggregateCatalog();
            aggregateCatalog.Catalogs.Add(directoryCatalog);
            aggregateCatalog.Catalogs.Add(assemblyCatalog);

            CompositionContainer container = new CompositionContainer(aggregateCatalog);

            return container.GetExportedValue<T>();
        }

        private void openSub_Click(object sender, RoutedEventArgs e)
        {
            OpenFileDialog openFileDialog = new OpenFileDialog();
            string fileter = string.Empty;
            foreach (var item in supportedSubtitleFiles)
            {
                string oneFileter = item + " Files|*." + item;
                fileter += oneFileter;
                fileter += "|";
            }
            fileter = fileter.Substring(0, fileter.Length - 1);
            openFileDialog.Filter = fileter;

            if (openFileDialog.ShowDialog() == true)
            {
                string suffix = System.IO.Path.GetExtension(openFileDialog.FileName);
                GetWords(openFileDialog.FileName);
            }

            wordsListBox.SelectedIndex = 0;
        }

        private void GetWords(string filePath)
        {
            wordsCollection.Clear();
            foreach (var word in fileParsersManager.GetWords(filePath).Select(wordFromFile =>
            {
                if (wordFromFile.Known())
                {
                    return null;
                }
                else
                {
                    return wordFromFile;
                }
            }))
            {
                if (word != null)
                {
                    wordsCollection.Add(word);
                }
            }
        }

        private void wordListBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            RefreshExplanationPresenter();
        }

        private void RefreshExplanationPresenter()
        {
            if (wordsListBox != null && wordsListBox.SelectedItem != null)
            {
                explanationProvidersManager.RefreshExplanation(currentProviders, wordsListBox.SelectedItem.ToString());
            }
        }

        private void Misspelling_Click(object sender, RoutedEventArgs e)
        {
            RemoveSelectedOneFromList();
        }

        private void RemoveSelectedOneFromList()
        {
            if (wordsListBox.SelectedIndex != -1)
            {
                if (wordsListBox.SelectedIndex + 1 < wordsListBox.Items.Count)
                {
                    wordsListBox.SelectedIndex++;
                    wordsCollection.RemoveAt(wordsListBox.SelectedIndex - 1);
                }
                else
                {
                    if (wordsListBox.SelectedIndex - 1 != -1)
                    {
                        wordsListBox.SelectedIndex--;
                        wordsCollection.RemoveAt(wordsListBox.SelectedIndex + 1);
                    }
                    else
                    {
                        wordsCollection.RemoveAt(wordsListBox.SelectedIndex);
                    }
                }
            }
        }

        private void known_Click(object sender, RoutedEventArgs e)
        {
            if (wordsListBox.SelectedItem != null)
            {
                SaveOneWordToFile(wordsListBox.SelectedItem.ToString(), Path.Combine(ExtensionMethods.CurrentFolder, @"WordsList\KnownWords.txt"));
            }

            RemoveSelectedOneFromList();
        }

        private void SaveOneWordToFile(string word, string fileName)
        {
            using (StreamWriter writer = new StreamWriter(fileName, true))
            {
                writer.WriteLine(word);
            }
        }

        private void chooseVideo_Click(object sender, RoutedEventArgs e)
        {
            OpenFileDialog openVideoDialog = new OpenFileDialog { Filter = "any video file|*.*" };
            if ((bool)openVideoDialog.ShowDialog())
            {
                currentVideoPath = openVideoDialog.FileName;
                videoPlayer.Source = new Uri(currentVideoPath, UriKind.RelativeOrAbsolute);
            }
        }

        private void play_Click(object sender, RoutedEventArgs e)
        {
            PlaySelectedWord();
        }

        private void PlaySelectedWord()
        {
            if (!string.IsNullOrEmpty(currentVideoPath) && wordsListBox.SelectedItem != null)
            {
                string word = (string)wordsListBox.SelectedItem;
                PlayTimeDuration duration = fileParsersManager.GetDuration(word);
                if (duration != null && duration.Start != null && duration.Stop != null)
                {
                    object presenterHolder = mainArea.Content;
                    mainArea.Content = videoPlayer;

                    videoPlayer.Play(duration);
                    mainArea.Content = presenterHolder;
                }
            }
        }

        private void pronounce_Click(object sender, RoutedEventArgs e)
        {
            SaySelectedWord();
        }

        private void SaySelectedWord()
        {
            if (string.IsNullOrEmpty(voiceComboBox.Text))
            {
                voiceComboBox.Text = voiceGalleryCategory.Items[0].ToString();
            }
            if (wordsListBox.SelectedItem != null && !string.IsNullOrEmpty(voiceComboBox.Text))
            {
                string word = (string)wordsListBox.SelectedItem;
                speechSynthesizer.SelectVoice(voiceComboBox.Text);
                speechSynthesizer.SpeakAsync(word);
            }
        }

        private void slidesShow_Click(object sender, RoutedEventArgs e)
        {
            //object temp = mainArea.Content;
            //mainArea.Content = null;

            //SlidesShowWindow slidesShowWindow = new SlidesShowWindow(temp, videoPlayer, speechSynthesizer);
            //slidesShowWindow.Show();

            //foreach (var word in wordsCollection)
            //{
            //    if (!slidesShowWindow.IsActive)
            //    {
            //        break;
            //    }
            //    RefreshExplanationPresenter();
            //    PlayTimeDuration duration = fileParsersManager.GetDuration(word);

            //    slidesShowWindow.ShowSlide(word, duration);
            //}

            //slidesShowWindow.Close();

            //mainArea.Content = temp;
            if (!keepPlaying)
            {
                keepPlaying = true;
                wordsCollection.ForEach(word =>
                {
                    if (!keepPlaying)
                    {
                        return;
                    }
                    wordsListBox.SelectedValue = word;
                    ExtensionMethods.WaitFor(1.5);
                    SaySelectedWord();
                    ExtensionMethods.WaitFor(1.5);
                    PlaySelectedWord();
                });
                keepPlaying = false;
            }
            else
            {
                keepPlaying = false;
            }
        }
    }
}
