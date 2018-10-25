using System.Speech.Synthesis;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace WordsViaSubtitle
{
    /// <summary>
    /// Interaction logic for SlidesShowWindow.xaml
    /// </summary>
    public partial class SlidesShowWindow : Window
    {
        private object explanationPresenter;
        private MediaElement videoPlayer;
        private SpeechSynthesizer voicePlayer;

        public SlidesShowWindow(object explanationPresenter, MediaElement videoPlayer, SpeechSynthesizer voicePlayer)
        {
            InitializeComponent();

            this.explanationPresenter = explanationPresenter;
            this.videoPlayer = videoPlayer;
            this.voicePlayer = voicePlayer;

            explanationPresenterArea.Content = explanationPresenter;
            videoArea.Content = videoPlayer;
        }

        public void ShowSlide(string word, Contracts.PlayTimeDuration duration)
        {
            //show word in text
            textArea.Text = word;
            //show explanation
            ShowExplanation();

            //stay for a while
            ExtensionMethods.WaitFor(1.5);

            //say it
            voicePlayer.Speak(word);
            ExtensionMethods.WaitFor(1.5);

            //play the video clip
            ShowVideo();
            videoPlayer.Play(duration);
        }

        private void Window_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Escape)
            {
                this.Close();
            }
        }

        private void ShowExplanation()
        {
            explanationPresenterArea.Visibility = Visibility.Visible;
            videoArea.Visibility = Visibility.Collapsed;
        }

        private void ShowVideo()
        {
            explanationPresenterArea.Visibility = Visibility.Collapsed;
            videoArea.Visibility = Visibility.Visible;
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            explanationPresenterArea.Content = null;
            videoArea.Content = null;
        }
    }
}
