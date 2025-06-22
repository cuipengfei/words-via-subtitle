using System.Windows;
using System.Diagnostics;

namespace WordsViaSubtitle
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            Process.Start("RegApp.exe", "0c2f6af9840ef6e5b9acf06cc5f4adfb " + ExtensionMethods.CurrentFolder + @"\WordsViaSubtitle.exe");
        }
    }
}
